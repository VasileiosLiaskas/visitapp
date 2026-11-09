import { FlatList, StyleSheet, Text, View } from 'react-native';
import PlaceCard from '../components/PlaceCard';
import { Place } from '../types/Place';

type Props = {
  places: Place[];
  onDeletePlace: (place: Place) => void;
  onShowPlace: (place: Place) => void;
};

function PlacesScreen({ places, onDeletePlace, onShowPlace }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
        <Text style={styles.title}>My places</Text>
        <Text style={styles.subtitle}>
          {places.length === 1 ? '1 town saved' : `${places.length} towns saved`}
        </Text>
      </View>
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          places.length === 0 && styles.emptyListContent,
        ]}
        data={places}
        keyExtractor={place => String(place.id)}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptySymbol}>⌖</Text>
            </View>
            <Text style={styles.emptyTitle}>Your map is waiting</Text>
            <Text style={styles.emptyText}>
              Long-press a town on the map to save it to your travel journal.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onDelete={() => onDeletePlace(item)}
            onShowOnMap={() => onShowPlace(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F7F2',
    flex: 1,
  },
  header: {
    paddingBottom: 18,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  eyebrow: {
    color: '#287C67',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#21352E',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 3,
  },
  subtitle: {
    color: '#728078',
    fontSize: 14,
    marginTop: 5,
  },
  listContent: {
    paddingBottom: 18,
    paddingHorizontal: 18,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 42,
    paddingBottom: 60,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#E9F4EF',
    borderRadius: 27,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  emptySymbol: {
    color: '#287C67',
    fontSize: 38,
  },
  emptyTitle: {
    color: '#24372F',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 18,
  },
  emptyText: {
    color: '#728078',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    textAlign: 'center',
  },
});

export default PlacesScreen;
