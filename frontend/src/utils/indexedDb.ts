const DB_NAME = "stage-light";
const DB_VERSION = 1;

export const IDB_STORES = ["fixture", "cueScene", "timelineTrack", "showProject", "fixtureReplacement"] as const;
export type IdbStoreName = (typeof IDB_STORES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

export function openStageLightDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("INDEXEDDB_UNAVAILABLE"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const name of IDB_STORES) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: "id" });
          }
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function idbReadAll<T>(store: IdbStoreName): Promise<T[]> {
  const db = await openStageLightDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const request = tx.objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function idbPut<T extends { id: number }>(store: IdbStoreName, value: T): Promise<T> {
  const db = await openStageLightDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve(value);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbSeedIfEmpty<T extends { id: number }>(store: IdbStoreName, rows: T[]): Promise<void> {
  const db = await openStageLightDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const objectStore = tx.objectStore(store);
    const countRequest = objectStore.count();
    countRequest.onsuccess = () => {
      if (countRequest.result === 0) {
        rows.forEach((row) => objectStore.put(row));
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
