import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Icon } from './Icon';

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.container}>
      <Icon name="search" size={20} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          hitSlop={8}
          style={styles.clear}
        >
          <Icon name="close" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 },
  clear: { padding: spacing.xs },
});
