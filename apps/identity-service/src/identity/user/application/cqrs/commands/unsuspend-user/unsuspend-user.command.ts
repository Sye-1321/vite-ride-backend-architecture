import { ICommand } from '@nestjs/cqrs';

export class UnsuspendUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
  ) {}
}
