import { Duration, Effect, Ref, Schedule } from 'effect';
import type { RedcapConfigData } from '../../../config/redcap';
import type { RedcapRunContext } from './context';
import { RedcapDecodeError, RedcapHttpError, RedcapRequestTimeoutError, RedcapTransportError } from './errors';

export interface RedcapProject { project_id: number | string; project_title: string; project_notes?: string; [key: string]: unknown }
export interface RedcapHttpResult<T> { statusCode: number; data: T }
export interface RedcapHttpClient {
  project(token: string): Effect.Effect<RedcapHttpResult<RedcapProject>, RedcapTransportError|RedcapHttpError|RedcapDecodeError|RedcapRequestTimeoutError>;
  updateProjectSettings(token: string, projectNotes: string): Effect.Effect<RedcapHttpResult<unknown>, RedcapTransportError|RedcapHttpError|RedcapDecodeError|RedcapRequestTimeoutError>;
}
export function endpoint(config: RedcapConfigData): string {
  return new URL(config.connection.apiPath, config.connection.url.endsWith('/') ? config.connection.url : `${config.connection.url}/`).toString();
}
function retrySchedule(config: RedcapConfigData) {
  return Schedule.exponential(Duration.millis(config.connection.retry.baseDelayMs), 2).pipe(
    Schedule.either(Schedule.spaced(Duration.millis(config.connection.retry.maxDelayMs))),
    Schedule.jittered, Schedule.intersect(Schedule.recurs(Math.max(0, config.connection.retry.maxAttempts - 1)))
  );
}
export function makeLiveClient(config: RedcapConfigData, context: RedcapRunContext): RedcapHttpClient {
  const request = <T>(params: URLSearchParams): Effect.Effect<RedcapHttpResult<T>, RedcapTransportError|RedcapHttpError|RedcapDecodeError|RedcapRequestTimeoutError> =>
    Effect.gen(function* () {
      const attempt = yield* Ref.make(0);
      const once = Effect.gen(function* () {
        yield* Ref.update(attempt, n => n + 1);
        const response = yield* Effect.tryPromise({
          try: signal => fetch(endpoint(config), {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', Accept: 'application/json' },
            body: params.toString(), signal
          }),
          catch: cause => new RedcapTransportError({ message: 'Unable to contact REDCap.', status: 503, retryable: true, cause })
        });
        if (!response.ok) return yield* Effect.fail(new RedcapHttpError({
          message: response.status === 401 || response.status === 403
            ? 'Invalid REDCap project token or insufficient project access.' : 'REDCap rejected the request.',
          status: response.status === 401 || response.status === 403 ? 401 : 502,
          remoteStatus: response.status, retryable: config.connection.retry.retryOnStatusCodes.includes(response.status)
        }));
        const data = yield* Effect.tryPromise({ try: () => response.json() as Promise<T>, catch: cause =>
          new RedcapDecodeError({ message: 'REDCap returned an invalid response.', status: 502, cause }) });
        return { statusCode: response.status, data };
      }).pipe(Effect.timeoutFail({ duration: Duration.millis(config.connection.timeoutMs), onTimeout: () =>
        new RedcapRequestTimeoutError({ message: 'The REDCap request timed out.', status: 504 }) }));
      return yield* once.pipe(Effect.retry({ schedule: retrySchedule(config), while: error =>
        error._tag === 'RedcapTransportError' || error._tag === 'RedcapRequestTimeoutError' ||
        (error._tag === 'RedcapHttpError' && error.retryable) }));
    }).pipe(Effect.withSpan('redcap.http.request', { attributes: { rdmpOid: context.rdmpOid, endpoint: endpoint(config) } }));
  const base = (token: string, content: string) => new URLSearchParams({ token, content, format: 'json', returnFormat: 'json' });
  return {
    project: token => request<RedcapProject>(base(token, 'project')).pipe(Effect.filterOrFail(
      result => !!result.data && (typeof result.data.project_id === 'string' || typeof result.data.project_id === 'number') && typeof result.data.project_title === 'string',
      () => new RedcapDecodeError({ message: 'REDCap returned an invalid project response.', status: 502 })
    )),
    updateProjectSettings: (token, notes) => {
      const params = base(token, 'project_settings');
      params.set('data', JSON.stringify({ project_notes: notes }));
      return request(params);
    }
  };
}
