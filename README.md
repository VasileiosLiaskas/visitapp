# Visited

Visited is an Expo app for keeping a personal map of towns you have visited. It has no account or sign-in: places are stored in the app's local SQLite database on the device. Saved places remain available offline; map tiles require an internet connection.

## Run the app

Install dependencies and start Expo:

```sh
npm install
npm start
```

Open the project in Expo Go on a device, or press `a` in the Expo terminal to launch an Android emulator. On macOS, press `i` to launch the iOS simulator. For native development builds, use `npm run android` or `npm run ios` (iOS builds require macOS).

## Save places

On the map, long-press the location of a town to add it. Enter its name and optionally a note; the country is detected from the selected coordinates. Saved towns appear as markers, and available city boundaries are shaded green. **My places** lists saved towns and lets you focus a town on the map or remove it. Use the location button to center the map on your current position. Location permission is requested only when you use that button.

## Map data and Android setup

Android displays Google Maps; iOS uses its native Apple map. City boundaries are looked up from OpenStreetMap's Nominatim service when a place is saved, then cached in SQLite for offline display. The lookup sends the town name and country, not the saved note or selected coordinates. If no boundary is available or the lookup fails, the town is still saved and shown with a pin.

City boundaries are attributed to OpenStreetMap in the app. The public Nominatim service is rate-limited and has no production availability guarantee; for a public release, use a hosted geocoding service or your own Nominatim instance. Country names are detected locally using bundled Natural Earth boundaries.

Expo Go includes a development map configuration. Standalone Android builds need a Google Maps API key. Set `GOOGLE_MAPS_API_KEY` before building; `app.config.js` reads it without storing it in source control. Rebuild the native app after adding or changing the key.
