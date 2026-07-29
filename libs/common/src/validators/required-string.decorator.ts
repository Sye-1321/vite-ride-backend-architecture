import { IsDefined, IsString, IsNotEmpty, ValidationOptions } from 'class-validator';

export function RequiredString(validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    IsDefined(validationOptions)(target, propertyName);
    IsString(validationOptions)(target, propertyName);
    IsNotEmpty(validationOptions)(target, propertyName);
  };
}
