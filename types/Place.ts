import { CityBoundary } from './CityBoundary';

export type Place = {
  id: number;
  name: string;
  country: string | null;
  notes: string | null;
  latitude: number;
  longitude: number;
  visitedAt: string;
  cityBoundary: CityBoundary | null;
};

export type NewPlace = Omit<Place, 'id' | 'visitedAt' | 'cityBoundary'> & {
  cityBoundary?: CityBoundary | null;
};
