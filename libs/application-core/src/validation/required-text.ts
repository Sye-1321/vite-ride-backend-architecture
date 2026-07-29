import { ApplicationError } from '../errors';

export function requiredText(value: string, field: string, maximumLength = 255): string {
  const normalized = value.trim();
  if (!normalized || normalized.length > maximumLength) {
    throw new ApplicationError(
      'INVALID_ARGUMENT',
      `${field} must contain between 1 and ${maximumLength} characters`,
    );
  }
  return normalized;
}
