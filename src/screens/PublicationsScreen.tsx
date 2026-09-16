import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { Publication, RenderType } from '@flipp/dvm-sdk-native';
import { AppHeader } from '../components/AppHeader';
import { PublicationCard } from '../components/PublicationCard';
import { SearchBar } from '../components/SearchBar';
import { colors, spacing } from '../theme';
import { formatValidity } from '../utils/format';
import type { SearchResult } from './SearchScreen';

const COPIED_TOAST_MS = 1500;

function matches(publication: Publication, query: string): boolean {
  const haystack = [
    publication.details?.name,
    publication.globalId,
    formatValidity(publication.dates),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

/** The publications returned by a search, filterable by name, id, or validity. */
export function PublicationsScreen({
  result,
  onOpen,
  onBack,
}: {
  result: SearchResult;
  onOpen: (publication: Publication, renderType: RenderType) => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_TOAST_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const normalized = query.trim().toLowerCase();
  const publications = useMemo(
    () =>
      normalized
        ? result.publications.filter((p) => matches(p, normalized))
        : result.publications,
    [result.publications, normalized]
  );

  const count = publications.length;
  const heading = normalized
    ? `${count} Publication${count === 1 ? '' : 's'} match your search`
    : `${count} Publication${count === 1 ? '' : 's'} from ${result.scopeLabel}`;

  const copyId = (globalId: string) => {
    void Clipboard.setStringAsync(globalId);
    setCopied(true);
  };

  return (
    <View style={styles.container}>
      <AppHeader onBack={onBack}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search by Publication, Global ID or Validity"
        />
      </AppHeader>

      <FlatList
        data={publications}
        keyExtractor={(item) => item.globalId}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headingRow}>
            <Text style={styles.heading}>{heading}</Text>
            {copied ? (
              <Text accessibilityLiveRegion="polite" style={styles.copied}>
                Copied
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {normalized
              ? 'No publications match your search.'
              : 'No publications were returned for this query.'}
          </Text>
        }
        renderItem={({ item }) => (
          <PublicationCard
            publication={item}
            onOpen={onOpen}
            onCopyId={copyId}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: 48 },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heading: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.text },
  copied: { fontSize: 13, fontWeight: '600', color: colors.liveText },
  empty: { color: colors.textSecondary, fontSize: 14 },
});
