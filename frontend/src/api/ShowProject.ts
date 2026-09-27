import { mockData } from "../mocks/seedData";
import type { ShowProject } from "../types/ShowProject";
import { getAllRows, putRows } from "../utils/persistence";

const STORE = "showProject";

export async function listShowProject(): Promise<ShowProject[]> {
  const stored = await getAllRows<ShowProject>(STORE);
  if (stored.length > 0) return stored.sort((a, b) => a.id - b.id);
  const seed = [...(mockData.showProject as unknown as ShowProject[])];
  await putRows(STORE, seed);
  return seed;
}

export async function saveShowProject(payload: ShowProject) {
  await putRows(STORE, [payload]);
  return payload;
}
