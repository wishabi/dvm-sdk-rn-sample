import { Pressable, StyleSheet } from 'react-native';
import type { IconName } from '../assets';
import { colors } from '../theme';
import { Icon } from './Icon';

export function IconButton({
  name,
  label,
  onPress,
  color = colors.textMuted,
  size = 24,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
});
