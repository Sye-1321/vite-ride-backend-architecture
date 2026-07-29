import { Coordinates } from '../../application/ports/routing.service.port';
import { NominatimResult } from './nominatim.client';

export class NominatimMapper {
  static toCoordinates(raw: NominatimResult): Coordinates {
    return {
      lat: Number(raw.lat),
      lng: Number(raw.lon),
    };
  }

  static toSuggestions(results: NominatimResult[]): string[] {
    return results.map((r) => r.display_name).filter(Boolean);
  }
}
