import { formatMs } from "../../utils/formatters";

/** 时间刻度尺：按总时长均分刻度，可显示播放头位置 */
export function TimelineRuler({ totalMs, currentMs }: { totalMs: number; currentMs?: number }) {
  const ticks = 8;
  const safeTotal = Math.max(totalMs, 1);
  return (
    <div className="timeline-ruler">
      {Array.from({ length: ticks + 1 }, (_, index) => {
        const ms = (safeTotal / ticks) * index;
        return (
          <span key={index} className="tick" style={{ left: `${(index / ticks) * 100}%` }}>
            {formatMs(ms)}
          </span>
        );
      })}
      {currentMs !== undefined && (
        <span className="playhead" style={{ left: `${Math.min(100, (currentMs / safeTotal) * 100)}%` }} />
      )}
    </div>
  );
}
