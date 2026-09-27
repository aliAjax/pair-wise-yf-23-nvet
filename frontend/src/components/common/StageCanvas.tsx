import type { Fixture } from "../../types/Fixture";
import type { FixtureState } from "../../types/FixtureState";

const RIG_COLOR: Record<string, string> = {
  RIGGED: "#7fb069",
  STANDBY: "#d9a441",
  FAULTY: "#4a4440"
};

export function StageCanvas({
  fixtures,
  activeStates,
  selectedId,
  onSelectFixture
}: {
  fixtures: Fixture[];
  activeStates?: Record<number, FixtureState>;
  selectedId?: number | null;
  onSelectFixture?: (id: number) => void;
}) {
  return (
    <div className="stage">
      {fixtures.map((fixture) => {
        const state = activeStates?.[fixture.id];
        const faulty = fixture.rig_status === "FAULTY";
        const lit = state && !faulty;
        return (
          <button
            key={fixture.id}
            type="button"
            className={"dot" + (selectedId === fixture.id ? " selected" : "") + (faulty ? " faulty" : "")}
            style={{
              left: `${Number(fixture.position_x) || 0}%`,
              top: `${Number(fixture.position_y) || 0}%`,
              background: lit ? state.color : RIG_COLOR[fixture.rig_status] ?? "#8a8f84",
              boxShadow: lit ? `0 0 ${10 + state.intensity / 3}px ${state.color}` : undefined,
              opacity: lit ? 0.4 + (state.intensity / 100) * 0.6 : 1
            }}
            title={`${fixture.fixture_code}${faulty ? "（故障）" : ""}`}
            onClick={() => onSelectFixture?.(fixture.id)}
          >
            {faulty ? "✕" : ""}
          </button>
        );
      })}
    </div>
  );
}
