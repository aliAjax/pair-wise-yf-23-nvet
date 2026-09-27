import type { FixtureState } from "../types/FixtureState";

export function parseFixtureStates(raw: string): FixtureState[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.fixture_id === "number")
      .map((item) => ({
        fixture_id: item.fixture_id as number,
        intensity: Number(item.intensity) || 0,
        color: String(item.color || "#ffffff")
      }));
  } catch {
    return [];
  }
}

export function serializeFixtureStates(states: FixtureState[]): string {
  return JSON.stringify(states);
}

// 只换灯具引用，intensity / color 原样保留，保证换灯前后亮度颜色不变。
export function replaceFixtureInStates(raw: string, fromId: number, toId: number): string {
  return serializeFixtureStates(
    parseFixtureStates(raw).map((state) => (state.fixture_id === fromId ? { ...state, fixture_id: toId } : state))
  );
}
