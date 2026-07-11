import type { RedcapController as RedcapControllerExports } from './RedcapController';
export type HookRedboxControllers = { RedcapController: RedcapControllerExports };
const cache: Partial<HookRedboxControllers> = {};
export const ControllerExports = { get RedcapController(): RedcapControllerExports {
  return cache.RedcapController ??= require('./RedcapController') as RedcapControllerExports;
} };
