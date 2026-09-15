import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  useDvmClient,
  type Publication,
  type PublicationInfo,
} from '@flipp/dvm-sdk-native';
import { AppHeader } from '../components/AppHeader';
import { PickerField } from '../components/PickerField';
import { PrimaryButton } from '../components/PrimaryButton';
import { Tabs } from '../components/Tabs';
import { TextField } from '../components/TextField';
import { COUNTRY_OPTIONS, type CountryCode } from '../config/countries';
import { LANGUAGE_OPTIONS, type Language } from '../config/languages';
import { usePublicationsSearch } from '../hooks/usePublicationsSearch';
import { colors, spacing } from '../theme';

export type SearchMode = 'store' | 'location';

/** Form state, owned by App so it survives navigating to the list and back. */
export interface SearchForm {
  mode: SearchMode;
  merchantId: string;
  storeCode: string;
  countryCode: CountryCode | null;
  postalCode: string;
  language: Language | null;
}

export const EMPTY_SEARCH_FORM: SearchForm = {
  mode: 'store',
  merchantId: '',
  storeCode: '',
  countryCode: 'CA',
  postalCode: '',
  language: 'en',
};

/** A completed search: what came back and the scope it was fetched for. */
export interface SearchResult {
  publications: Publication[];
  /** Store context the publications must be rendered against. */
  info: PublicationInfo;
  language: Language;
  /** Human-readable scope for the list heading: "Store <code>" or the postal code. */
  scopeLabel: string;
}

const MODE_OPTIONS: { value: SearchMode; label: string }[] = [
  { value: 'store', label: 'By Store' },
  { value: 'location', label: 'By Location' },
];

export function SearchScreen({
  form,
  onFormChange,
  onResults,
}: {
  form: SearchForm;
  onFormChange: (patch: Partial<SearchForm>) => void;
  onResults: (result: SearchResult) => void;
}) {
  const client = useDvmClient();
  const { loading, error, search } = usePublicationsSearch();

  const merchantId = form.merchantId.trim();
  const storeCode = form.storeCode.trim();
  const postalCode = form.postalCode.trim().toUpperCase();

  const canLoad =
    client !== null &&
    merchantId.length > 0 &&
    form.language !== null &&
    (form.mode === 'store'
      ? storeCode.length > 0
      : postalCode.length > 0 && form.countryCode !== null);

  const load = async () => {
    if (!form.language) return;
    const info: PublicationInfo =
      form.mode === 'store'
        ? { merchantId, storeCode }
        : { postalCode, countryCode: form.countryCode ?? '' };
    const publications = await search({
      merchantId,
      ...info,
      language: form.language,
    });
    if (publications) {
      onResults({
        publications,
        info,
        language: form.language,
        scopeLabel: form.mode === 'store' ? `Store ${storeCode}` : postalCode,
      });
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader>
        <Tabs
          options={MODE_OPTIONS}
          selected={form.mode}
          onSelect={(mode) => onFormChange({ mode })}
        />
      </AppHeader>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          label="Merchant ID"
          value={form.merchantId}
          onChangeText={(value) => onFormChange({ merchantId: value })}
          placeholder="Enter merchant ID"
          keyboardType="number-pad"
        />
        {form.mode === 'store' ? (
          <TextField
            label="Store ID"
            value={form.storeCode}
            onChangeText={(value) => onFormChange({ storeCode: value })}
            placeholder="Enter store ID"
          />
        ) : (
          <>
            <PickerField
              label="Country"
              placeholder="Select country"
              options={COUNTRY_OPTIONS}
              selected={form.countryCode}
              onSelect={(countryCode) => onFormChange({ countryCode })}
            />
            <TextField
              label="Postal code"
              value={form.postalCode}
              onChangeText={(value) => onFormChange({ postalCode: value })}
              placeholder="Enter postal code"
              autoCapitalize="characters"
            />
          </>
        )}
        <PickerField
          label="Language"
          placeholder="Select language"
          options={LANGUAGE_OPTIONS}
          selected={form.language}
          onSelect={(language) => onFormChange({ language })}
        />

        <PrimaryButton
          label="Load Publications"
          onPress={load}
          disabled={!canLoad}
          loading={loading}
          style={styles.button}
        />

        {client === null ? (
          <Text accessibilityRole="alert" style={styles.error}>
            No client token configured. Copy .env.example to .env, set
            EXPO_PUBLIC_DVM_CLIENT_TOKEN, and restart with `npx expo start
            --clear`.
          </Text>
        ) : null}
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.lg },
  button: { marginTop: spacing.sm },
  error: { color: colors.danger, fontSize: 14 },
});
