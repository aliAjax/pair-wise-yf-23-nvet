import { create } from "zustand";
import { listShowProject, saveShowProject } from "../api/ShowProject";
import type { ShowProject } from "../types/ShowProject";

type State = {
  rows: ShowProject[];
  loading: boolean;
  load: () => Promise<void>;
  upsert: (row: ShowProject) => Promise<void>;
};

export const useShowProjectStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listShowProject(), loading: false });
  },
  async upsert(row) {
    await saveShowProject(row);
    const rows = get().rows.some((item) => item.id === row.id)
      ? get().rows.map((item) => (item.id === row.id ? row : item))
      : [...get().rows, row];
    set({ rows });
  }
}));
