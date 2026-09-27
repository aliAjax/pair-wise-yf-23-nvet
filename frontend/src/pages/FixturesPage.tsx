import { useMemo, useState } from "react";
import { FixtureStatusText } from "../constants/FixtureStatus";
import { FixtureTypeText } from "../constants/FixtureType";
import { CueStatusText } from "../constants/CueStatus";
import { listSwapCandidates, findAffectedCues } from "../services/emergencySwapService";
import { submitEmergencySwap } from "../controllers/emergencySwapController";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useEmergencySwapStore } from "../stores/EmergencySwapStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { DmxBadge } from "../components/common/DmxBadge";
import { FixtureIcon } from "../components/common/FixtureIcon";
import { PropertyPanel } from "../components/common/PropertyPanel";
import { StageCanvas } from "../components/common/StageCanvas";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { formatDate } from "../utils/formatters";
import type { SwapIssue } from "../types/EmergencySwap";

export function FixturesPage() {
  const fixtures = useFixtureStore((state) => state.rows);
  const cues = useCueSceneStore((state) => state.rows);
  const swapRecords = useEmergencySwapStore((state) => state.rows);

  const [faultyId, setFaultyId] = useState<number | null>(null);
  const [standinId, setStandinId] = useState<number | null>(null);
  const [issue, setIssue] = useState<SwapIssue | null>(null);
  const [applied, setApplied] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const faulty = fixtures.find((fixture) => fixture.id === faultyId) ?? null;
  const candidates = useMemo(() => listSwapCandidates(fixtures, faultyId), [fixtures, faultyId]);
  const affectedCues = useMemo(
    () => (faultyId === null ? [] : findAffectedCues(cues, faultyId)),
    [cues, faultyId]
  );

  const pickFaulty = (id: number | null) => {
    setFaultyId(id);
    setStandinId(null);
    setIssue(null);
    setApplied(null);
  };

  const submit = async () => {
    setSubmitting(true);
    setApplied(null);
    const result = await submitEmergencySwap(faultyId, standinId);
    setSubmitting(false);
    if (!result.ok) {
      // 整批不写入，只点出第一处问题
      setIssue(result.issue ?? null);
      return;
    }
    setIssue(null);
    setApplied(`换灯完成：${result.record?.affected_cue_ids.length ?? 0} 个 Cue 已改用替身，亮度与颜色保持不变`);
    setFaultyId(null);
    setStandinId(null);
  };

  const faultCount = fixtures.filter((fixture) => fixture.fixture_status === "FAULT").length;
  const readyCount = fixtures.filter((fixture) => fixture.fixture_status === "IN_PLACE").length;

  return (
    <>
      <section className="metrics">
        <StatCard label="灯具总数" value={fixtures.length} />
        <StatCard label="已就位" value={readyCount} />
        <StatCard label="故障" value={faultCount} />
        <StatCard label="换灯记录" value={swapRecords.length} />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>灯具平面图（点击灯具标为故障）</h2>
          <StageCanvas
            items={fixtures.map((fixture) => ({ fixture }))}
            selectedId={faultyId}
            onSelect={(id) => pickFaulty(id)}
          />
          <div className="table fixture-table">
            {fixtures.map((fixture) => (
              <article key={fixture.id} className={`row${fixture.id === faultyId ? " picked" : ""}`}>
                <span className="fixture-cell">
                  <FixtureIcon fixture={fixture} size={26} />
                  <strong>{fixture.fixture_code}</strong>
                  <em>{FixtureTypeText[fixture.fixture_type as keyof typeof FixtureTypeText] ?? fixture.fixture_type}</em>
                </span>
                <DmxBadge fixture={fixture} />
                <StatusBadge
                  value={fixture.fixture_status}
                  label={FixtureStatusText[fixture.fixture_status as keyof typeof FixtureStatusText] ?? fixture.fixture_status}
                />
                <button
                  type="button"
                  disabled={fixture.fixture_status === "FAULT"}
                  onClick={() => pickFaulty(fixture.id)}
                >
                  {fixture.fixture_status === "FAULT" ? "已故障" : "标为故障"}
                </button>
              </article>
            ))}
          </div>
        </div>

        <PropertyPanel title="应急换灯台">
          {!faulty && <p className="hint">演出中灯突然不亮？在左侧平面图或列表里点选故障灯。</p>}
          {faulty && (
            <>
              <div className="swap-target">
                <span>故障灯</span>
                <strong>{faulty.fixture_code}</strong>
                <em>{faulty.fixture_type}</em>
                <DmxBadge fixture={faulty} />
              </div>

              <h3>选择替身（同类型 · DMX 不冲突）</h3>
              {candidates.length === 0 && <p className="hint">没有同类型的其他灯具。</p>}
              <div className="candidate-list">
                {candidates.map(({ fixture, eligible, reason }) => (
                  <label key={fixture.id} className={`candidate${eligible ? "" : " disabled"}`}>
                    <input
                      type="radio"
                      name="standin"
                      disabled={!eligible}
                      checked={standinId === fixture.id}
                      onChange={() => {
                        setStandinId(fixture.id);
                        setIssue(null);
                      }}
                    />
                    <FixtureIcon fixture={fixture} size={24} />
                    <span className="candidate-main">
                      <strong>{fixture.fixture_code}</strong>
                      <DmxBadge fixture={fixture} />
                    </span>
                    {reason ? <em className="candidate-reason">{reason}</em> : <em className="candidate-ok">可用</em>}
                  </label>
                ))}
              </div>

              <h3>受影响 Cue（{affectedCues.length}）</h3>
              {affectedCues.length === 0 && <p className="hint">没有 Cue 引用该灯，可直接换。</p>}
              <ul className="affected-cues">
                {affectedCues.map((cue) => (
                  <li key={cue.id}>
                    <span>{cue.name}</span>
                    <StatusBadge
                      value={cue.scene_status}
                      label={CueStatusText[cue.scene_status as keyof typeof CueStatusText] ?? cue.scene_status}
                    />
                  </li>
                ))}
              </ul>

              {issue && <div className="alert error">{issue.message}</div>}
              {applied && <div className="alert ok">{applied}</div>}

              <button type="button" className="primary" disabled={submitting} onClick={() => void submit()}>
                {submitting ? "正在写入…" : "整批换灯"}
              </button>
              <p className="hint">任一 Cue 已归档或替身未就位时整批不写入；通过后场景、时间轴与舞台预览同步生效。</p>
            </>
          )}
        </PropertyPanel>
      </section>

      <section className="panel">
        <h2>换灯记录</h2>
        {swapRecords.length === 0 && <p className="hint">还没有换过灯。</p>}
        <div className="table">
          {swapRecords.map((record) => {
            const faultyFixture = fixtures.find((fixture) => fixture.id === record.faulty_fixture_id);
            const standinFixture = fixtures.find((fixture) => fixture.id === record.standin_fixture_id);
            return (
              <article key={record.id} className="row">
                <strong>
                  {faultyFixture?.fixture_code ?? record.faulty_fixture_id} → {standinFixture?.fixture_code ?? record.standin_fixture_id}
                </strong>
                <span>{record.affected_cue_ids.length} 个 Cue</span>
                <span>{formatDate(record.applied_at)}</span>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
