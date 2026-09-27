import { LOG_TEMPLATES } from "../constants/logTemplates";
import { idbPut, idbReadAll } from "../utils/indexedDb";
import type { FixtureReplacement } from "../types/FixtureReplacement";

const endpoint = "/api/fixture-replacement";

export async function listFixtureReplacement(): Promise<FixtureReplacement[]> {
  try {
    return await idbReadAll<FixtureReplacement>("fixtureReplacement");
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return [];
  }
}

export async function saveFixtureReplacement(payload: FixtureReplacement) {
  console.info(LOG_TEMPLATES.FixtureReplacement[2], payload);
  try {
    await idbPut("fixtureReplacement", payload);
  } catch {
    // Offline review keeps the in-memory payload as the source of truth.
  }
  return payload;
}

export { endpoint as fixtureReplacementEndpoint };
