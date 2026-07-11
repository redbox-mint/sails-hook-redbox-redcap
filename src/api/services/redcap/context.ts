import { Context } from 'effect';
import type { RedcapConfigData } from '../../configmodels/RedcapAppConfig';
import type { IntegrationAuditContext } from './audit';
import type { RedcapHttpClient } from './http';

export interface RedcapRunContext {
  rdmpOid: string;
  brandId: string;
  brandName: string;
  username?: string;
  parentAudit: IntegrationAuditContext | null;
}
export const RedcapConfigTag = Context.GenericTag<RedcapConfigData>('redcap/Config');
export const RedcapRunContextTag = Context.GenericTag<RedcapRunContext>('redcap/RunContext');
export const RedcapHttpClientTag = Context.GenericTag<RedcapHttpClient>('redcap/HttpClient');
