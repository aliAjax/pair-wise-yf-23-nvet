import { LOG_TEMPLATES } from "../constants/logTemplates";
import { mockData } from "../mocks/seedData";
import { idbPut, idbReadAll, idbSeedIfEmpty } from "../utils/indexedDb";
import type { Fixture } from "../types/Fixture";

const endpoint = "/api/fixture";

export async function listFixture(): Promise<Fixture[]> {
  try {
    await idbSeedIfEmpty("fixture", mockData.fixture);
    return await idbReadAll<Fixture>("fixture");
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return mockData.fixture.map((row) => ({ ...row }));
  }
}

export async function saveFixture(payload: Fixture) {
  console.info(LOG_TEMPLATES.Fixture[1], payload);
  try {
    await idbPut("fixture", payload);
  } catch {
    // Offline review keeps the in-memory payload as the source of truth.
  }
  return payload;
}

export async function saveFixtureStatus(payload: Fixture) {
  console.info(LOG_TEMPLATES.Fixture[2], payload);
  try {
    await idbPut("fixture", payload);
  } catch {
    // Offline review keeps the in-memory payload as the source of truth.
  }
  return payload;
}

export { endpoint as fixtureEndpoint };
