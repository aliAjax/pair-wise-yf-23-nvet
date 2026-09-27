import { create } from "zustand";
import { listCueScene, saveCueScene, saveCueScenes } from "../api/CueScene";
import type { CueScene } from "../types/CueScene";

type State = {
  rows: CueScene[];
  loading: boolean;
  load: () => Promise<void>;
  upsert: (row: CueScene) => Promise<void>;
  upsertMany: (rows: CueScene[]) => Promise<void>;
};

export const useCueSceneStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listCueScene(), loading: false });
  },
  async upsert(row) {
    await saveCueScene(row);
    const rows = get().rows.some((item) => item.id === row.id)
      ? get().rows.map((item) => (item.id === row.id ? row : item))
      : [...get().rows, row];
    set({ rows });
  },
  async upsertMany(payloads) {
    await saveCueScenes(payloads);
    const byId = new Map(get().rows.map((item) => [item.id, item]));
    for (const row of payloads) byId.set(row.id, row);
    set({ rows: [...byId.values()].sort((a, b) => a.id - b.id) });
  }
}));
