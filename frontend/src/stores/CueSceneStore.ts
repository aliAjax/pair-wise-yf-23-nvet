import { create } from "zustand";
import { listCueScene, saveCueScene, saveCueSceneStatus } from "../api/CueScene";
import type { CueScene } from "../types/CueScene";

type State = {
  rows: CueScene[];
  loading: boolean;
  load: () => Promise<void>;
  update: (row: CueScene) => Promise<void>;
  updateStatus: (row: CueScene) => Promise<void>;
};

export const useCueSceneStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listCueScene(), loading: false });
  },
  async update(row) {
    set((state) => ({ rows: state.rows.map((item) => (item.id === row.id ? row : item)) }));
    await saveCueScene(row);
  },
  async updateStatus(row) {
    set((state) => ({ rows: state.rows.map((item) => (item.id === row.id ? row : item)) }));
    await saveCueSceneStatus(row);
  }
}));
