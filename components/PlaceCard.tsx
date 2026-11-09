import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Place } from '../types/Place';

type Props = {
  place: Place;
  onDelete: () => void;
  onShowOnMap: () => void;
};

function PlaceCard({ place, onDelete, onShowOnMap }: Props) {
  const visitedDate = new Date(place.visitedAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.pin}>
          <Text style={styles.pinText}>⌖</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text numberOfLines={1} style={styles.name}>
            {place.name}
          </Text>
          {place.country ? <Text style={styles.country}>{place.country}</Text> : null}
        </View>
        <Pressable accessibilityLabel={`Remove ${place.name}`} onPress={onDelete} hitSlop={8}>
          <Text style={styles.remove}>×</Text>
        </Pressable>
      </View>
      {place.notes ? <Text style={styles.notes}>{place.notes}</Text> : null}
      <View style={styles.footer}>
        <Text style={styles.date}>Visited {visitedDate}</Text>
        <Pressable onPress={onShowOnMap} style={styles.mapButton}>
          <Text style={styles.mapButtonText}>Show on map</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8ECE7',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  pin: {
    alignItems: 'center',
    backgroundColor: '#E9F4EF',
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    width: 42,
  },
  pinText: {
    color: '#287C67',
    fontSize: 21,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    color: '#24372F',
    fontSize: 17,
    fontWeight: '700',
  },
  country: {
    color: '#728078',
    fontSize: 13,
    marginTop: 2,
  },
  remove: {
    color: '#9BA69F',
    fontSize: 25,
    lineHeight: 27,
    paddingHorizontal: 4,
  },
  notes: {
    color: '#52635D',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: '#EEF1ED',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
  },
  date: {
    color: '#89958E',
    fontSize: 12,
  },
  mapButton: {
    backgroundColor: '#F0F6F2',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  mapButtonText: {
    color: '#287C67',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default PlaceCard;
