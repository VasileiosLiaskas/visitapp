const appJson = require('./app.json');

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
const plugins = [...appJson.expo.plugins];

if (googleMapsApiKey) {
  plugins.push([
    'react-native-maps',
    { androidGoogleMapsApiKey: googleMapsApiKey },
  ]);
}

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    plugins,
  },
};
