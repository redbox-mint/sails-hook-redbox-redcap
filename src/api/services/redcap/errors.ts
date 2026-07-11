import { Data } from 'effect';

type SafeErrorFields = { message: string; status: number; cause?: unknown; partial?: boolean };
export class InvalidRequestError extends Data.TaggedError('InvalidRequestError')<SafeErrorFields> {}
export class BrandResolutionError extends Data.TaggedError('BrandResolutionError')<SafeErrorFields> {}
export class RedcapConfigError extends Data.TaggedError('RedcapConfigError')<SafeErrorFields> {}
export class RdmpLookupError extends Data.TaggedError('RdmpLookupError')<SafeErrorFields> {}
export class RedcapTransportError extends Data.TaggedError('RedcapTransportError')<SafeErrorFields & { retryable: boolean }> {}
export class RedcapHttpError extends Data.TaggedError('RedcapHttpError')<SafeErrorFields & { remoteStatus: number; retryable: boolean }> {}
export class RedcapDecodeError extends Data.TaggedError('RedcapDecodeError')<SafeErrorFields> {}
export class RedcapRequestTimeoutError extends Data.TaggedError('RedcapRequestTimeoutError')<SafeErrorFields> {}
export class RedcapTotalTimeoutError extends Data.TaggedError('RedcapTotalTimeoutError')<SafeErrorFields> {}
export class WorkspaceCreationError extends Data.TaggedError('WorkspaceCreationError')<SafeErrorFields> {}
export class WorkspaceAssociationError extends Data.TaggedError('WorkspaceAssociationError')<SafeErrorFields> {}
export class InterruptedExecutionError extends Data.TaggedError('InterruptedExecutionError')<SafeErrorFields> {}
export class UnexpectedRedcapError extends Data.TaggedError('UnexpectedRedcapError')<SafeErrorFields> {}

export type RedcapError = InvalidRequestError | BrandResolutionError | RedcapConfigError |
  RdmpLookupError | RedcapTransportError | RedcapHttpError | RedcapDecodeError |
  RedcapRequestTimeoutError | RedcapTotalTimeoutError | WorkspaceCreationError |
  WorkspaceAssociationError | InterruptedExecutionError | UnexpectedRedcapError;

export const errorDescription = (error: RedcapError): string => error.message;
export const errorHttpStatus = (error: RedcapError): number => error.status;
export function safeCause(cause: unknown): string {
  return cause instanceof Error ? cause.message.replace(/[A-Fa-f0-9]{24,}/g, '[redacted]') : 'Unexpected integration failure';
}
