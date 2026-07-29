export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceResult {
  meters: number;
  kilometers: number;
}

export interface EtaResult {
  seconds: number;
  minutes: number;
}

export interface RouteMetrics {
  distance: DistanceResult;
  eta: EtaResult;
}

export interface RoutingServicePort {
  geocodeAddress(address: string): Promise<Coordinates>;

  autocomplete(input: string): Promise<string[]>;

  calculateRoute(origin: Coordinates, destination: Coordinates): Promise<RouteMetrics>;
}
