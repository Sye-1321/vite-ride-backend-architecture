import { ArgumentNotProvidedException } from '@app/common/exceptions';
import { ValueObject } from '@app/shared-kernel';
import { UserVerificationPurpose } from '../../user/application/types';


export interface VerificationSessionKeyProps {
  purpose: UserVerificationPurpose;
  verificationToken: string;
}

export class VerificationSessionKey extends ValueObject<VerificationSessionKeyProps> {
  get purpose(): UserVerificationPurpose {
    return this.props.purpose;
  }

  get verificationToken(): string {
    return this.props.verificationToken;
  }

  protected validate(props: VerificationSessionKeyProps): void {
    if (!props.purpose) {
      throw new ArgumentNotProvidedException('purpose cannot be empty');
    }

    if (!props.verificationToken) {
      throw new ArgumentNotProvidedException('verificationToken cannot be empty');
    }
  }

  equals(other: VerificationSessionKey): boolean {
    return (
      this.props.purpose === other.props.purpose &&
      this.props.verificationToken === other.props.verificationToken
    );
  }

  static create(props: VerificationSessionKeyProps): VerificationSessionKey {
    return new VerificationSessionKey(props);
  }

  static rehydrate(props: VerificationSessionKeyProps): VerificationSessionKey {
    console.log(props.purpose, "purpose");
    console.log(props.verificationToken, "verificationToken");
    return new VerificationSessionKey(props);
  }
}
