import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { images } from '../assets';
import { colors, spacing } from '../theme';
import { IconButton } from './IconButton';

/**
 * The white app bar from the prototype: optional back arrow and centered
 * Flipp DVM logo. `children` (tabs, search) render inside the bar's white
 * area so they share its bottom border.
 */
export function AppHeader({
  onBack,
  children,
}: {
  onBack?: () => void;
  children?: ReactNode;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <IconButton name="back" label="Back" onPress={onBack} />
          ) : null}
        </View>
        <Image
          source={images.logo}
          style={styles.logo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Flipp DVM"
        />
        <View style={styles.side} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  side: { width: 44 },
  logo: { flex: 1, height: 36 },
});
