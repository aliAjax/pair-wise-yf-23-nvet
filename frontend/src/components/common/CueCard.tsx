import { CueStatusText } from "../../constants/CueStatus";
import type { CueScene } from "../../types/CueScene";
import type { CueStatus } from "../../types/CueStatus";
import type { Fixture } from "../../types/Fixture";
import { parseFixtureStates } from "../../utils/fixtureStates";
import { formatMs } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";

export function CueCard({
  cue,
  fixtures,
  highlight = false
}: {
  cue: CueScene;
  fixtures: Fixture[];
  highlight?: boolean;
}) {
  const states = parseFixtureStates(cue.fixture_states);
  const codeOf = (fixtureId: number) =>
    fixtures.find((fixture) => fixture.id === fixtureId)?.fixture_code ?? `#${fixtureId}`;
  return (
    <article className={"cue-card" + (highlight ? " danger" : "")}>
      <header>
        <strong>{cue.name}</strong>
        <StatusBadge
          value={cue.scene_status}
          text={CueStatusText[cue.scene_status as CueStatus] ?? cue.scene_status}
        />
      </header>
      <p className="meta">
        淡入 {formatMs(cue.fade_in_ms)} · 保持 {formatMs(cue.hold_ms)} · 优先级 {cue.priority}
      </p>
      <div className="chips">
        {states.map((state) => (
          <span className="chip" key={state.fixture_id}>
            <i className="swatch" style={{ background: state.color }} />
            {codeOf(state.fixture_id)} · {state.intensity}%
          </span>
        ))}
        {states.length === 0 && <span className="chip">未配置灯具</span>}
      </div>
    </article>
  );
}
