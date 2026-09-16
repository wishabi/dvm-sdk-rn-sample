import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isSdkError,
  useDvmClient,
  type GetPublicationsOptions,
  type Publication,
} from '@flipp/dvm-sdk-native';

/**
 * Owns the fetch lifecycle for a publications search: loading/error/result
 * state, cancellation of superseded requests, and cleanup on unmount. The
 * client comes from the nearest DvmProvider.
 */
export function usePublicationsSearch() {
  const client = useDvmClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [publications, setPublications] = useState<Publication[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Abort on unmount and whenever the client changes.
  useEffect(() => () => abortRef.current?.abort(), [client]);

  const search = useCallback(
    async (
      options: GetPublicationsOptions
    ): Promise<Publication[] | undefined> => {
      if (!client) return undefined;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(undefined);
      try {
        const list = await client.getPublications({
          ...options,
          signal: controller.signal,
        });
        setPublications(list.publications);
        return list.publications;
      } catch (err) {
        if (isSdkError(err)) {
          if (err.code === 'CANCELLED') return undefined;
          setError(
            `${err.code}${err.status ? ` (${err.status})` : ''}: ${err.message}`
          );
        } else {
          setError(String(err));
        }
        setPublications([]);
        return undefined;
      } finally {
        if (abortRef.current === controller) setLoading(false);
      }
    },
    [client]
  );

  return { loading, error, publications, search };
}
