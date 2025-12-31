import { DomainEvent, DomainEventProps } from "@app/shared-kernel";

export interface VerificationSessionWasCreatedEventProps {
  phoneNumber: string;
  otp: string;
  purpose: string;
}

export class VerificationSessionWasCreatedDomainEvent extends DomainEvent {
  readonly phoneNumber: string;
  readonly otp: string;
  readonly purpose: string;

  constructor(props: DomainEventProps<VerificationSessionWasCreatedEventProps>) {
    super(props);
    this.phoneNumber = props.phoneNumber;
    this.otp = props.otp;
    this.purpose = props.purpose;
  }
}
