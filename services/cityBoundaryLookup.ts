import { CityBoundary } from '../types/CityBoundary';
import { Coordinate } from '../types/Coordinate';
import {
  cityBoundaryContainsCoordinate,
  isCityBoundary,
} from '../utils/cityBoundaryGeometry';

type BoundaryCandidate = {
  latitude: number;
  longitude: number;
  category: string | null;
  type: string | null;
  boundary: CityBoundary | null;
};

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseCandidate(value: unknown): BoundaryCandidate | null {
  if (!isRecord(value)) {
    return null;
  }

  const latitude = Number(value.lat);
  const longitude = Number(value.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const boundary = isRecord(value.geojson) && isCityBoundary(value.geojson)
    ? value.geojson
    : null;

  return {
    latitude,
    longitude,
    category: typeof value.category === 'string' ? value.category : null,
    type: typeof value.type === 'string' ? value.type : null,
    boundary,
  };
}

async function searchCity(query: string): Promise<BoundaryCandidate[]> {
  const request = requestQueue.then(async () => {
    const wait = Math.max(1000 - (Date.now() - lastRequestAt), 0);
    if (wait > 0) {
      await new Promise<void>(resolve => setTimeout(resolve, wait));
    }
    lastRequestAt = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const url =
        'https://nominatim.openstreetmap.org/search' +
        `?format=jsonv2&polygon_geojson=1&limit=5&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'VisitedMobileApp/1.0',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`City boundary lookup failed (HTTP ${response.status}).`);
      }

      const results: unknown = await response.json();
      if (!Array.isArray(results)) {
        throw new Error('City boundary service returned an invalid response.');
      }

      return results
        .map(parseCandidate)
        .filter((candidate): candidate is BoundaryCandidate => candidate !== null);
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error('City boundary lookup timed out.');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  });

  requestQueue = request.then(
    () => undefined,
    () => undefined,
  );
  return request;
}

export async function findCityBoundary(
  name: string,
  country: string | null,
  coordinate: Coordinate,
): Promise<CityBoundary | null> {
  const suffix = country?.trim() ? `, ${country.trim()}` : '';
  const queries = [
    `${name.trim()}${suffix}`,
    `Municipality of ${name.trim()}${suffix}`,
  ];

  for (const query of queries) {
    const candidates = await searchCity(query);
    const matchingBoundaries = candidates
      .filter(
        candidate =>
          candidate.category === 'boundary' &&
          candidate.type === 'administrative' &&
          candidate.boundary !== null &&
          cityBoundaryContainsCoordinate(candidate.boundary, coordinate),
      )
      .sort(
        (first, second) =>
          Math.abs(first.latitude - coordinate.latitude) +
          Math.abs(first.longitude - coordinate.longitude) -
          (Math.abs(second.latitude - coordinate.latitude) +
            Math.abs(second.longitude - coordinate.longitude)),
      );

    if (matchingBoundaries[0]?.boundary) {
      return matchingBoundaries[0].boundary;
    }
  }

  return null;
}
