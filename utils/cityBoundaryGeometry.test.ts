import { CityBoundary } from '../types/CityBoundary';
import { Coordinate } from '../types/Coordinate';
import {
  cityBoundaryContainsCoordinate,
  isCityBoundary,
} from './cityBoundaryGeometry';

const cityBoundary: CityBoundary = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
    [
      [4, 4],
      [6, 4],
      [6, 6],
      [4, 6],
      [4, 4],
    ],
  ],
};

test('validates city polygon GeoJSON', () => {
  expect(isCityBoundary(cityBoundary)).toBe(true);
  expect(isCityBoundary({ type: 'Point', coordinates: [0, 0] })).toBe(false);
});

test('checks city polygons and excludes polygon holes', () => {
  const insideCity: Coordinate = { latitude: 2, longitude: 2 };
  const insideHole: Coordinate = { latitude: 5, longitude: 5 };
  const outsideCity: Coordinate = { latitude: 12, longitude: 12 };

  expect(cityBoundaryContainsCoordinate(cityBoundary, insideCity)).toBe(true);
  expect(cityBoundaryContainsCoordinate(cityBoundary, insideHole)).toBe(false);
  expect(cityBoundaryContainsCoordinate(cityBoundary, outsideCity)).toBe(false);
});
