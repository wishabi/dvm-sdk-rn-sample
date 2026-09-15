import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  createDvmClient,
  DvmProvider,
  type Publication,
  type RenderType,
} from '@flipp/dvm-sdk-native';
import { DVM_CLIENT_TOKEN } from './config/env';
import { PublicationsScreen } from './screens/PublicationsScreen';
import { RendererScreen } from './screens/RendererScreen';
import {
  EMPTY_SEARCH_FORM,
  SearchScreen,
  type SearchForm,
  type SearchResult,
} from './screens/SearchScreen';
import { colors } from './theme';

type Route =
  | { name: 'search' }
  | { name: 'list'; result: SearchResult }
  | {
      name: 'renderer';
      result: SearchResult;
      publication: Publication;
      renderType: RenderType;
    };

export default function App() {
  const [form, setForm] = useState<SearchForm>(EMPTY_SEARCH_FORM);
  const [route, setRoute] = useState<Route>({ name: 'search' });

  // One client for the whole app (production endpoints by default), shared
  // through DvmProvider; null until a token is configured in .env.
  const client = useMemo(
    () =>
      DVM_CLIENT_TOKEN.length > 0
        ? createDvmClient({ clientToken: DVM_CLIENT_TOKEN })
        : null,
    []
  );

  let screen;
  switch (route.name) {
    case 'search':
      screen = (
        <SearchScreen
          form={form}
          onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onResults={(result) => setRoute({ name: 'list', result })}
        />
      );
      break;
    case 'list':
      screen = (
        <PublicationsScreen
          result={route.result}
          onOpen={(publication, renderType) =>
            setRoute({
              name: 'renderer',
              result: route.result,
              publication,
              renderType,
            })
          }
          onBack={() => setRoute({ name: 'search' })}
        />
      );
      break;
    case 'renderer':
      screen = (
        <RendererScreen
          key={`${route.publication.globalId}:${route.renderType}`}
          publication={route.publication}
          publicationInfo={route.result.info}
          language={route.result.language}
          initialRenderType={route.renderType}
          onBack={() => setRoute({ name: 'list', result: route.result })}
        />
      );
      break;
  }

  return (
    <DvmProvider client={client}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.container}>{screen}</SafeAreaView>
      </SafeAreaProvider>
    </DvmProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
});
