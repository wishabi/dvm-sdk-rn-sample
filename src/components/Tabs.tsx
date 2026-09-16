import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

export interface TabOption<T extends string> {
  value: T;
  label: string;
}

/** Underlined tab strip; the selected tab is blue with a 3pt underline. */
export function Tabs<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly TabOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(option.value)}
            style={[styles.tab, isSelected && styles.tabSelected]}
          >
            <Text
              numberOfLines={1}
              style={[styles.label, isSelected && styles.labelSelected]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: colors.surface },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabSelected: { borderBottomColor: colors.primary },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  labelSelected: { color: colors.primary },
});
