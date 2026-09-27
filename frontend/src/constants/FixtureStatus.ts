export const FixtureStatus = ["IN_PLACE", "NOT_READY", "FAULT"] as const;
export type FixtureStatus = (typeof FixtureStatus)[number];
export const FixtureStatusText: Record<FixtureStatus, string> = {
  IN_PLACE: "已就位",
  NOT_READY: "未就位",
  FAULT: "故障"
};
