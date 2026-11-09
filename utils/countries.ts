import countryData from '../data/countries.json';
import { Coordinate } from '../types/Coordinate';

type Position = [number, number];
type LinearRing = Position[];
type PolygonCoordinates = LinearRing[];

export type CountryGeometry =
  | { type: 'Polygon'; coordinates: PolygonCoordinates }
  | { type: 'MultiPolygon'; coordinates: PolygonCoordinates[] };

export type CountryFeature = {
  type: 'Feature';
  properties: { name: string };
  geometry: CountryGeometry;
};

const countries = countryData.features as CountryFeature[];

function ringContainsPoint(
  ring: LinearRing,
  longitude: number,
  latitude: number,
): boolean {
  let containsPoint = false;

  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const [currentLongitude, currentLatitude] = ring[current];
    const [previousLongitude, previousLatitude] = ring[previous];
    const crossesLatitude =
      currentLatitude > latitude !== previousLatitude > latitude;

    if (
      crossesLatitude &&
      longitude <
        ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude
    ) {
      containsPoint = !containsPoint;
    }
  }

  return containsPoint;
}

function polygonContainsPoint(
  polygon: PolygonCoordinates,
  longitude: number,
  latitude: number,
): boolean {
  const [outerRing, ...holes] = polygon;
  return (
    !!outerRing &&
    ringContainsPoint(outerRing, longitude, latitude) &&
    !holes.some(hole => ringContainsPoint(hole, longitude, latitude))
  );
}

function countryContainsPoint(
  country: CountryFeature,
  longitude: number,
  latitude: number,
): boolean {
  const { geometry } = country;
  return geometry.type === 'Polygon'
    ? polygonContainsPoint(geometry.coordinates, longitude, latitude)
    : geometry.coordinates.some(polygon =>
        polygonContainsPoint(polygon, longitude, latitude),
      );
}

export function getCountryAtCoordinate(coordinate: Coordinate): CountryFeature | null {
  return (
    countries.find(country =>
      countryContainsPoint(country, coordinate.longitude, coordinate.latitude),
    ) ?? null
  );
}
