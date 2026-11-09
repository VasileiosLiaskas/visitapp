export type Position = [number, number];
export type LinearRing = Position[];
export type PolygonCoordinates = LinearRing[];

export type CityBoundary =
  | { type: 'Polygon'; coordinates: PolygonCoordinates }
  | { type: 'MultiPolygon'; coordinates: PolygonCoordinates[] };
