import { useState } from "react";
import { ColorChannelSlider } from "../components/common/ColorChannelSlider";
import { CueCard } from "../components/common/CueCard";
import { EmptyState } from "../components/common/EmptyState";
import { StatCard } from "../components/common/StatCard";
import { CueStatus, CueStatusText } from "../constants/CueStatus";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { FixtureState } from "../types/FixtureState";
import { parseFixtureStates, serializeFixtureStates } from "../utils/fixtureStates";

function CueEditor({ cue, fixtures }: { cue: CueScene; fixtures: Fixture[] }) {
  const update = useCueSceneStore((state) => state.update);
  const updateStatus = useCueSceneStore((state) => state.updateStatus);
  const states = parseFixtureStates(cue.fixture_states);
  const codeOf = (fixtureId: number) =>
    fixtures.find((fixture) => fixture.id === fixtureId)?.fixture_code ?? `#${fixtureId}`;

  const patchState = (fixtureId: number, patch: Partial<FixtureState>) => {
    const nextStates = states.map((state) =>
      state.fixture_id === fixtureId ? { ...state, ...patch } : state
    );
    void update({ ...cue, fixture_states: serializeFixtureStates(nextStates) });
  };

  return (
    <div className="panel cue-editor">
      <CueCard cue={cue} fixtures={fixtures} />
      <div className="cue-editor-body">
        <label className="filter-row">
          场次状态
          <select
            value={cue.scene_status}
            onChange={(event) => void updateStatus({ ...cue, scene_status: event.target.value })}
          >
            {CueStatus.map((status) => (
              <option key={status} value={status}>
                {CueStatusText[status]}
              </option>
            ))}
          </select>
        </label>
        {states.map((state) => (
          <div className="state-row" key={state.fixture_id}>
            <span className="state-code">{codeOf(state.fixture_id)}</span>
            <ColorChannelSlider
              label="亮度"
              value={state.intensity}
              color={state.color}
              onChange={(intensity) => patchState(state.fixture_id, { intensity })}
            />
            <input
              type="color"
              value={state.color}
              onChange={(event) => patchState(state.fixture_id, { color: event.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CuesPage() {
  const cues = useCueSceneStore((state) => state.rows);
  const loadCues = useCueSceneStore((state) => state.load);
  const fixtures = useFixtureStore((state) => state.rows);
  const loadFixtures = useFixtureStore((state) => state.load);
  const ready = useIndexedDbStore([loadCues, loadFixtures]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  if (!ready) {
    return (
      <main className="page">
        <EmptyState title="正在加载本地数据…" />
      </main>
    );
  }

  const filtered = statusFilter === "ALL" ? cues : cues.filter((cue) => cue.scene_status === statusFilter);
  const countOf = (status: string) => cues.filter((cue) => cue.scene_status === status).length;

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>场景编辑</h1>
        </div>
        <label className="filter-row">
          状态筛选
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">全部状态</option>
            {CueStatus.map((status) => (
              <option key={status} value={status}>
                {CueStatusText[status]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="metrics">
        <StatCard label="场景总数" value={cues.length} />
        <StatCard label="就绪" value={countOf("READY")} />
        <StatCard label="已归档" value={countOf("ARCHIVED")} />
      </section>

      <section className="cue-list">
        {filtered.map((cue) => (
          <CueEditor key={cue.id} cue={cue} fixtures={fixtures} />
        ))}
        {filtered.length === 0 && <EmptyState title="当前筛选下没有 Cue" />}
      </section>
    </main>
  );
}
