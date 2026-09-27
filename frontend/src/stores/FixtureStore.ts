import { create } from "zustand";
import { listFixture, saveFixtureStatus } from "../api/Fixture";
import type { Fixture } from "../types/Fixture";

type State = {
  rows: Fixture[];
  loading: boolean;
  load: () => Promise<void>;
  updateStatus: (row: Fixture) => Promise<void>;
};

export const useFixtureStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFixture(), loading: false });
  },
  async updateStatus(row) {
    set((state) => ({ rows: state.rows.map((item) => (item.id === row.id ? row : item)) }));
    await saveFixtureStatus(row);
  }
}));
