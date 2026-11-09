import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { NewPlace, Place } from '../types/Place';
import { CityBoundary } from '../types/CityBoundary';
import { isCityBoundary } from '../utils/cityBoundaryGeometry';

type PlaceRow = {
  id: number;
  name: string;
  country: string | null;
  notes: string | null;
  latitude: number;
  longitude: number;
  visited_at: string;
  city_boundary: string | null;
};

let databasePromise: Promise<SQLiteDatabase> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync('visited-places.db').catch(error => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

export async function initializePlacesDatabase() {
  const database = await getDatabase();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT,
      notes TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      visited_at TEXT NOT NULL,
      city_boundary TEXT
    );
  `);

  const columns = await database.getAllAsync<{ name: string }>(
    'PRAGMA table_info(places)',
  );
  if (!columns.some(column => column.name === 'city_boundary')) {
    await database.execAsync('ALTER TABLE places ADD COLUMN city_boundary TEXT;');
  }
}

function parseCityBoundary(value: string | null): CityBoundary | null {
  if (!value) {
    return null;
  }

  const boundary: unknown = JSON.parse(value);
  if (!isCityBoundary(boundary)) {
    throw new Error('A saved city boundary has invalid data.');
  }
  return boundary;
}

export async function listPlaces(): Promise<Place[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<PlaceRow>(
    'SELECT id, name, country, notes, latitude, longitude, visited_at, city_boundary FROM places ORDER BY visited_at DESC, id DESC',
  );

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    country: row.country,
    notes: row.notes,
    latitude: row.latitude,
    longitude: row.longitude,
    visitedAt: row.visited_at,
    cityBoundary: parseCityBoundary(row.city_boundary),
  }));
}

export async function savePlace(place: NewPlace): Promise<Place> {
  const database = await getDatabase();
  const visitedAt = new Date().toISOString();
  const normalizedPlace = {
    ...place,
    name: place.name.trim(),
    country: place.country?.trim() || null,
    notes: place.notes?.trim() || null,
    cityBoundary: place.cityBoundary ?? null,
  };
  const result = await database.runAsync(
    'INSERT INTO places (name, country, notes, latitude, longitude, visited_at, city_boundary) VALUES (?, ?, ?, ?, ?, ?, ?)',
    normalizedPlace.name,
    normalizedPlace.country,
    normalizedPlace.notes,
    normalizedPlace.latitude,
    normalizedPlace.longitude,
    visitedAt,
    normalizedPlace.cityBoundary ? JSON.stringify(normalizedPlace.cityBoundary) : null,
  );

  return { ...normalizedPlace, id: result.lastInsertRowId, visitedAt };
}

export async function updatePlaceCityBoundary(
  id: number,
  cityBoundary: CityBoundary,
) {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE places SET city_boundary = ? WHERE id = ?',
    JSON.stringify(cityBoundary),
    id,
  );
}

export async function deletePlace(id: number) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM places WHERE id = ?', id);
}
