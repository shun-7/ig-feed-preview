import type { FeedState } from '@/types/post';

/**
 * Storage layer for FeedState.
 *
 * Uses IndexedDB (up to ~1GB on iOS Safari, several GB on desktop) instead of
 * localStorage (capped at 5MB). Automatically migrates legacy localStorage data.
 */

const DB_NAME = 'igfeed';
const DB_VERSION = 1;
const STORE = 'feed';
const KEY = 'state';
const LEGACY_LS_KEY = 'igfeed_v1';

// --- IndexedDB helpers ---

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
  return dbPromise;
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result ?? null) as T | null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Public API ---

/** Load saved feed state. Migrates from localStorage if no IDB record exists. */
export async function loadFeedState(): Promise<FeedState | null> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return null;

  try {
    // Try IndexedDB first
    const fromIdb = await idbGet<FeedState>(KEY);
    if (fromIdb) return fromIdb;

    // Fallback: migrate from legacy localStorage if available
    const legacy = localStorage.getItem(LEGACY_LS_KEY);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as FeedState;
        if (parsed?.posts?.length) {
          await idbSet(KEY, parsed);
          // Clear legacy storage after successful migration
          localStorage.removeItem(LEGACY_LS_KEY);
          console.info(`Migrated ${parsed.posts.length} posts from localStorage to IndexedDB`);
          return parsed;
        }
      } catch {
        // Ignore corrupt legacy data
      }
    }

    return null;
  } catch (e) {
    console.error('loadFeedState failed:', e);
    return null;
  }
}

/** Save feed state to IndexedDB. Throws QUOTA_EXCEEDED on full quota. */
export async function saveFeedState(state: FeedState): Promise<void> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
  try {
    await idbSet(KEY, state);
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NotEnoughSpaceError')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    throw e;
  }
}

export async function clearFeedState(): Promise<void> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
  await idbDelete(KEY);
  try { localStorage.removeItem(LEGACY_LS_KEY); } catch {}
}

/** Get an estimate of storage usage (Web Storage API). Returns null if unsupported. */
export async function getStorageEstimate(): Promise<{ usage: number; quota: number; ratio: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usage, quota, ratio: quota > 0 ? usage / quota : 0 };
  } catch {
    return null;
  }
}
