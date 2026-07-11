import type { IntegrationOutcomeMapper } from '@researchdatabox/redbox-core';
import { Cause, Effect, Exit } from 'effect';

export const REDCAP_INTEGRATION_NAME = 'redcap';
export const RedcapAuditAction = {
  validateProject: 'validateProject', redcapProjectRequest: 'redcapProjectRequest',
  linkProject: 'linkProject', redcapProjectSettingsUpdate: 'redcapProjectSettingsUpdate',
  workspaceCreate: 'workspaceCreate', associateWorkspace: 'associateWorkspace'
} as const;
export type RedcapAuditAction = typeof RedcapAuditAction[keyof typeof RedcapAuditAction];
export interface IntegrationAuditContext {
  redboxOid: string; traceId: string; spanId: string; parentSpanId?: string;
  [key: string]: unknown;
}
interface AuditService {
  startAudit(oid: string, action: string, options?: Record<string, unknown>): IntegrationAuditContext;
  completeAudit(context: IntegrationAuditContext, result?: Record<string, unknown>): void;
  failAudit(context: IntegrationAuditContext, error: unknown, details?: Record<string, unknown>): void;
  registerOutcomeMapper?(name: string, mapper: IntegrationOutcomeMapper): void;
}
export function getAuditService(): AuditService | undefined {
  const g = globalThis as { IntegrationAuditService?: AuditService; sails?: { services?: Record<string, unknown> } };
  const service = g.IntegrationAuditService ?? g.sails?.services?.integrationauditservice as AuditService | undefined;
  return service && typeof service.startAudit === 'function' ? service : undefined;
}
export function startAudit(oid: string, action: RedcapAuditAction, options: {
  brandId?: string; username?: string; parent?: IntegrationAuditContext | null;
  requestSummary?: Record<string, unknown>;
} = {}): IntegrationAuditContext | null {
  try {
    return getAuditService()?.startAudit(oid, action, {
      integrationName: REDCAP_INTEGRATION_NAME, brandId: options.brandId,
      triggeredBy: options.username, requestSummary: options.requestSummary,
      traceId: options.parent?.traceId, parentSpanId: options.parent?.spanId
    }) ?? null;
  } catch { return null; }
}
export function completeAudit(context: IntegrationAuditContext | null, result: Record<string, unknown> = {}): void {
  try { if (context) getAuditService()?.completeAudit(context, result); } catch { /* best effort */ }
}
export function failAudit(context: IntegrationAuditContext | null, error: unknown, details: Record<string, unknown> = {}): void {
  try { if (context) getAuditService()?.failAudit(context, error, details); } catch { /* best effort */ }
}
export function withRedcapAudit<A, E, R>(oid: string, action: RedcapAuditAction, options: {
  brandId?: string; username?: string; parent?: IntegrationAuditContext | null;
  requestSummary?: Record<string, unknown>; onSuccess?: (value: A) => Record<string, unknown>;
} = {}) {
  return (effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> => Effect.suspend(() => {
    const audit = startAudit(oid, action, options);
    return effect.pipe(Effect.onExit(exit => Effect.sync(() => {
      if (Exit.isSuccess(exit)) completeAudit(audit, options.onSuccess?.(exit.value) ?? {});
      else failAudit(audit, Exit.isInterrupted(exit) ? 'interrupted' : Cause.squash(exit.cause));
    })));
  });
}
const outcome = (state: string, severity: 'none'|'in-progress'|'success'|'error', help = false) => ({
  state, severity, labelKey: `@integration-status-outcome-redcap-${state}`,
  helpKey: help ? '@integration-status-outcome-redcap-error-help' : undefined
});
export const mapRedcapOutcome: IntegrationOutcomeMapper = summary => {
  if (summary.status === 'none') return outcome('none', 'none');
  if (summary.status === 'started') return outcome('in-progress', 'in-progress');
  if (summary.status === 'failed') return outcome('error', 'error', true);
  if (summary.status === 'success') {
    return outcome(summary.integrationAction === RedcapAuditAction.validateProject ? 'validated' : 'provisioned', 'success');
  }
  return undefined;
};
export function registerRedcapOutcomeMapper(): boolean {
  try { const service = getAuditService(); service?.registerOutcomeMapper?.(REDCAP_INTEGRATION_NAME, mapRedcapOutcome); return !!service; }
  catch { return false; }
}
