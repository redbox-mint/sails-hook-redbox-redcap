import { Services as CoreServices } from '@researchdatabox/redbox-core';
import { Cause, Duration, Effect, Exit, Fiber } from 'effect';
import { REDCAP_CONFIG_KEY, RedcapAppConfig, type RedcapConfigData } from '../configmodels/RedcapAppConfig';
import { completeAudit, failAudit, RedcapAuditAction, registerRedcapOutcomeMapper, startAudit, withRedcapAudit, type IntegrationAuditContext } from './redcap/audit';
import { RedcapConfigTag, RedcapHttpClientTag, RedcapRunContextTag, type RedcapRunContext } from './redcap/context';
import { BrandResolutionError, InvalidRequestError, RdmpLookupError, RedcapConfigError, RedcapDecodeError, RedcapTotalTimeoutError, WorkspaceAssociationError, WorkspaceCreationError, errorDescription, type RedcapError } from './redcap/errors';
import { endpoint, type RedcapHttpResult, type RedcapProject } from './redcap/http';
import { makeRuntimeLayer } from './redcap/runtime';

export interface ProjectLookupResult { status: boolean; linked?: boolean; project?: RedcapProject; message?: string }
export interface LinkResult { status: boolean; message: string; linked?: boolean; partial?: boolean }
interface RecordData { metadata?: Record<string, unknown>; metaMetadata?: { brandId?: string; [key: string]: unknown }; authorization?: unknown; [key: string]: unknown }
interface Brand { id?: string; name?: string }
declare const RecordsService: { getMeta(oid: string): Promise<RecordData>; create(brand: Brand, record: RecordData, recordType: unknown, user: unknown): Promise<unknown> };
declare const BrandingService: { getBrandById(id: string): Brand | undefined };
declare const WorkspaceService: { addWorkspaceToRecord(rdmpOid: string, workspaceOid: string): Promise<unknown> };
declare const RecordTypesService: { get(brand: Brand, type: string): { toPromise(): Promise<Record<string, unknown>> } };
declare const WorkflowStepsService: { get(recordType: unknown, stage: string): { toPromise(): Promise<Record<string, unknown>> }; getFirst(recordType: unknown): { toPromise(): Promise<Record<string, unknown>> } };

function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' ? value as Record<string, unknown> : {}; }
function successful(value: unknown): boolean {
  const record = object(value); return typeof record.isSuccessful === 'function' ? Boolean((record.isSuccessful as () => boolean)()) : record.status !== false;
}
function oidOf(value: unknown): string { const r = object(value); return String(r.oid ?? object(r.data).oid ?? ''); }
function merge<T>(base: T, override: unknown): T {
  if (!base || typeof base !== 'object' || Array.isArray(base) || !override || typeof override !== 'object' || Array.isArray(override)) return (override === undefined ? base : override) as T;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) result[key] = merge(result[key], value);
  return result as T;
}

export namespace Services {
  export class Redcap extends CoreServices.Core.Service {
    protected override _exportedMethods = ['project', 'link', 'init'];
    private readonly inFlight = new Set<Fiber.RuntimeFiber<unknown, RedcapError>>();

    init(): void {
      this.registerSailsHook('on', 'ready', () => {
        if (!registerRedcapOutcomeMapper()) this.logger.warn('REDCap audit service is unavailable; continuing without outcome mapping.');
      });
      this.registerSailsHook('on', 'lower', () => { void this.interruptInFlight(); });
    }

