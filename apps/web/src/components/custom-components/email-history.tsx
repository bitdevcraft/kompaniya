"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";

import type { CustomComponentProps } from "@/lib/component-definitions";

export function EmailHistory({ config, recordId }: CustomComponentProps) {
  const title =
    typeof config?.title === "string" ? config.title : "Email History";

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          No email history yet for record {recordId}.
        </div>
      </CardContent>
    </Card>
  );
}
