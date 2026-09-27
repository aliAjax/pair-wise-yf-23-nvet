import type { Fixture } from "../../types/Fixture";
import type { FixtureState } from "../../types/FixtureState";

export interface StageCanvasFixture {
  fixture: Fixture;
  /** 当前时刻该灯的状态；无状态表示未点亮 */
  state?: FixtureState;
}

/**
 * 二维舞台画布：按 position_x/y（0-100 百分比）摆放灯具，
 * 点亮的灯按颜色与亮度渲染光晕。
 */
export function StageCanvas({ items, onSelect, selectedId }: {
  items: StageCanvasFixture[];
  onSelect?: (fixtureId: number) => void;
  selectedId?: number | null;
}) {
  return (
    <div className="stage-canvas">
      <div className="stage-edge">台口</div>
      {items.map(({ fixture, state }) => {
        const lit = state && state.intensity > 0 && fixture.fixture_status !== "FAULT";
        const glow = lit ? state.intensity / 100 : 0;
        return (
          <button
            key={fixture.id}
            type="button"
            className={`stage-fixture status-${fixture.fixture_status.toLowerCase().replace(/_/g, "-")}${selectedId === fixture.id ? " selected" : ""}${onSelect ? " clickable" : ""}`}
            style={{
              left: `${fixture.position_x}%`,
              top: `${fixture.position_y}%`,
              backgroundColor: lit ? state.color : undefined,
              boxShadow: lit ? `0 0 ${18 + glow * 30}px ${6 + glow * 10}px ${state.color}` : undefined,
              opacity: lit ? 0.35 + glow * 0.65 : undefined
            }}
            onClick={onSelect ? () => onSelect(fixture.id) : undefined}
            title={fixture.fixture_code}
          >
            {fixture.fixture_code}
          </button>
        );
      })}
    </div>
  );
}
