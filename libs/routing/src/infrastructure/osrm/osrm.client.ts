import axios from 'axios';
import { Coordinates } from '../../application/ports/routing.service.port';

export class OsrmClient {
  private readonly baseUrl = 'https://router.project-osrm.org';

  async route(
    origin: Coordinates,
    destination: Coordinates,
  ): Promise<any> {
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${this.baseUrl}/route/v1/driving/${coords}`;

    const response = await axios.get(url, {
      params: { overview: false },
    });

    return response.data;
  }
}
