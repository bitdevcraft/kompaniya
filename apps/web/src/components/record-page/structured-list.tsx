export interface StructuredListProps {
  data: Record<string, unknown>;
  emptyLabel?: string;
}

export function StructuredList({ data, emptyLabel = "No data available" }: StructuredListProps) {
  const entries = Object.entries(data ?? {}).filter(([, value]) => value !== null && value !== undefined);

  if (entries.length === 0) {
    return <span className="text-sm text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div
          className="flex items-center justify-between gap-4 rounded-xl border bg-muted/40 px-3 py-2 text-sm"
          key={key}
        >
          <span className="text-muted-foreground">{key}</span>
          <span className="max-w-[60%] truncate font-medium" title={String(value)}>
            {String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}
