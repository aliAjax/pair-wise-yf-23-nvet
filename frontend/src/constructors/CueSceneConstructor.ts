import type { CueScene } from "../types/CueScene";
import type { FixtureState } from "../types/FixtureState";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 0,
  name: "新场景",
  fixture_states: "[]",
  fade_in_ms: "2000",
  hold_ms: "5000",
  priority: "1",
  scene_status: "DRAFT",
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;

/** fixture_states 是 JSON 字符串，集中在这里解析/序列化，页面与 service 不得散写 JSON.parse */
export function parseFixtureStates(raw: string): FixtureState[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is FixtureState =>
        item !== null &&
        typeof item === "object" &&
        typeof item.fixture_id === "number" &&
        typeof item.intensity === "number" &&
        typeof item.color === "string"
    );
  } catch {
    return [];
  }
}

export function serializeFixtureStates(states: FixtureState[]): string {
  return JSON.stringify(states);
}
