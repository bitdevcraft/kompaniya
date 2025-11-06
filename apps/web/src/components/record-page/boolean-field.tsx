import { Badge } from "@repo/shared-ui/components/common/badge";

export interface BooleanFieldProps {
  label: string;
  tone?: "default" | "alert";
  value: boolean;
}

export function BooleanField({ label, tone = "default", value }: BooleanFieldProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <Badge variant={tone === "alert" && value ? "destructive" : "outline"}>
        {value ? "Enabled" : "Disabled"}
      </Badge>
    </div>
  );
}
