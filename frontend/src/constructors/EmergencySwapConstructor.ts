import type { EmergencySwapRecord } from "../types/EmergencySwap";

export const createDefaultEmergencySwapRecord = (
  overrides: Partial<EmergencySwapRecord> = {}
): EmergencySwapRecord => ({
  id: 0,
  faulty_fixture_id: 0,
  standin_fixture_id: 0,
  affected_cue_ids: [],
  applied_at: new Date().toISOString(),
  ...overrides
});

export const createEmergencySwapRecordResponse = createDefaultEmergencySwapRecord;
