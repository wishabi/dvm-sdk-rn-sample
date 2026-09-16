import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Offer } from '@flipp/dvm-sdk-native';
import { colors, spacing } from '../theme';
import {
  formatOriginalPrice,
  formatPrice,
  formatValidity,
  offerImageUrl,
  offerSku,
} from '../utils/format';
import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './PrimaryButton';

/**
 * The prototype's "Item Details" sheet for a tapped or looked-up offer, plus
 * the clip toggle that drives the publication's "clipped" annotation when a
 * handler is supplied.
 */
export function ItemDetailsSheet({
  offer,
  clipped = false,
  onToggleClipped,
  onDismiss,
}: {
  offer: Offer | null;
  clipped?: boolean;
  onToggleClipped?: (offer: Offer) => void;
  onDismiss: () => void;
}) {
  return (
    <BottomSheet
      visible={offer !== null}
      onDismiss={onDismiss}
      tall
      grabber
      header={<Text style={styles.title}>Item Details</Text>}
    >
      {offer ? (
        <OfferBody
          offer={offer}
          clipped={clipped}
          onToggleClipped={onToggleClipped}
        />
      ) : null}
    </BottomSheet>
  );
}

function OfferBody({
  offer,
  clipped,
  onToggleClipped,
}: {
  offer: Offer;
  clipped: boolean;
  onToggleClipped?: (offer: Offer) => void;
}) {
  const name = offer.details?.name ?? '(unnamed offer)';
  const imageUrl = offerImageUrl(offer);
  const price = formatPrice(offer.pricing);
  const original = formatOriginalPrice(offer.pricing);
  const validity = formatValidity(offer.dates);
  const sku = offerSku(offer);
  const story =
    offer.offerDetails?.saleStory ?? offer.offerDetails?.prePriceText;
  const description = [
    offer.details?.description,
    offer.offerDetails?.postPriceText,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={`${name} image`}
        />
      ) : null}
      <Text style={styles.name}>{name}</Text>
      {price ? (
        <Text style={styles.price}>
          {price}
          {original ? <Text style={styles.original}> {original}</Text> : null}
        </Text>
      ) : null}
      {story ? <Text style={styles.story}>{story}</Text> : null}
      {validity ? <Text style={styles.validity}>Valid: {validity}</Text> : null}

      {description || sku ? (
        <View style={styles.section}>
          <Text style={styles.heading}>Description</Text>
          {description ? <Text style={styles.body}>{description}</Text> : null}
          {sku ? <Text style={styles.body}>SKU: {sku}</Text> : null}
        </View>
      ) : null}
      {offer.offerDetails?.disclaimer ? (
        <Text style={styles.disclaimer}>{offer.offerDetails.disclaimer}</Text>
      ) : null}
      <Text style={styles.disclaimer}>{offer.globalId}</Text>

      {onToggleClipped ? (
        <PrimaryButton
          label={clipped ? 'Unclip offer' : 'Clip offer'}
          variant={clipped ? 'secondary' : 'primary'}
          onPress={() => onToggleClipped(offer)}
          style={styles.clip}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  image: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    marginVertical: spacing.md,
  },
  name: { fontSize: 16, fontWeight: '500', color: colors.text },
  price: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.price,
    marginTop: spacing.md,
  },
  original: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  story: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  validity: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  section: { marginTop: spacing.lg, gap: spacing.xs },
  heading: { fontSize: 17, fontWeight: '700', color: colors.text },
  body: { fontSize: 13, color: colors.text, lineHeight: 18 },
  disclaimer: { fontSize: 12, color: colors.textMuted, marginTop: spacing.md },
  clip: { marginTop: spacing.xl },
});
