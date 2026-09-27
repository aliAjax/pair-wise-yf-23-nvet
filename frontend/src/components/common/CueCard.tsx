import type { CueScene } from "../../types/CueScene";
import { CueStatusText } from "../../constants/CueStatus";
import { StatusBadge } from "./StatusBadge";
import { formatMs } from "../../utils/formatters";

/** Cue 卡片：名称、状态、渐变/保持时长，时间轴与场景编辑页共用 */
export function CueCard({ cue, active = false, onClick }: { cue: CueScene; active?: boolean; onClick?: () => void }) {
  return (
    <div className={`cue-card${active ? " active" : ""}${onClick ? " clickable" : ""}`} onClick={onClick}>
      <div className="cue-card-head">
        <strong>{cue.name}</strong>
        <StatusBadge value={cue.scene_status} label={CueStatusText[cue.scene_status as keyof typeof CueStatusText] ?? cue.scene_status} />
      </div>
      <div className="cue-card-meta">
        <span>渐变 {formatMs(Number(cue.fade_in_ms))}</span>
        <span>保持 {formatMs(Number(cue.hold_ms))}</span>
      </div>
    </div>
  );
}
