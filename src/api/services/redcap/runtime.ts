import { Layer, Logger, LogLevel } from 'effect';
import type { RedcapConfigData } from '../../../config/redcap';
import { RedcapConfigTag, RedcapHttpClientTag, RedcapRunContextTag, type RedcapRunContext } from './context';
import { makeLiveClient } from './http';

const sailsLogger = Logger.make(({ logLevel, message, annotations }) => {
  const log = (globalThis as { sails?: { log?: Record<string, (...args: unknown[]) => void> } }).sails?.log;
  if (!log) return;
  const text = `${Array.isArray(message) ? message.join(' ') : String(message)} ${Array.from(annotations).map(([k,v]) => `${k}=${String(v)}`).join(' ')}`.trim();
  if (logLevel === LogLevel.Error || logLevel === LogLevel.Fatal) log.error?.(text);
  else if (logLevel === LogLevel.Warning) log.warn?.(text); else log.verbose?.(text);
});
export const sailsLoggerLayer = Logger.replace(Logger.defaultLogger, sailsLogger);
export function makeRuntimeLayer(config: RedcapConfigData, context: RedcapRunContext) {
  return Layer.mergeAll(Layer.succeed(RedcapConfigTag, config), Layer.succeed(RedcapRunContextTag, context),
    Layer.succeed(RedcapHttpClientTag, makeLiveClient(config, context)), sailsLoggerLayer);
}
