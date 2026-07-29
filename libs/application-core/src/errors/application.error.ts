export type ApplicationErrorCode =
  | 'ALREADY_EXISTS'
  | 'FAILED_PRECONDITION'
  | 'INVALID_ARGUMENT'
  | 'NOT_FOUND'
  | 'UNAVAILABLE';

export class ApplicationError extends Error {
  constructor(
    public readonly code: ApplicationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = ApplicationError.name;
  }
}
