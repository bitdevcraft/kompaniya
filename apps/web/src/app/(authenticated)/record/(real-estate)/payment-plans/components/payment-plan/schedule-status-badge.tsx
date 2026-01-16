/**
 * Schedule Status Badge Component
 *
 * Color-coded badges for schedule item status.
 */

"use client";

import type { ScheduleItem } from "@repo/database/schema";

import { Badge } from "@kompaniya/ui-common/components/badge";

export interface ScheduleStatusBadgeProps {
  status: ScheduleItem["status"];
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  },
  partial: {
    label: "Partial",
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  paid: {
    label: "Paid",
    variant: "secondary" as const,
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  overdue: {
    label: "Overdue",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
  waived: {
    label: "Waived",
    variant: "secondary" as const,
    className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  },
};

export function ScheduleStatusBadge({ status }: ScheduleStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <Badge className={config.className} variant={config.variant}>
      {config.label}
    </Badge>
  );
}
