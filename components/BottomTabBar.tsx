import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AppTab = 'map' | 'places';

type Props = {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
};

function BottomTabBar({ activeTab, onChangeTab }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <TabButton
        label="Map"
        symbol="⌖"
        selected={activeTab === 'map'}
        onPress={() => onChangeTab('map')}
      />
      <TabButton
        label="My places"
        symbol="▤"
        selected={activeTab === 'places'}
        onPress={() => onChangeTab('places')}
      />
    </View>
  );
}

type TabButtonProps = {
  label: string;
  symbol: string;
  selected: boolean;
  onPress: () => void;
};

function TabButton({ label, symbol, selected, onPress }: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.tab}
    >
      <Text style={[styles.symbol, selected && styles.selectedText]}>{symbol}</Text>
      <Text style={[styles.label, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E8ECE7',
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingTop: 8,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    paddingVertical: 3,
  },
  symbol: {
    color: '#87938D',
    fontSize: 21,
    height: 24,
  },
  label: {
    color: '#87938D',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedText: {
    color: '#287C67',
  },
});

export default BottomTabBar;
