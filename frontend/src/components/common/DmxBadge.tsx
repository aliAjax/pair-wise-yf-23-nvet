import type { Fixture } from "../../types/Fixture";
import { formatDmxRange } from "../../utils/dmx";

/** DMX 地址徽章：起始地址 + 占用通道区间 */
export function DmxBadge({ fixture }: { fixture: Pick<Fixture, "dmx_address" | "channel_count"> }) {
  return <span className="dmx-badge">DMX {formatDmxRange(fixture)}</span>;
}
