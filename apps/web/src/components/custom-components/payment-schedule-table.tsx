/**
 * Payment Schedule Table Custom Component
 *
 * Displays the payment schedule for a payment plan instance.
 * This component can be added to payment plan record layouts.
 */

"use client";

import type { ScheduleItem } from "@repo/database/schema";

import type { CustomComponentProps } from "@/lib/component-definitions";

import { ScheduleTable } from "@/components/payment-plan/schedule-table";

type PaymentPlanRecord = {
  currency?: string;
  instanceConfig?: {
    scheduleItems?: ScheduleItem[];
  };
  templateId?: string;
};

export function PaymentScheduleTable({ record, config }: CustomComponentProps) {
  const paymentPlan = record as PaymentPlanRecord;
  const scheduleItems = getScheduleItems(paymentPlan);
  const currency = getCurrency(paymentPlan, config);

  // Handle empty state
  if (scheduleItems.length === 0) {
    return (
      <div className="border rounded-lg bg-card p-8 text-center text-muted-foreground">
        <p>No schedule items yet.</p>
        <p className="text-sm mt-1">
          Schedule will be generated when the payment plan is configured.
        </p>
      </div>
    );
  }

  return (
    <ScheduleTable
      currency={currency}
      feeRules={getFeeRules()}
      scheduleItems={scheduleItems}
    />
  );
}

/**
 * Extract currency from the payment plan record or config
 */
function getCurrency(
  record: PaymentPlanRecord,
  config?: Record<string, unknown>,
): string {
  const configCurrency =
    typeof config?.currency === "string" ? config.currency : undefined;
  return record.currency ?? configCurrency ?? "USD";
}

/**
 * Get fee rules from the template if templateId is present
 * For now, this will be empty - fee rules can be added later by fetching template data
 */
function getFeeRules(): [] {
  return [];
}

/**
 * Extract schedule items from the payment plan record
 */
function getScheduleItems(record: PaymentPlanRecord): ScheduleItem[] {
  return record.instanceConfig?.scheduleItems ?? [];
}
