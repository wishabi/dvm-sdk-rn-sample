import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import type { PublicationStatus } from '../utils/format';

const LABELS: Record<PublicationStatus, string> = {
  live: 'Live',
  preview: 'Preview',
  expired: 'Expired',
};

export function StatusBadge({ status }: { status: PublicationStatus }) {
  return (
    <View style={[styles.badge, styles[`${status}Badge`]]}>
      <Text style={[styles.text, styles[`${status}Text`]]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: { fontSize: 12, fontWeight: '600' },
  liveBadge: { backgroundColor: colors.liveBackground },
  liveText: { color: colors.liveText },
  previewBadge: { backgroundColor: colors.previewBackground },
  previewText: { color: colors.previewText },
  expiredBadge: { backgroundColor: colors.expiredBackground },
  expiredText: { color: colors.expiredText },
});
