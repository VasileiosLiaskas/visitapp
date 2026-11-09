import { CityBoundary, LinearRing, PolygonCoordinates, Position } from '../types/CityBoundary';
import { Coordinate } from '../types/Coordinate';

function isPosition(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    Number.isFinite(value[0]) &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[1])
  );
}

function isLinearRing(value: unknown): value is LinearRing {
  return Array.isArray(value) && value.length >= 4 && value.every(isPosition);
}

function isPolygonCoordinates(value: unknown): value is PolygonCoordinates {
  return Array.isArray(value) && value.length > 0 && value.every(isLinearRing);
}

export function isCityBoundary(value: unknown): value is CityBoundary {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const geometry = value as { type?: unknown; coordinates?: unknown };
  if (geometry.type === 'Polygon') {
    return isPolygonCoordinates(geometry.coordinates);
  }

  return (
    geometry.type === 'MultiPolygon' &&
    Array.isArray(geometry.coordinates) &&
    geometry.coordinates.length > 0 &&
    geometry.coordinates.every(isPolygonCoordinates)
  );
}

function ringContainsCoordinate(
  ring: LinearRing,
  longitude: number,
  latitude: number,
): boolean {
  let contains = false;

  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const [currentLongitude, currentLatitude] = ring[current];
    const [previousLongitude, previousLatitude] = ring[previous];

    if (
      (currentLatitude > latitude) !== (previousLatitude > latitude) &&
      longitude <
        ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude
    ) {
      contains = !contains;
    }
  }

  return contains;
}

function polygonContainsCoordinate(
  polygon: PolygonCoordinates,
  longitude: number,
  latitude: number,
): boolean {
  const [outerRing, ...holes] = polygon;
  return (
    !!outerRing &&
    ringContainsCoordinate(outerRing, longitude, latitude) &&
    !holes.some(hole => ringContainsCoordinate(hole, longitude, latitude))
  );
}

export function cityBoundaryContainsCoordinate(
  boundary: CityBoundary,
  coordinate: Coordinate,
): boolean {
  const polygons =
    boundary.type === 'Polygon' ? [boundary.coordinates] : boundary.coordinates;

  return polygons.some(polygon =>
    polygonContainsCoordinate(polygon, coordinate.longitude, coordinate.latitude),
  );
}
