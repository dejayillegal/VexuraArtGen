import { openDB, type IDBPDatabase } from 'idb';
import type { Generation } from '@shared/schema';

const DB_NAME = 'vexura-db';
const DB_VERSION = 1;
const STORE_NAME = 'generations';

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveGeneration(generation: Generation): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, generation);
}

export async function getAllGenerations(): Promise<Generation[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('createdAt');
  const generations = await index.getAll();
  return generations.reverse(); // Most recent first
}

export async function deleteGeneration(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function updateGenerationCID(id: string, cid: string): Promise<void> {
  const db = await getDB();
  const generation = await db.get(STORE_NAME, id);
  if (generation) {
    generation.cid = cid;
    await db.put(STORE_NAME, generation);
  }
}
