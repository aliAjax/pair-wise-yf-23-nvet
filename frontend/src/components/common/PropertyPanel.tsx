import type { ReactNode } from "react";

export function PropertyPanel({
  title,
  items,
  children
}: {
  title: string;
  items: Array<[string, ReactNode]>;
  children?: ReactNode;
}) {
  return (
    <div className="panel props">
      <h2>{title}</h2>
      <dl>
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {children}
    </div>
  );
}
