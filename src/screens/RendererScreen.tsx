import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  FlippPublication,
  RENDER_TYPES,
  type FlippPublicationHandle,
  type Offer,
  type Publication,
  type PublicationInfo,
  type RenderType,
} from '@flipp/dvm-sdk-native';
import { AppHeader } from '../components/AppHeader';
import { ItemDetailsSheet } from '../components/ItemDetailsSheet';
import { Tabs } from '../components/Tabs';
import { CLIPPED_ANNOTATION } from '../config/annotations';
import type { Language } from '../config/languages';
import { RENDER_TYPE_LABELS } from '../config/renderTypes';
import { colors, spacing } from '../theme';
import { formatValidity } from '../utils/format';

/**
 * Renders one publication full-bleed under a tab per supported render type.
 * Tapped offers open the Item Details sheet, whose clip toggle badges the
 * offer via annotations; external links open in the browser.
 */
export function RendererScreen({
  publication,
  publicationInfo,
  language,
  initialRenderType,
  onBack,
}: {
  publication: Publication;
  publicationInfo: PublicationInfo;
  language: Language;
  initialRenderType: RenderType;
  onBack: () => void;
}) {
  const supportedTypes =
    publication.renderingTypes.length > 0
      ? publication.renderingTypes
      : RENDER_TYPES;
  const [renderType, setRenderType] = useState<RenderType>(initialRenderType);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const publicationRef = useRef<FlippPublicationHandle>(null);
  const [tappedOffer, setTappedOffer] = useState<Offer | null>(null);
  const [clippedIds, setClippedIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const toggleClipped = (offer: Offer) => {
    const next = new Set(clippedIds);
    if (next.has(offer.globalId)) {
      next.delete(offer.globalId);
      publicationRef.current?.removeAnnotations(CLIPPED_ANNOTATION.type, [
        offer.globalId,
      ]);
    } else {
      next.add(offer.globalId);
      publicationRef.current?.addAnnotations(CLIPPED_ANNOTATION.type, [
        offer.globalId,
      ]);
    }
    setClippedIds(next);
  };

  const validity = formatValidity(publication.dates);

  return (
    <View style={styles.container}>
      <AppHeader onBack={onBack}>
        <View style={styles.titleBlock}>
          <Text numberOfLines={1} style={styles.title}>
            {publication.details?.name ?? publication.globalId}
          </Text>
          {validity ? (
            <Text style={styles.subtitle}>Valid: {validity}</Text>
          ) : null}
        </View>
        <Tabs
          options={supportedTypes.map((value) => ({
            value,
            label: RENDER_TYPE_LABELS[value],
          }))}
          selected={renderType}
          onSelect={(value) => {
            setRenderType(value);
            setLoaded(false);
            setError(undefined);
          }}
        />
      </AppHeader>

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <View style={styles.publication}>
        <FlippPublication
          ref={publicationRef}
          publicationId={publication.globalId}
          publicationInfo={publicationInfo}
          renderType={renderType}
          language={language}
          onLoad={() => {
            setLoaded(true);
            // Annotation types are per session: re-register on every load and
            // re-apply what the user already clipped (e.g. after a render-type switch).
            publicationRef.current?.registerAnnotations([CLIPPED_ANNOTATION]);
            if (clippedIds.size > 0) {
              publicationRef.current?.addAnnotations(CLIPPED_ANNOTATION.type, [
                ...clippedIds,
              ]);
            }
          }}
          onError={({ error: err }) => setError(`${err.code}: ${err.message}`)}
          onExternalLinkPress={({ url }) => {
            Linking.openURL(url).catch(() => setError(`Could not open ${url}`));
          }}
          longPressDurationMs={500}
          onOfferPress={({ offer }) => setTappedOffer(offer)}
          onOfferLongPress={({ offer }) => {
            if (offer) setTappedOffer(offer);
          }}
          onOfferPressError={({ error: err }) => setError(err.message)}
        />
        {!loaded && !error ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : null}
      </View>

      <ItemDetailsSheet
        offer={tappedOffer}
        clipped={tappedOffer ? clippedIds.has(tappedOffer.globalId) : false}
        onToggleClipped={toggleClipped}
        onDismiss={() => setTappedOffer(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  titleBlock: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  error: {
    fontSize: 13,
    color: colors.danger,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  publication: { flex: 1, backgroundColor: colors.surface },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
