import axios from 'axios';

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export class NominatimClient {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';

  async search(query: string, viewbox?: string): Promise<NominatimResult[]> {
    const url = `${this.baseUrl}/search`;
    const response = await axios.get<NominatimResult[]>(url, {
      params: {
        q: query,
        format: 'json',
        limit: 5,
        bounded: viewbox ? 1 : 0,
        viewbox,
      },
      headers: {
        'User-Agent': 'vite-ride-routing/1.0',
      },
    });

    return response.data;
  }
}
