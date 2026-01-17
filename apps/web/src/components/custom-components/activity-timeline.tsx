"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import { useEffect, useState } from "react";

import type { CustomComponentProps } from "@/lib/component-definitions";

type ActivityRecord = {
  id: string;
  name?: string | null;
  createdAt?: string | null;
};

type ActivityResponse = {
  data?: ActivityRecord[];
};

export function ActivityTimeline({ config }: CustomComponentProps) {
  const limit = typeof config?.limit === "number" ? config.limit : 5;
  const title =
    typeof config?.title === "string" ? config.title : "Activity Timeline";
  const [items, setItems] = useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadActivities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/organization/activity/paginated?page=1&perPage=${limit}`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const data = (await response.json()) as ActivityResponse;
        if (isActive) {
          setItems(data.data ?? []);
        }
      } catch (caught) {
        if (isActive) {
          setError(
            caught instanceof Error ? caught.message : "Failed to load data",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadActivities();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [limit]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">
            Loading activity...
          </div>
        ) : null}
        {!isLoading && error ? (
          <div className="text-sm text-destructive">
            Unable to load activity: {error}
          </div>
        ) : null}
        {!isLoading && !error && items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No activity found.
          </div>
        ) : null}
        {!isLoading && !error && items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li className="flex flex-col gap-1" key={item.id}>
                <span className="text-sm font-medium">
                  {item.name || "Untitled activity"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(item.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatTimestamp(value?: string | null) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}
