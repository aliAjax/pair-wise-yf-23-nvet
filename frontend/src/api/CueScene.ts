import { LOG_TEMPLATES } from "../constants/logTemplates";
import { mockData } from "../mocks/seedData";
import { idbPut, idbReadAll, idbSeedIfEmpty } from "../utils/indexedDb";
import type { CueScene } from "../types/CueScene";

const endpoint = "/api/cue-scene";

export async function listCueScene(): Promise<CueScene[]> {
  try {
    await idbSeedIfEmpty("cueScene", mockData.cueScene);
    return await idbReadAll<CueScene>("cueScene");
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return mockData.cueScene.map((row) => ({ ...row }));
  }
}

export async function saveCueScene(payload: CueScene) {
  console.info(LOG_TEMPLATES.CueScene[1], payload);
  try {
    await idbPut("cueScene", payload);
  } catch {
    // Offline review keeps the in-memory payload as the source of truth.
  }
  return payload;
}

export async function saveCueSceneStatus(payload: CueScene) {
  console.info(LOG_TEMPLATES.CueScene[2], payload);
  try {
    await idbPut("cueScene", payload);
  } catch {
    // Offline review keeps the in-memory payload as the source of truth.
  }
  return payload;
}

export { endpoint as cueSceneEndpoint };
