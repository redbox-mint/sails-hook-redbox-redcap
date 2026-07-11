import type { RedcapService as RedcapServiceExports } from './RedcapService';
export type HookRedboxServices = { RedcapService: RedcapServiceExports };
const cache: Partial<HookRedboxServices> = {};
export const ServiceExports = { get RedcapService(): RedcapServiceExports {
  return cache.RedcapService ??= require('./RedcapService') as RedcapServiceExports;
} };
