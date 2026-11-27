import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function readSyncReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return Boolean(window.matchMedia(REDUCED_MOTION_QUERY)?.matches);
}

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  if (!mql || typeof mql.addEventListener !== 'function') {
    return () => {};
  }
  mql.addEventListener('change', onStoreChange);
  return () => mql.removeEventListener('change', onStoreChange);
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Single authoritative `prefers-reduced-motion: reduce` hook backed by `matchMedia`
 * via `useSyncExternalStore`: synchronous on frame 0 and live-reactive on OS changes.
 */
export function useSafeReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    readSyncReducedMotion,
    getServerSnapshot
  );
}
