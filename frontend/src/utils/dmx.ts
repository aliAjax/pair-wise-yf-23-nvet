import type { Fixture } from "../types/Fixture";

export interface DmxRange {
  start: number;
  end: number;
}

export function dmxRange(fixture: Fixture): DmxRange {
  const parsed = Number.parseInt(fixture.dmx_address, 10);
  const start = Number.isFinite(parsed) ? parsed : 0;
  const count = Number(fixture.channel_count) || 1;
  return { start, end: start + count - 1 };
}

export function dmxRangesOverlap(a: DmxRange, b: DmxRange): boolean {
  return a.start <= b.end && b.start <= a.end;
}

export function findDmxConflicts(fixtures: Fixture[], target: Fixture, excludeIds: number[] = []): Fixture[] {
  const range = dmxRange(target);
  return fixtures.filter(
    (fixture) =>
      fixture.id !== target.id &&
      !excludeIds.includes(fixture.id) &&
      dmxRangesOverlap(range, dmxRange(fixture))
  );
}
