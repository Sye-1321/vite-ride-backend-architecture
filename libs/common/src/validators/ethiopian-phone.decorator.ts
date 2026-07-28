import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

const regex = /^\+2519\d{8}$/;

export function IsEthiopianPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEthiopianPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          if (validationOptions?.message) {
            return validationOptions.message as string;
          }
          return `${args.property} must start with +251 followed by 9 digits`;
        },
      },
    });
  };
}
