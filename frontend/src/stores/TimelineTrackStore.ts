import { create } from "zustand";
import { listTimelineTrack, saveTimelineTrack } from "../api/TimelineTrack";
import type { TimelineTrack } from "../types/TimelineTrack";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  load: () => Promise<void>;
  upsert: (row: TimelineTrack) => Promise<void>;
};

export const useTimelineTrackStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listTimelineTrack(), loading: false });
  },
  async upsert(row) {
    await saveTimelineTrack(row);
    const rows = get().rows.some((item) => item.id === row.id)
      ? get().rows.map((item) => (item.id === row.id ? row : item))
      : [...get().rows, row];
    set({ rows });
  }
}));
