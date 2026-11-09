// Offline storage for scheduled data. Everything is namespaced by account so
// one user's cached week can never surface in another account's session, and
// the whole database is purged when a different account signs in on the device.

const DB_NAME = 'academic-intelligence-offline';
const DB_VERSION = 1;
const STORE = 'timetable';
const OWNER_KEY = 'ai-offline-owner';

const supported = () => typeof indexedDB !== 'undefined';

const openDb = () =>
  new Promise((resolve, reject) => {
    if (!supported()) {
      reject(new Error('Offline storage is not available in this browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'key' });
        store.createIndex('account', 'account', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const keyOf = (accountId, workspace, weekStart) => `${accountId}:${workspace}:${weekStart}`;

async function run(mode, action) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    let result;
    try {
      result = action(store);
    } catch (error) {
      reject(error);
      return;
    }
    tx.oncomplete = () => {
      db.close();
      resolve(result && result.result !== undefined ? result.result : result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function saveTimetable({ accountId, workspace, weekStart, payload }) {
  if (!accountId) return;
  await run('readwrite', (store) =>
    store.put({
      key: keyOf(accountId, workspace, weekStart),
      account: accountId,
      workspace,
      weekStart,
      savedAt: new Date().toISOString(),
      payload,
    }),
  );
}

export async function readTimetable({ accountId, workspace, weekStart }) {
  if (!accountId) return null;
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const request = tx.objectStore(STORE).get(keyOf(accountId, workspace, weekStart));
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

export async function clearAccount(accountId) {
  if (!accountId || !supported()) return;
  try {
    await run('readwrite', (store) => {
      const index = store.index('account');
      const request = index.openCursor(IDBKeyRange.only(accountId));
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
    });
  } catch {
    /* A missing database simply means nothing to clear. */
  }
}

export async function clearAllOffline() {
  if (!supported()) return;
  try {
    await run('readwrite', (store) => store.clear());
  } catch {
    /* ignore */
  }
}

/**
 * Called whenever an account is resolved. If the device previously held cache
 * for a different account, it is wiped first: a shared device must never show
 * the previous user's week.
 */
export async function claimOfflineOwner(accountId) {
  if (!accountId || !supported()) return;
  try {
    const owner = localStorage.getItem(OWNER_KEY);
    if (owner && owner !== accountId) await clearAllOffline();
    localStorage.setItem(OWNER_KEY, accountId);
  } catch {
    /* storage may be blocked; the cache is namespaced regardless */
  }
}

export async function releaseOfflineOwner() {
  try {
    localStorage.removeItem(OWNER_KEY);
  } catch {
    /* ignore */
  }
  await clearAllOffline();
}