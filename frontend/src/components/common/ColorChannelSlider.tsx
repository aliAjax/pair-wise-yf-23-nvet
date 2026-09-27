export function ColorChannelSlider({
  label,
  value,
  color,
  onChange
}: {
  label: string;
  value: number;
  color?: string;
  onChange?: (value: number) => void;
}) {
  return (
    <label className="channel-slider">
      <span>{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
      <strong>{value}%</strong>
      {color ? <i className="swatch" style={{ background: color }} /> : null}
    </label>
  );
}
