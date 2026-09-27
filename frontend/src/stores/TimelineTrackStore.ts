import { create } from "zustand";
import { listTimelineTrack, saveTimelineTrack } from "../api/TimelineTrack";
import type { TimelineTrack } from "../types/TimelineTrack";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  load: () => Promise<void>;
  update: (row: TimelineTrack) => Promise<void>;
};

export const useTimelineTrackStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listTimelineTrack(), loading: false });
  },
  async update(row) {
    set((state) => ({ rows: state.rows.map((item) => (item.id === row.id ? row : item)) }));
    await saveTimelineTrack(row);
  }
}));
