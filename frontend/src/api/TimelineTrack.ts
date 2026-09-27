import { LOG_TEMPLATES } from "../constants/logTemplates";
import { mockData } from "../mocks/seedData";
import { idbPut, idbReadAll, idbSeedIfEmpty } from "../utils/indexedDb";
import type { TimelineTrack } from "../types/TimelineTrack";

const endpoint = "/api/timeline-track";

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  try {
    await idbSeedIfEmpty("timelineTrack", mockData.timelineTrack);
    return await idbReadAll<TimelineTrack>("timelineTrack");
  } catch {
    // Local mock fallback keeps the UI available during offline review.
    return mockData.timelineTrack.map((row) => ({ ...row }));
  }
}

export async function saveTimelineTrack(payload: TimelineTrack) {
  console.info(LOG_TEMPLATES.TimelineTrack[1], payload);
  try {
    await idbPut("timelineTrack", payload);
  } catch {
    // Offline review keeps the in-memory payload as the source of truth.
  }
  return payload;
}

export { endpoint as timelineTrackEndpoint };