    async project(rdmpOid: string | undefined, token: string, user?: { username?: string }): Promise<ProjectLookupResult> {
      this.validateToken(token);
      let record: RecordData | undefined;
      let resolved: { brand: Brand; brandId: string; brandName: string; config: RedcapConfigData };
      if (rdmpOid) {
        record = await this.loadRdmp(rdmpOid);
        resolved = this.resolveForRecord(rdmpOid, record);
      } else {
        resolved = this.resolveTokenOnlyConfig();
      }
      const parent = rdmpOid ? startAudit(rdmpOid, RedcapAuditAction.validateProject, {
        brandId: resolved.brandId, username: user?.username,
        requestSummary: { rdmpOid, brandId: resolved.brandId, brandName: resolved.brandName, endpoint: this.safeEndpoint(resolved.config) }
      }) : null;
      const context: RedcapRunContext = { rdmpOid: rdmpOid ?? '', brandId: resolved.brandId, brandName: resolved.brandName, username: user?.username, parentAudit: parent };
      const program = Effect.gen(function* () {
        const client = yield* RedcapHttpClientTag;
        const config = yield* RedcapConfigTag;
        const result = yield* client.project(token).pipe(withRedcapAudit(rdmpOid ?? '', RedcapAuditAction.redcapProjectRequest, {
          brandId: context.brandId, username: context.username, parent,
          requestSummary: { endpoint: endpoint(config) }, onSuccess: response => ({ httpStatusCode: response.statusCode,
            projectId: response.data.project_id, projectTitle: response.data.project_title })
        }));
        return { result, linked: String(result.data.project_notes ?? '').includes(config.notesHeader) };
      }).pipe(Effect.timeoutFail({ duration: Duration.millis(resolved.config.connection.totalTimeoutMs), onTimeout: () =>
        new RedcapTotalTimeoutError({ message: 'REDCap validation timed out.', status: 504 }) }),
        Effect.provide(makeRuntimeLayer(resolved.config, context)), Effect.withSpan('redcap.project'));
      const exit = await this.runTracked(program);
      if (Exit.isSuccess(exit)) {
        const response = { status: true, linked: exit.value.linked, project: exit.value.result.data };
        completeAudit(parent, { projectId: exit.value.result.data.project_id, projectTitle: exit.value.result.data.project_title, linked: exit.value.linked });
        return response;
      }
      throw this.concludeFailure(parent, exit);
    }

    async link(rdmpOid: string, project: RedcapProject, token: string, user?: { username?: string }): Promise<LinkResult> {
      if (!rdmpOid || !project || project.project_id == null || !project.project_title) throw new InvalidRequestError({ message: 'rdmp, project and token are required.', status: 400 });
      this.validateToken(token);
      const rdmp = await this.loadRdmp(rdmpOid);
      const resolved = this.resolveForRecord(rdmpOid, rdmp);
      if (String(project.project_notes ?? '').includes(resolved.config.notesHeader)) throw new InvalidRequestError({
        message: `Project has already been linked to an RDMP, see '${resolved.config.notesHeader}' in the Notes section.`, status: 409
      });
      const parent = startAudit(rdmpOid, RedcapAuditAction.linkProject, { brandId: resolved.brandId, username: user?.username,
        requestSummary: { rdmpOid, brandId: resolved.brandId, brandName: resolved.brandName, projectId: project.project_id } });
      const context: RedcapRunContext = { rdmpOid, brandId: resolved.brandId, brandName: resolved.brandName, username: user?.username, parentAudit: parent };
      const program = this.linkProgram(rdmp, resolved.brand, project, token, user, context).pipe(
        Effect.timeoutFail({ duration: Duration.millis(resolved.config.connection.totalTimeoutMs), onTimeout: () =>
          new RedcapTotalTimeoutError({ message: 'REDCap linking timed out.', status: 504, partial: true }) }),
        Effect.provide(makeRuntimeLayer(resolved.config, context)), Effect.withSpan('redcap.link'));
      const exit = await this.runTracked(program);
      if (Exit.isSuccess(exit)) { completeAudit(parent, { workspaceOid: exit.value }); return { status: true, message: 'workspaceRecordCreated' }; }
      throw this.concludeFailure(parent, exit);
    }

