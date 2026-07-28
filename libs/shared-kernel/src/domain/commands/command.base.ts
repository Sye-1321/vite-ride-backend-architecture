import { randomUUID } from 'crypto';

export type CommandProps<T> = Omit<T, 'id'> & Partial<Command>;

export abstract class Command {
  readonly id: string;

  protected constructor(props: CommandProps<unknown>) {
    this.id = props.id ?? randomUUID();
  }
}
