import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function PasswordsMatch(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'passwordsMatch',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          if (validationOptions?.message) {
            return validationOptions.message as string;
          }
          const [relatedPropertyName] = args.constraints as [string];
          return `${args.property} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}
