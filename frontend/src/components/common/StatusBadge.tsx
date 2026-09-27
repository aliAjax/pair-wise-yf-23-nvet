export function StatusBadge({ value, text }: { value: string; text?: string }) {
  return (
    <span className={"badge " + String(value).toLowerCase().replace(/_/g, "-")}>
      {text ?? String(value).replace(/_/g, " ")}
    </span>
  );
}
