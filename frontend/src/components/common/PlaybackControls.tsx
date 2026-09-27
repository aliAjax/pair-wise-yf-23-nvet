import { formatClock } from "../../utils/formatters";

export function PlaybackControls({
  playing,
  timeMs,
  totalMs,
  onPlay,
  onPause,
  onReset,
  onSeek
}: {
  playing: boolean;
  timeMs: number;
  totalMs: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (value: number) => void;
}) {
  return (
    <div className="playback">
      <button type="button" className="btn-primary" onClick={playing ? onPause : onPlay}>
        {playing ? "暂停" : "播放"}
      </button>
      <button type="button" onClick={onReset}>
        重置
      </button>
      <input
        type="range"
        min={0}
        max={totalMs}
        value={timeMs}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <span className="clock">
        {formatClock(timeMs)} / {formatClock(totalMs)}
      </span>
    </div>
  );
}
