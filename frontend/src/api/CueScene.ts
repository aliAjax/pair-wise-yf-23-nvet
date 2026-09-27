import { mockData } from "../mocks/seedData";
import type { CueScene } from "../types/CueScene";
import { getAllRows, putRows } from "../utils/persistence";

const STORE = "cueScene";

export async function listCueScene(): Promise<CueScene[]> {
  const stored = await getAllRows<CueScene>(STORE);
  if (stored.length > 0) return stored.sort((a, b) => a.id - b.id);
  const seed = [...(mockData.cueScene as unknown as CueScene[])];
  await putRows(STORE, seed);
  return seed;
}

export async function saveCueScene(payload: CueScene) {
  await putRows(STORE, [payload]);
  return payload;
}

export async function saveCueScenes(payloads: CueScene[]) {
  await putRows(STORE, payloads);
  return payloads;
}
