import type { Fixture } from "../types/Fixture";

export interface DmxRange {
  start: number;
  end: number;
}

/** 灯具占用的 DMX 通道区间 [start, start + channel_count - 1] */
export function dmxRangeOf(fixture: Pick<Fixture, "dmx_address" | "channel_count">): DmxRange {
  const start = Number.parseInt(fixture.dmx_address, 10);
  const count = Number(fixture.channel_count) || 0;
  const safeStart = Number.isFinite(start) ? start : 0;
  return { start: safeStart, end: safeStart + Math.max(count, 1) - 1 };
}

export function dmxRangesOverlap(a: DmxRange, b: DmxRange): boolean {
  return a.start <= b.end && b.start <= a.end;
}

/** 未就位的灯还没有接线，不占用 DMX 通道 */
export function occupiesDmx(fixture: Pick<Fixture, "fixture_status">): boolean {
  return fixture.fixture_status !== "NOT_READY";
}

export interface DmxConflict {
  fixture: Fixture;
  conflictsWith: Fixture;
}

/**
 * 返回 candidate 与 pool 中第一盏占用通道区间重叠的灯。
 * pool 里未就位（NOT_READY）的灯不参与占用判断。
 */
export function findDmxConflict(candidate: Fixture, pool: Fixture[]): DmxConflict | null {
  const candidateRange = dmxRangeOf(candidate);
  for (const other of pool) {
    if (other.id === candidate.id) continue;
    if (!occupiesDmx(other)) continue;
    if (dmxRangesOverlap(candidateRange, dmxRangeOf(other))) {
      return { fixture: candidate, conflictsWith: other };
    }
  }
  return null;
}

export function formatDmxRange(fixture: Pick<Fixture, "dmx_address" | "channel_count">): string {
  const range = dmxRangeOf(fixture);
  return `${range.start}-${range.end}`;
}
