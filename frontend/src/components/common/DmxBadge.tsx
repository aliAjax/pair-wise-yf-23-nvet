import type { Fixture } from "../../types/Fixture";
import { dmxRange } from "../../utils/dmx";
import { formatDmxRange } from "../../utils/formatters";

export function DmxBadge({ fixture }: { fixture: Fixture }) {
  const range = dmxRange(fixture);
  return <span className="badge dmx">{formatDmxRange(range.start, range.end)}</span>;
}
