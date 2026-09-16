import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

/** Single-select list with radio indicators, as in the prototype's pickers. */
export function RadioList<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly RadioOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <View accessibilityRole="radiogroup">
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: isSelected }}
            onPress={() => onSelect(option.value)}
            style={styles.row}
          >
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected ? <View style={styles.dot} /> : null}
            </View>
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  label: { fontSize: 16, color: colors.text },
});
