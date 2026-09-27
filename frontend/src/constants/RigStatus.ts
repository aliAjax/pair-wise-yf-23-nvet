export const RigStatus = ["RIGGED","STANDBY","FAULTY"] as const;
export type RigStatus = (typeof RigStatus)[number];
export const RigStatusText: Record<RigStatus, string> = { RIGGED: "已就位", STANDBY: "未就位", FAULTY: "故障" };
