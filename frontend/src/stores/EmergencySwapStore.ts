import { create } from "zustand";
import { listEmergencySwapRecord, saveEmergencySwapRecord } from "../api/EmergencySwap";
import type { EmergencySwapRecord } from "../types/EmergencySwap";

type State = {
  rows: EmergencySwapRecord[];
  loading: boolean;
  load: () => Promise<void>;
  append: (row: EmergencySwapRecord) => Promise<void>;
};

export const useEmergencySwapStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listEmergencySwapRecord(), loading: false });
  },
  async append(row) {
    await saveEmergencySwapRecord(row);
    set({ rows: [row, ...get().rows] });
  }
}));
