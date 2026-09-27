import { mockData } from "../mocks/seedData";
import type { TimelineTrack } from "../types/TimelineTrack";
import { getAllRows, putRows } from "../utils/persistence";

const STORE = "timelineTrack";

export async function listTimelineTrack(): Promise<TimelineTrack[]> {
  const stored = await getAllRows<TimelineTrack>(STORE);
  if (stored.length > 0) return stored.sort((a, b) => a.id - b.id);
  const seed = [...(mockData.timelineTrack as unknown as TimelineTrack[])];
  await putRows(STORE, seed);
  return seed;
}

export async function saveTimelineTrack(payload: TimelineTrack) {
  await putRows(STORE, [payload]);
  return payload;
}
