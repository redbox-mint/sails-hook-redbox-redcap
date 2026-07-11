import { Controllers as CoreControllers } from '@researchdatabox/redbox-core';
import type { RedcapProject } from '../services/redcap/http';
import { errorDescription, errorHttpStatus, type RedcapError } from '../services/redcap/errors';

interface RedcapServiceContract {
  project(rdmpOid: string | undefined, token: string, user?: { username?: string }): Promise<unknown>;
  link(rdmpOid: string, project: RedcapProject, token: string, user?: { username?: string }): Promise<unknown>;
}
declare const RedcapService: RedcapServiceContract;
function tokenValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof (value as { token?: unknown }).token === 'string') return (value as { token: string }).token;
  return '';
}
function serviceError(error: unknown): { message: string; status: number } {
  if (error && typeof error === 'object' && '_tag' in error && 'status' in error) return { message: errorDescription(error as RedcapError), status: errorHttpStatus(error as RedcapError) };
  return { message: 'Unexpected REDCap integration failure.', status: 500 };
}
export namespace Controllers {
  export class Redcap extends CoreControllers.Core.Controller {
    protected override _exportedMethods = ['project', 'link'];
    async project(req: Sails.Req, res: Sails.Res): Promise<unknown> {
      try {
        const token = tokenValue(req.param('token')); const rdmp = String(req.param('rdmp') ?? '').trim() || undefined;
        const result = await RedcapService.project(rdmp, token, req.user);
        return this.ajaxOk(req, res, '', result);
      } catch (error) {
        const safe = serviceError(error); res.status(safe.status);
        return this.ajaxFail(req, res, safe.message, { status: false, message: safe.message });
      }
    }
    async link(req: Sails.Req, res: Sails.Res): Promise<unknown> {
      try {
        const rdmp = String(req.param('rdmp') ?? '').trim(); const token = tokenValue(req.param('token'));
        const project = req.param('workspace') as unknown as RedcapProject;
        const result = await RedcapService.link(rdmp, project, token, req.user);
        return this.ajaxOk(req, res, '', result);
      } catch (error) {
        const safe = serviceError(error); res.status(safe.status);
        return this.ajaxFail(req, res, safe.message, { status: false, message: safe.message,
          linked: safe.status === 409, partial: Boolean((error as { partial?: boolean })?.partial) });
      }
    }
  }
}
export type RedcapController = ReturnType<Controllers.Redcap['exports']>;
export const RedcapController: RedcapController = new Controllers.Redcap().exports();
module.exports = RedcapController;
