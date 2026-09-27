import { formatMs } from "../../utils/formatters";

/** 播放控制条：播放/暂停/停止 + 进度拖动，预览页与时间轴页共用 */
export function PlaybackControls({ playing, currentMs, totalMs, onPlay, onPause, onStop, onSeek }: {
  playing: boolean;
  currentMs: number;
  totalMs: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (ms: number) => void;
}) {
  return (
    <div className="playback-controls">
      {playing ? (
        <button type="button" onClick={onPause}>暂停</button>
      ) : (
        <button type="button" onClick={onPlay}>播放</button>
      )}
      <button type="button" onClick={onStop}>停止</button>
      <input
        type="range"
        min={0}
        max={Math.max(totalMs, 1)}
        value={Math.min(currentMs, totalMs)}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <span className="playback-time">{formatMs(currentMs)} / {formatMs(totalMs)}</span>
    </div>
  );
}
