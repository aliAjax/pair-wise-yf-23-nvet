import { create } from "zustand";
import { listFixture, saveFixture, saveFixtures } from "../api/Fixture";
import type { Fixture } from "../types/Fixture";

type State = {
  rows: Fixture[];
  loading: boolean;
  load: () => Promise<void>;
  upsert: (row: Fixture) => Promise<void>;
  upsertMany: (rows: Fixture[]) => Promise<void>;
};

export const useFixtureStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listFixture(), loading: false });
  },
  async upsert(row) {
    await saveFixture(row);
    const rows = get().rows.some((item) => item.id === row.id)
      ? get().rows.map((item) => (item.id === row.id ? row : item))
      : [...get().rows, row];
    set({ rows });
  },
  async upsertMany(payloads) {
    await saveFixtures(payloads);
    const byId = new Map(get().rows.map((item) => [item.id, item]));
    for (const row of payloads) byId.set(row.id, row);
    set({ rows: [...byId.values()].sort((a, b) => a.id - b.id) });
  }
}));
