import { Coordinates } from '../../application/ports/routing.service.port';

export class NominatimMapper {
  static toCoordinates(raw: any): Coordinates {
    return {
      lat: Number(raw.lat),
      lng: Number(raw.lon),
    };
  }

  static toSuggestions(results: any[]): string[] {
    return results.map((r) => r.display_name).filter(Boolean);
  }
}
