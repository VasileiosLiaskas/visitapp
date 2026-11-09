import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar, { AppTab } from './components/BottomTabBar';
import MapScreen from './screens/MapScreen';
import PlacesScreen from './screens/PlacesScreen';
import {
  deletePlace,
  initializePlacesDatabase,
  listPlaces,
  savePlace,
  updatePlaceCityBoundary,
} from './services/placesDatabase';
import { findCityBoundary } from './services/cityBoundaryLookup';
import { NewPlace, Place } from './types/Place';
import { Coordinate } from './types/Coordinate';

function VisitApp() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('map');
  const [focusedPlace, setFocusedPlace] = useState<Place | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      try {
        await initializePlacesDatabase();
        const savedPlaces = await listPlaces();
        if (isMounted) {
          setPlaces(savedPlaces);
          setIsReady(true);
        }
      } catch (error) {
        if (isMounted) {
          setStartupError(
            error instanceof Error ? error.message : 'Unable to open your places database.',
          );
        }
      }
    }

    loadPlaces();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSavePlace(place: NewPlace): Promise<boolean> {
    try {
      const savedPlace = await savePlace(place);
      setPlaces(currentPlaces => [savedPlace, ...currentPlaces]);
      loadCityBoundary(savedPlace);
      return true;
    } catch (error) {
      Alert.alert(
        'Could not save place',
        error instanceof Error ? error.message : 'Please try again.',
      );
      return false;
    }
  }

  async function loadCityBoundary(place: Place) {
    try {
      const coordinate: Coordinate = {
        latitude: place.latitude,
        longitude: place.longitude,
      };
      const cityBoundary = await findCityBoundary(
        place.name,
        place.country,
        coordinate,
      );

      if (!cityBoundary) {
        Alert.alert(
          'City outline not found',
          `${place.name} was saved with a map pin, but no city boundary was found.`,
        );
        return;
      }

      await updatePlaceCityBoundary(place.id, cityBoundary);
      setPlaces(currentPlaces =>
        currentPlaces.map(currentPlace =>
          currentPlace.id === place.id
            ? { ...currentPlace, cityBoundary }
            : currentPlace,
        ),
      );
    } catch (error) {
      Alert.alert(
        'City outline unavailable',
        `${place.name} was saved with a map pin. ${
          error instanceof Error ? error.message : 'The boundary lookup failed.'
        }`,
      );
    }
  }

  function handleDeletePlace(place: Place) {
    Alert.alert('Remove this place?', `Remove ${place.name} from your visited places?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          deletePlace(place.id)
            .then(() =>
              setPlaces(currentPlaces =>
                currentPlaces.filter(currentPlace => currentPlace.id !== place.id),
              ),
            )
            .catch(error =>
              Alert.alert(
                'Could not remove place',
                error instanceof Error ? error.message : 'Please try again.',
              ),
            );
        },
      },
    ]);
  }

  function handleShowPlace(place: Place) {
    setFocusedPlace(place);
    setActiveTab('map');
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {!isReady ? (
          <View style={styles.centered}>
            {startupError ? (
              <>
                <Text style={styles.errorTitle}>Your places could not be loaded</Text>
                <Text style={styles.errorMessage}>{startupError}</Text>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color="#287C67" />
                <Text style={styles.loadingText}>Opening your travel journal…</Text>
              </>
            )}
          </View>
        ) : (
          <>
            <View style={styles.content}>
              {activeTab === 'map' ? (
                <MapScreen
                  places={places}
                  focusedPlace={focusedPlace}
                  onSavePlace={handleSavePlace}
                />
              ) : (
                <PlacesScreen
                  places={places}
                  onDeletePlace={handleDeletePlace}
                  onShowPlace={handleShowPlace}
                />
              )}
            </View>
            <BottomTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F2',
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: '#52635D',
    fontSize: 15,
    marginTop: 16,
  },
  errorTitle: {
    color: '#21352E',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#68766F',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default VisitApp;
