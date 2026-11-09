import { findCityBoundary } from './cityBoundaryLookup';
import { CityBoundary } from '../types/CityBoundary';

afterEach(() => {
  jest.restoreAllMocks();
});

const cityBoundary: CityBoundary = {
  type: 'Polygon',
  coordinates: [[
    [23, 37],
    [24, 37],
    [24, 38],
    [23, 38],
    [23, 37],
  ]],
};

test('returns an administrative boundary containing the selected city point', async () => {
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => [
      {
        lat: '37.98',
        lon: '23.73',
        category: 'boundary',
        type: 'administrative',
        geojson: cityBoundary,
      },
    ],
  } as Response);

  const result = await findCityBoundary(
    'Athens',
    'Greece',
    { latitude: 37.98, longitude: 23.73 },
  );

  expect(result).toEqual(cityBoundary);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(String(fetchMock.mock.calls[0][0])).toContain('Athens%2C%20Greece');
});
