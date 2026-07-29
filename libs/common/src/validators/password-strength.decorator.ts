import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function PasswordStrength(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'passwordStrength',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          return regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          if (validationOptions?.message) return validationOptions.message as string;
          return `${args.property} must be at least 8 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character`;
        },
      },
    });
  };
}
