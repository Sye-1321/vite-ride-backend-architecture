import { RouteMetrics } from '../../application/ports/routing.service.port';

export class OsrmMapper {
  static toRouteMetrics(raw: any): RouteMetrics {
    const route = raw.routes[0];

    return {
      distance: {
        meters: route.distance,
        kilometers: Number((route.distance / 1000).toFixed(2)),
      },
      eta: {
        seconds: route.duration,
        minutes: Math.ceil(route.duration / 60),
      },
    };
  }
}
