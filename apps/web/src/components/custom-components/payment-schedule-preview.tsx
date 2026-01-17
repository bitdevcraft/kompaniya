/**
 * Payment Schedule Preview Custom Component
 *
 * Shows a preview of the payment schedule from a template.
 * This component can be added to payment plan template record layouts.
 */

"use client";

import type { PaymentPlanTemplateConfig } from "@repo/database/schema";
import type { ScheduleGenerationResult } from "@repo/shared/payment-plan";

import { generateSchedule } from "@repo/shared/payment-plan";
import { format } from "date-fns";

import type { CustomComponentProps } from "@/lib/component-definitions";

import { SchedulePreview } from "@/app/(authenticated)/record/(real-estate)/payment-plan-templates/components/payment-plan-template-builder/schedule-preview";

type PaymentPlanTemplateRecord = {
  defaultCurrency?: string;
  minPrincipal?: string | number;
  templateConfig?: PaymentPlanTemplateConfig;
};

export function PaymentSchedulePreview({
  record,
  config,
}: CustomComponentProps) {
  const template = record as PaymentPlanTemplateRecord;
  const currency =
    typeof config?.currency === "string"
      ? config.currency
      : (template.defaultCurrency ?? "USD");
  const previewAmount =
    typeof config?.previewAmount === "number"
      ? config.previewAmount
      : template.minPrincipal
        ? Number(template.minPrincipal)
        : 100_000;

  // Check if template has milestones configured
  const hasMilestones =
    template.templateConfig?.milestones &&
    template.templateConfig.milestones.length > 0;

  if (!hasMilestones) {
    return (
      <div className="border rounded-lg bg-card p-8 text-center text-muted-foreground">
        <p>No milestones configured.</p>
        <p className="text-sm mt-1">
          Add milestones to the template to see the schedule preview.
        </p>
      </div>
    );
  }

  // Generate the schedule from template config
  const schedule = generateSchedule({
    template: template.templateConfig ?? {
      milestones: [],
      feeRules: [],
    },
    principalAmount: previewAmount,
    currency,
    startDate: format(new Date(), "yyyy-MM-dd"),
    events: {
      bookingDate: null,
      contractSigningDate: null,
      handoverDate: null,
    },
  });

  return <SchedulePreview currency={currency} schedule={schedule} />;
}

// SchedulePreview component from the template builder
// This uses the actual SchedulePreview component which expects ScheduleGenerationResult
export function PaymentSchedulePreviewWithData({
  schedule,
  currency,
}: {
  schedule: ScheduleGenerationResult | null;
  currency: string;
}) {
  return <SchedulePreview currency={currency} schedule={schedule} />;
}
