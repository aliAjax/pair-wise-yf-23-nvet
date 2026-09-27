import { LOG_TEMPLATES } from "../constants/logTemplates";
import { mockData } from "../mocks/seedData";
import { idbPut, idbReadAll, idbSeedIfEmpty } from "../utils/indexedDb";
import type { ShowProject } from "../types/ShowProject";

const endpoint = "/api/show-project";

export async function listShowProject(): Promise<ShowProject[]> {
  try {
    await idbSeedIfEmpty("showProject", mockData.showProject);
    return await idbReadAll<ShowProject>("showProject");
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return mockData.showProject.map((row) => ({ ...row }));
  }
}

export async function saveShowProject(payload: ShowProject) {
  console.info(LOG_TEMPLATES.ShowProject[1], payload);
  try {
    await idbPut("showProject", payload);
  } catch {
    // Offline review keeps the in-memory payload as the source of truth.
  }
  return payload;
}

export { endpoint as showProjectEndpoint };
