import { putRows, type StoreName } from "./persistence";

export interface OpLogEntry {
  id: number;
  template: string;
  detail: string;
  at: string;
}

const OP_LOG_STORE: StoreName = "opLog";

/**
 * 所有写操作统一走这里：控制台输出 + 追加到 opLog 存储。
 * 日志模板集中在 constants/logTemplates，调用处只传模板原文。
 */
export function logOp(template: string, detail: string): void {
  const entry: OpLogEntry = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    template,
    detail,
    at: new Date().toISOString()
  };
  console.info(`[stage-light] ${template} — ${detail}`);
  void putRows(OP_LOG_STORE, [entry]);
}
