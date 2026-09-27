import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";
import { findDmxConflicts } from "../utils/dmx";

// 检查候选灯具的 DMX 地址段是否与灯位图上其他灯具冲突；
// releasedFixtureId（通常是故障灯）占用的地址段视为已释放。
export function useDmxAddressCheck(
  fixtures: Fixture[],
  candidateId: number | null,
  releasedFixtureId: number | null = null
) {
  return useMemo(() => {
    const candidate = fixtures.find((fixture) => fixture.id === candidateId) ?? null;
    if (!candidate) {
      return { candidate: null as Fixture | null, conflicts: [] as Fixture[], hasConflict: false };
    }
    const conflicts = findDmxConflicts(fixtures, candidate, releasedFixtureId == null ? [] : [releasedFixtureId]);
    return { candidate, conflicts, hasConflict: conflicts.length > 0 };
  }, [fixtures, candidateId, releasedFixtureId]);
}
