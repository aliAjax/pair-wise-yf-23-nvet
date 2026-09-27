import type { Fixture } from "../../types/Fixture";

const TYPE_GLYPH: Record<string, string> = {
  PAR: "◉",
  SPOT: "◎",
  WASH: "◍",
  BEAM: "▲",
  STROBE: "✦"
};

/** 灯具图元：按类型给图形，按就位状态给配色（故障红 / 未就位灰 / 已就位绿） */
export function FixtureIcon({ fixture, size = 34 }: { fixture: Fixture; size?: number }) {
  const glyph = TYPE_GLYPH[fixture.fixture_type] ?? "◉";
  return (
    <span
      className={`fixture-icon status-${fixture.fixture_status.toLowerCase().replace(/_/g, "-")}`}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      title={`${fixture.fixture_code}（${fixture.fixture_type}）`}
    >
      {glyph}
    </span>
  );
}
