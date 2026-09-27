/**
 * 本地持久化层：优先 IndexedDB，不可用时降级 localStorage。
 * 每个实体一个 store，keyPath 为 id；换灯结果写入后刷新页面仍可读到。
 */

export const DB_NAME = "stage-light";
export const DB_VERSION = 1;
export const STORE_NAMES = ["fixture", "cueScene", "timelineTrack", "showProject", "swapRecord", "opLog"] as const;
export type StoreName = (typeof STORE_NAMES)[number];

const LS_PREFIX = "stage-light:";

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const name of STORE_NAMES) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: "id" });
          }
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function lsKey(store: StoreName) {
  return `${LS_PREFIX}${store}`;
}

function lsReadAll<T>(store: StoreName): T[] {
  try {
    const raw = localStorage.getItem(lsKey(store));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function lsWriteAll<T extends { id: number }>(store: StoreName, rows: T[]) {
  try {
    localStorage.setItem(lsKey(store), JSON.stringify(rows));
  } catch {
    // 存储不可用时静默降级为内存态，页面仍可用
  }
}

export async function getAllRows<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  if (!db) return lsReadAll<T>(store);
  return new Promise((resolve) => {
    const tx = db.transaction(store, "readonly");
    const request = tx.objectStore(store).getAll();
    request.onsuccess = () => resolve((request.result as T[]) ?? []);
    request.onerror = () => resolve(lsReadAll<T>(store));
  });
}

export async function putRows<T extends { id: number }>(store: StoreName, rows: T[]): Promise<void> {
  if (rows.length === 0) return;
  const db = await openDb();
  if (!db) {
    const existing = lsReadAll<T>(store);
    const byId = new Map(existing.map((row) => [row.id, row]));
    for (const row of rows) byId.set(row.id, row);
    lsWriteAll(store, [...byId.values()]);
    return;
  }
  return new Promise((resolve) => {
    const tx = db.transaction(store, "readwrite");
    const objectStore = tx.objectStore(store);
    for (const row of rows) objectStore.put(row);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

export async function countRows(store: StoreName): Promise<number> {
  const rows = await getAllRows<{ id: number }>(store);
  return rows.length;
}

export async function clearAllStores(): Promise<void> {
  const db = await openDb();
  if (!db) {
    for (const name of STORE_NAMES) {
      try {
        localStorage.removeItem(lsKey(name));
      } catch {
        // ignore
      }
    }
    return;
  }
  await new Promise<void>((resolve) => {
    const tx = db.transaction([...STORE_NAMES], "readwrite");
    for (const name of STORE_NAMES) tx.objectStore(name).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}
