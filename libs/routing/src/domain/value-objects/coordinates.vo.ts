import { ValueObject } from '@app/shared-kernel';
import { ArgumentOutOfRangeException } from '@app/common';

export interface CoordinatesProps {
  lat: number;
  lng: number;
}

export class CoordinatesVO extends ValueObject<CoordinatesProps> {
  protected validate(props: CoordinatesProps): void {
    const { lat, lng } = props;

    if (lat < -90 || lat > 90) {
      throw new ArgumentOutOfRangeException('Latitude must be between -90 and 90');
    }

    if (lng < -180 || lng > 180) {
      throw new ArgumentOutOfRangeException('Longitude must be between -180 and 180');
    }
  }

  get lat(): number {
    return this.props.lat;
  }

  get lng(): number {
    return this.props.lng;
  }
}
