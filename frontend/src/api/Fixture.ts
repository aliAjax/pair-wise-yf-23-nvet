import { mockData } from "../mocks/seedData";
import type { Fixture } from "../types/Fixture";
import { getAllRows, putRows } from "../utils/persistence";

const STORE = "fixture";

export async function listFixture(): Promise<Fixture[]> {
  const stored = await getAllRows<Fixture>(STORE);
  if (stored.length > 0) return stored.sort((a, b) => a.id - b.id);
  const seed = [...(mockData.fixture as unknown as Fixture[])];
  await putRows(STORE, seed);
  return seed;
}

export async function saveFixture(payload: Fixture) {
  await putRows(STORE, [payload]);
  return payload;
}

export async function saveFixtures(payloads: Fixture[]) {
  await putRows(STORE, payloads);
  return payloads;
}
