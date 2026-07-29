export type TenantsErrorKind =
  | 'ALREADY_EXISTS'
  | 'FAILED_PRECONDITION'
  | 'INVALID_ARGUMENT'
  | 'NOT_FOUND';

export class TenantsApplicationError extends Error {
  constructor(
    public readonly kind: TenantsErrorKind,
    message: string,
  ) {
    super(message);
    this.name = TenantsApplicationError.name;
  }
}

export function requiredText(value: string, field: string, max = 128): string {
  const normalized = value?.trim();
  if (!normalized || normalized.length > max) {
    throw new TenantsApplicationError(
      'INVALID_ARGUMENT',
      `${field} must contain between 1 and ${max} characters`,
    );
  }
  return normalized;
}