    private linkProgram(rdmp: RecordData, brand: Brand, project: RedcapProject, token: string, user: { username?: string } | undefined, context: RedcapRunContext) {
      return Effect.gen(this, function* () {
        const config = yield* RedcapConfigTag; const client = yield* RedcapHttpClientTag;
        const oldNotes = String(project.project_notes ?? '').trim();
        const notes = `${oldNotes}${oldNotes ? ' ' : ''}${config.notesHeader}: ${context.rdmpOid}.`;
        yield* client.updateProjectSettings(token, notes).pipe(withRedcapAudit(context.rdmpOid, RedcapAuditAction.redcapProjectSettingsUpdate, {
          brandId: context.brandId, username: context.username, parent: context.parentAudit,
          requestSummary: { endpoint: endpoint(config), projectId: project.project_id }, onSuccess: r => ({ httpStatusCode: r.statusCode })
        }));
        const workspace = yield* Effect.tryPromise({ try: () => this.createWorkspace(rdmp, brand, project, config, user), catch: cause =>
          new WorkspaceCreationError({ message: 'REDCap was updated, but the ReDBox workspace could not be created.', status: 500, cause, partial: true })
        }).pipe(withRedcapAudit(context.rdmpOid, RedcapAuditAction.workspaceCreate, { brandId: context.brandId, username: context.username, parent: context.parentAudit }));
        const oid = oidOf(workspace); if (!oid) return yield* Effect.fail(new WorkspaceCreationError({ message: 'REDCap was updated, but ReDBox did not return a workspace identifier.', status: 500, partial: true }));
        yield* Effect.tryPromise({ try: () => WorkspaceService.addWorkspaceToRecord(context.rdmpOid, oid), catch: cause =>
          new WorkspaceAssociationError({ message: 'REDCap and the workspace were updated, but association with the plan failed.', status: 500, cause, partial: true })
        }).pipe(Effect.filterOrFail(successful, () => new WorkspaceAssociationError({ message: 'REDCap and the workspace were updated, but association with the plan failed.', status: 500, partial: true })),
          withRedcapAudit(context.rdmpOid, RedcapAuditAction.associateWorkspace, { brandId: context.brandId, username: context.username, parent: context.parentAudit }));
        return oid;
      });
    }

    private async createWorkspace(rdmp: RecordData, brand: Brand, project: RedcapProject, config: RedcapConfigData, user?: { username?: string }): Promise<unknown> {
      const username = user?.username ?? ''; const recordType = await RecordTypesService.get(brand, config.workspace.recordType).toPromise();
      const step = config.workspace.workflowStage ? await WorkflowStepsService.get(recordType, config.workspace.workflowStage).toPromise() : await WorkflowStepsService.getFirst(recordType).toPromise();
      const stepConfig = object(step.config); const authorization = object(stepConfig.authorization);
      const record: RecordData = {
        metaMetadata: { brandId: String(brand.id), createdBy: username, type: config.workspace.recordType,
          packageType: recordType.packageType as string, packageName: recordType.packageName as string,
          form: object(stepConfig).form as string },
        authorization: { view: [username], edit: [username], viewRoles: authorization.viewRoles ?? [], editRoles: authorization.editRoles ?? [] },
        workflow: object(stepConfig.workflow),
        metadata: { rdmpOid: contextValue(rdmp, 'oid'), rdmpTitle: String(rdmp.metadata?.title ?? ''), redcap_id: project.project_id,
          title: project.project_title, location: new URL(`${config.connection.redcapVersion}/index.php?pid=${encodeURIComponent(String(project.project_id))}`, config.connection.url.endsWith('/') ? config.connection.url : `${config.connection.url}/`).toString(),
          description: config.workspace.description, type: config.workspace.recordType }
      };
      const created = await RecordsService.create(brand, record, recordType, user); if (!successful(created)) throw new Error('Workspace creation failed'); return created;
    }

