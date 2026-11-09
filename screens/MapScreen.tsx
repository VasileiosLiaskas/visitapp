import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, {
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import AddPlaceModal from '../components/AddPlaceModal';
import { NewPlace, Place } from '../types/Place';
import { getCountryAtCoordinate } from '../utils/countries';
import { Coordinate } from '../types/Coordinate';
import { CityBoundary, LinearRing } from '../types/CityBoundary';

type Props = {
  places: Place[];
  focusedPlace: Place | null;
  onSavePlace: (place: NewPlace) => Promise<boolean>;
};

const DEFAULT_REGION: Region = {
  latitude: 49,
  longitude: 15,
  latitudeDelta: 43,
  longitudeDelta: 52,
};

function MapScreen({ places, focusedPlace, onSavePlace }: Props) {
  const mapRef = useRef<MapView>(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);
  const [suggestedCountry, setSuggestedCountry] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const cityBoundaries = useMemo(() => {
    const uniqueBoundaries = new Map<string, { placeId: number; boundary: CityBoundary }>();
    places.forEach(place => {
      if (place.cityBoundary) {
        const key = JSON.stringify(place.cityBoundary);
        if (!uniqueBoundaries.has(key)) {
          uniqueBoundaries.set(key, {
            placeId: place.id,
            boundary: place.cityBoundary,
          });
        }
      }
    });
    return [...uniqueBoundaries.values()];
  }, [places]);

  const initialRegion = places[0]
    ? {
        latitude: places[0].latitude,
        longitude: places[0].longitude,
        latitudeDelta: 8,
        longitudeDelta: 8,
      }
    : DEFAULT_REGION;

  useEffect(() => {
    if (focusedPlace) {
      mapRef.current?.animateToRegion(
        {
          latitude: focusedPlace.latitude,
          longitude: focusedPlace.longitude,
          latitudeDelta: 4,
          longitudeDelta: 4,
        },
        500,
      );
    }
  }, [focusedPlace]);

  function selectCoordinate(coordinate: Coordinate) {
    setSelectedCoordinate(coordinate);
    setSuggestedCountry(getCountryAtCoordinate(coordinate)?.properties.name ?? null);
    setIsFormVisible(true);
  }

  function openBoundaryAttribution() {
    Linking.openURL('https://www.openstreetmap.org/copyright').catch(() =>
      Alert.alert('Unable to open attribution link'),
    );
  }

  async function centerOnCurrentLocation() {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Location permission needed',
          'Allow location access to center the map on your current position.',
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapRef.current?.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        500,
      );
    } catch (error) {
      Alert.alert(
        'Location unavailable',
        error instanceof Error ? error.message : 'Unable to find your current location.',
      );
    }
  }

  async function saveSelectedPlace(name: string, country: string, notes: string) {
    if (!selectedCoordinate) {
      return false;
    }

    return onSavePlace({
      name,
      country,
      notes,
      latitude: selectedCoordinate.latitude,
      longitude: selectedCoordinate.longitude,
    });
  }

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={initialRegion}
        onLongPress={event => selectCoordinate(event.nativeEvent.coordinate)}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        ref={mapRef}
        style={StyleSheet.absoluteFill}
      >
        {cityBoundaries.flatMap(({ placeId, boundary }) =>
          getBoundaryPolygons(boundary).map((rings, index) => (
            <Polygon
              key={`${placeId}-${index}`}
              coordinates={toMapCoordinates(rings[0])}
              fillColor="rgba(22, 185, 87, 0.48)"
              holes={rings.slice(1).map(toMapCoordinates)}
              strokeColor="#FFFFFF"
              strokeWidth={1}
              zIndex={1}
            />
          )),
        )}
        {places.map(place => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            description={place.country ?? undefined}
            pinColor="#287C67"
          />
        ))}
        {selectedCoordinate ? (
          <Marker
            coordinate={selectedCoordinate}
            pinColor="#E29348"
            title="New place"
          />
        ) : null}
      </MapView>

      <View pointerEvents="box-none" style={styles.overlay}>
        <View style={styles.headerCard}>
          <View style={styles.heading}>
            <View>
              <Text style={styles.eyebrow}>YOUR TRAVEL JOURNAL</Text>
              <Text style={styles.title}>Places you’ve been</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.count}>{places.length}</Text>
            </View>
          </View>
          <Text style={styles.instruction}>
            Long-press to add a town. Available city outlines are shaded green.
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Center map on my location"
          onPress={centerOnCurrentLocation}
          style={styles.locationButton}
        >
          <Text style={styles.locationSymbol}>◎</Text>
        </Pressable>
        <Pressable onPress={openBoundaryAttribution} style={styles.attribution}>
          <Text style={styles.attributionText}>City boundaries © OpenStreetMap</Text>
        </Pressable>
      </View>

      <AddPlaceModal
        coordinate={selectedCoordinate}
        suggestedCountry={suggestedCountry}
        onClose={() => {
          setIsFormVisible(false);
          setSelectedCoordinate(null);
          setSuggestedCountry(null);
        }}
        onSave={saveSelectedPlace}
        visible={isFormVisible}
      />
    </View>
  );
}

function getBoundaryPolygons(boundary: CityBoundary): LinearRing[][] {
  return boundary.type === 'Polygon'
    ? [boundary.coordinates]
    : boundary.coordinates;
}

function toMapCoordinates(ring: LinearRing) {
  return ring.map(([longitude, latitude]) => ({ latitude, longitude }));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: 'rgba(226,232,225,0.9)',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#287C67',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    color: '#21352E',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 3,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#E9F4EF',
    borderRadius: 15,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  count: {
    color: '#287C67',
    fontSize: 16,
    fontWeight: '800',
  },
  instruction: {
    color: '#728078',
    fontSize: 13,
    marginTop: 9,
  },
  locationButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderColor: '#E8ECE7',
    borderRadius: 17,
    borderWidth: 1,
    elevation: 3,
    height: 52,
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 24,
    shadowColor: '#1C3228',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    width: 52,
  },
  locationSymbol: {
    color: '#287C67',
    fontSize: 28,
    lineHeight: 32,
  },
  attribution: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 5,
    marginBottom: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  attributionText: {
    color: '#34584B',
    fontSize: 10,
    textDecorationLine: 'underline',
  },
});

export default MapScreen;
