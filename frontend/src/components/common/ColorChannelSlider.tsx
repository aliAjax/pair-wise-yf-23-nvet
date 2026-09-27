/** 颜色/亮度通道滑杆：场景编辑页逐灯调整 */
export function ColorChannelSlider({ label, value, color, onChange }: {
  label: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="channel-slider">
      <span className="channel-slider-label">
        {label}
        <em>{Math.round(value)}%</em>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        style={{ accentColor: color }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
