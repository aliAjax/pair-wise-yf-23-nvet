import type { EmergencySwapRecord } from "../types/EmergencySwap";
import { getAllRows, putRows } from "../utils/persistence";

const STORE = "swapRecord";

export async function listEmergencySwapRecord(): Promise<EmergencySwapRecord[]> {
  const stored = await getAllRows<EmergencySwapRecord>(STORE);
  return stored.sort((a, b) => b.applied_at.localeCompare(a.applied_at));
}

export async function saveEmergencySwapRecord(payload: EmergencySwapRecord) {
  await putRows(STORE, [payload]);
  return payload;
}
