import { Injectable } from '@nestjs/common';
import { Coordinates, RouteMetrics, RoutingServicePort } from '../application/ports';
import { NominatimClient, NominatimMapper } from './nominatim';
import { OsrmClient, OsrmMapper } from './osrm';


@Injectable()
export class RoutingService implements RoutingServicePort {
  private readonly nominatim = new NominatimClient();
  private readonly osrm = new OsrmClient();

  async geocodeAddress(address: string): Promise<Coordinates> {
    const results = await this.nominatim.search(address);
    if (!results.length) {
      throw new Error('Address not found');
    }
    return NominatimMapper.toCoordinates(results[0]);
  }

  async autocomplete(input: string): Promise<string[]> {
    const results = await this.nominatim.search(input);
    return NominatimMapper.toSuggestions(results);
  }

  async calculateRoute(
    origin: Coordinates,
    destination: Coordinates,
  ): Promise<RouteMetrics> {
    const raw = await this.osrm.route(origin, destination);
    if (raw.code !== 'Ok') {
      throw new Error('Route calculation failed');
    }
    return OsrmMapper.toRouteMetrics(raw);
  }
}
