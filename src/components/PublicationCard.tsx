import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Publication, RenderType } from '@flipp/dvm-sdk-native';
import { CARD_RENDER_TYPES, RENDER_TYPE_LABELS } from '../config/renderTypes';
import { colors, radius, spacing } from '../theme';
import { formatValidity, publicationStatus } from '../utils/format';
import { Icon } from './Icon';
import { StatusBadge } from './StatusBadge';

/**
 * A publication row: cover, Live/Preview badge, name, copyable global id,
 * validity, and one button per render type (greyed out when the publication
 * does not support it).
 */
export function PublicationCard({
  publication,
  onOpen,
  onCopyId,
}: {
  publication: Publication;
  onOpen: (publication: Publication, renderType: RenderType) => void;
  onCopyId: (globalId: string) => void;
}) {
  const name = publication.details?.name ?? '(unnamed publication)';
  const imageUrl =
    publication.details?.imageUrl ?? publication.details?.backgroundImageUrl;
  const validity = formatValidity(publication.dates);
  // An empty renderingTypes list is an error state: show no render buttons.
  const supported = publication.renderingTypes;
  const renderTypes: RenderType[] = [
    ...CARD_RENDER_TYPES,
    ...(supported.includes('sfml_horizontal')
      ? ['sfml_horizontal' as const]
      : []),
  ];

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`${name} cover image`}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>No image</Text>
          </View>
        )}
        <View style={styles.details}>
          <StatusBadge status={publicationStatus(publication)} />
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <View style={styles.idRow}>
            <View style={styles.idText}>
              <Text style={styles.meta}>Global ID:</Text>
              <Text numberOfLines={1} style={styles.id}>
                {publication.globalId}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Copy global ID"
              onPress={() => onCopyId(publication.globalId)}
              hitSlop={12}
              style={styles.copy}
            >
              <Icon name="copy" size={16} color={colors.text} />
            </Pressable>
          </View>
          {validity ? (
            <Text style={styles.validity}>Validity: {validity}</Text>
          ) : null}
        </View>
      </View>

      {supported.length === 0 ? (
        <View style={styles.footer}>
          <Text style={styles.noRenderTypes}>No supported render types</Text>
        </View>
      ) : (
        <View style={styles.footer}>
          {renderTypes.map((renderType, index) => {
            const enabled = supported.includes(renderType);
            return (
              <Pressable
                key={renderType}
                accessibilityRole="button"
                accessibilityLabel={`Open as ${RENDER_TYPE_LABELS[renderType]}`}
                accessibilityState={{ disabled: !enabled }}
                disabled={!enabled}
                onPress={() => onOpen(publication, renderType)}
                style={[styles.action, index > 0 && styles.actionDivider]}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.actionText, !enabled && styles.actionDisabled]}
                >
                  {RENDER_TYPE_LABELS[renderType]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  body: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  image: {
    width: 88,
    height: 112,
    borderRadius: 4,
    backgroundColor: colors.imageBackdrop,
  },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { fontSize: 11, color: colors.placeholder },
  details: { flex: 1, gap: spacing.xs },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  idRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  idText: { flex: 1 },
  meta: { fontSize: 13, color: colors.text },
  id: { fontSize: 13, color: colors.text },
  copy: { padding: 2 },
  validity: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  action: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  actionDivider: { borderLeftWidth: 1, borderLeftColor: colors.divider },
  actionText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  actionDisabled: { color: colors.border },
  noRenderTypes: {
    flex: 1,
    minHeight: 48,
    textAlignVertical: 'center',
    textAlign: 'center',
    paddingVertical: spacing.md,
    fontSize: 13,
    color: colors.danger,
  },
});
