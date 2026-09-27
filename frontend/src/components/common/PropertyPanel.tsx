import type { ReactNode } from "react";

/** 右侧属性面板容器：标题 + 任意内容，灯具布置/场景编辑页共用 */
export function PropertyPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panel property-panel">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
