import { useMemo } from "react";
import type { Fixture } from "../types/Fixture";
import { findDmxConflict, occupiesDmx, type DmxConflict } from "../utils/dmx";

/**
 * DMX 地址检查：
 * - conflicts：现有灯具之间第一处通道区间重叠（未就位的灯不占通道）
 * - checkCandidate(candidate, excludeIds)：某盏候选灯与池内灯具是否冲突
 */
export function useDmxAddressCheck(fixtures: Fixture[]) {
  const conflict = useMemo<DmxConflict | null>(() => {
    const occupied = fixtures.filter(occupiesDmx);
    for (const fixture of occupied) {
      const hit = findDmxConflict(fixture, occupied);
      if (hit) return hit;
    }
    return null;
  }, [fixtures]);

  const checkCandidate = useMemo(
    () =>
      (candidate: Fixture, excludeIds: number[] = []): DmxConflict | null => {
        const pool = fixtures.filter((fixture) => !excludeIds.includes(fixture.id));
        return findDmxConflict(candidate, pool);
      },
    [fixtures]
  );

  return { conflict, checkCandidate };
}
