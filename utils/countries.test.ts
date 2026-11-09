import { getCountryAtCoordinate } from './countries';

test('detects the country containing a saved city coordinate', () => {
  expect(
    getCountryAtCoordinate({ latitude: 37.9838, longitude: 23.7275 })
      ?.properties.name,
  ).toBe('Greece');
});

test('does not detect a country for a point in the ocean', () => {
  expect(
    getCountryAtCoordinate({ latitude: 0, longitude: -140 }),
  ).toBeNull();
});