    private validateToken(token: string): void { if (!token || !token.trim()) throw new InvalidRequestError({ message: 'A REDCap project token is required.', status: 400 }); }
    private async loadRdmp(oid: string): Promise<RecordData> { try { const record = await RecordsService.getMeta(oid); if (!record || Object.keys(record).length === 0) throw new Error('not found'); (record as Record<string, unknown>).oid ??= oid; return record; }
      catch (cause) { throw new RdmpLookupError({ message: `Failed to find RDMP: ${oid}, please contact an administrator.`, status: 404, cause }); } }
    private resolveForRecord(oid: string, record: RecordData) {
      const brandId = String(record.metaMetadata?.brandId ?? ''); if (!brandId) throw new BrandResolutionError({ message: 'The RDMP has no brand identifier.', status: 400 });
      const brand = BrandingService.getBrandById(brandId); if (!brand?.name) throw new BrandResolutionError({ message: `Unknown RDMP brand '${brandId}'.`, status: 400 });
      return { brand, brandId, brandName: String(brand.name), config: this.brandConfig(oid, String(brand.name)) };
    }
    private brandConfig(oid: string, brandName: string): RedcapConfigData {
      const aware = (sails.config as unknown as { brandingAware?: (name: string) => Record<string, unknown> }).brandingAware;
      let value: unknown; try { value = aware?.(brandName)?.[REDCAP_CONFIG_KEY]; } catch { value = undefined; }
      if (!value) throw new RedcapConfigError({ message: `REDCap Application Configuration is missing for brand '${brandName}'.`, status: 503 });
      const config = merge(new RedcapAppConfig() as RedcapConfigData, value); this.validateConfig(oid, config); return config;
    }
    private resolveTokenOnlyConfig() {
      const value = (sails.config as unknown as Record<string, unknown>)[REDCAP_CONFIG_KEY];
      if (!value) throw new RedcapConfigError({ message: 'REDCap token-only validation routing is not configured.', status: 503 });
      const config = merge(new RedcapAppConfig() as RedcapConfigData, value); this.validateConfig('', config);
      return { brand: {}, brandId: '', brandName: '', config };
    }
    private validateConfig(oid: string, config: RedcapConfigData): void {
      if (!config.enabled) throw new RedcapConfigError({ message: 'REDCap integration is disabled for this brand.', status: 503 });
      try { const url = new URL(config.connection.url); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); } catch { throw new RedcapConfigError({ message: 'REDCap URL must be absolute.', status: 500 }); }
      const r = config.connection.retry; if (config.connection.timeoutMs <= 0 || config.connection.totalTimeoutMs <= 0 || !Number.isInteger(r.maxAttempts) || r.maxAttempts < 1 || r.baseDelayMs < 0 || r.maxDelayMs < 0 || !config.notesHeader.trim())
        throw new RedcapConfigError({ message: `Invalid REDCap Application Configuration for '${oid}'.`, status: 500 });
    }
    private safeEndpoint(config: RedcapConfigData): string { const url = new URL(endpoint(config)); return `${url.host}${url.pathname}`; }
    private async runTracked<A>(program: Effect.Effect<A, RedcapError, never>): Promise<Exit.Exit<A, RedcapError>> {
      const fiber = Effect.runFork(program); this.inFlight.add(fiber); try { return await Effect.runPromise(Fiber.await(fiber)); } finally { this.inFlight.delete(fiber); }
    }
    private concludeFailure(parent: IntegrationAuditContext | null, exit: Exit.Exit<unknown, RedcapError>): RedcapError {
      if (Exit.isInterrupted(exit)) { const error = new RedcapTotalTimeoutError({ message: 'REDCap operation was interrupted.', status: 503 }); failAudit(parent, error); return error; }
      if (Exit.isFailure(exit)) {
        const failure = Cause.failureOption(exit.cause); if (failure._tag === 'Some') {
          const typed = failure.value as RedcapError; failAudit(parent, typed, { message: errorDescription(typed), partial: typed.partial }); return typed;
        }
        const error = new RedcapDecodeError({ message: 'Unexpected REDCap integration failure.', status: 500, cause: Cause.squash(exit.cause) }); failAudit(parent, error); return error;
      }
      return new RedcapDecodeError({ message: 'Unexpected REDCap integration failure.', status: 500 });
    }
    private async interruptInFlight(): Promise<void> { await Promise.all([...this.inFlight].map(f => Effect.runPromise(Fiber.interrupt(f)))); }
  }
}
function contextValue(record: RecordData, key: string): unknown { return record[key] ?? record.metaMetadata?.[key as 'brandId']; }
export type RedcapService = ReturnType<Services.Redcap['exports']>;
export const RedcapService: RedcapService = new Services.Redcap().exports();
module.exports = RedcapService;
