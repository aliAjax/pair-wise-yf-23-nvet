export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

export const interpolate = (template: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);

export const formatDmxRange = (start: number, end: number) =>
  `DMX ${String(start).padStart(3, "0")}–${String(end).padStart(3, "0")}`;

export const formatMs = (value: string | number) => {
  const ms = Number(value) || 0;
  return ms % 1000 === 0 ? `${ms / 1000} 秒` : `${ms} 毫秒`;
};

export const formatClock = (ms: number) => {
  const safe = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(safe / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
