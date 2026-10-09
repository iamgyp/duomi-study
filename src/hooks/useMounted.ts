import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Returns true after client-side mount, false during SSR/hydration.
 * Use this to avoid calling setState inside useEffect just to track mount state.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
