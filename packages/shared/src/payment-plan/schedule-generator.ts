/**
 * Payment Plan Schedule Generator
 *
 * Generates payment schedules from templates with support for:
 * - Single and recurring milestones
 * - Multiple anchor types (absolute date, relative to plan start, relative to events)
 * - Fee rules with various trigger timings
 * - Complex amount calculations (percentages, fixed amounts)
 */

/* eslint-disable @typescript-eslint/restrict-template-expressions */

import type {
  PaymentPlanTemplateConfig,
  PlanEvents,
  ScheduleItem,
  TemplateFeeRule,
  TemplateMilestone,
} from "@repo/database/schema";

/**
 * Parameters for schedule generation
 */
export interface ScheduleGenerationParams {
  template: PaymentPlanTemplateConfig;
  principalAmount: number;
  currency: string;
  startDate: string;
  events: PlanEvents;
}

/**
 * Result of schedule generation
 */
export interface ScheduleGenerationResult {
  scheduleItems: ScheduleItem[];
  totalPrincipal: number;
  totalInterest: number;
  totalFees: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
}

/**
 * Main function to generate a payment schedule from a template
 */
export function generateSchedule(
  params: ScheduleGenerationParams,
): ScheduleGenerationResult {
  const { template, principalAmount, startDate } = params;

  // Sort milestones by sequence number
  const sortedMilestones = [...template.milestones].sort(
    (a, b) => a.sequenceNumber - b.sequenceNumber,
  );

  const allItems: ScheduleItem[] = [];
  let remainingPrincipal = principalAmount;
  let sequenceCounter = 1;

  // Generate schedule items from each milestone
  for (const milestone of sortedMilestones) {
    const result = generateItemsFromMilestone(
      milestone,
      params,
      sequenceCounter,
      remainingPrincipal,
    );
    allItems.push(...result.items);
    remainingPrincipal = result.newRemainingPrincipal;

    // Increment sequence counter based on number of items generated
    if (milestone.schedulePatternType === "recurring") {
      sequenceCounter += milestone.intervalOccurrences ?? 1;
    } else {
      sequenceCounter++;
    }
  }

  // Sort all items by due date
  allItems.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Re-sequence items after sorting
  allItems.forEach((item, index) => {
    item.id = item.id ?? `schedule-item-${index + 1}`;
  });

  // Calculate totals
  let totalPrincipal = 0;
  let totalFees = 0;

  for (const item of allItems) {
    totalPrincipal += item.principalDue;
    totalFees += item.feesDue;
  }

  const totalAmount = totalPrincipal + totalFees;

  // Get end date from last item
  const lastItem = allItems.at(-1);
  const endDate = lastItem?.dueDate ?? startDate;

  return {
    scheduleItems: allItems,
    totalPrincipal: Math.round(totalPrincipal * 100) / 100,
    totalInterest: 0, // Interest calculation can be added later
    totalFees: Math.round(totalFees * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    startDate,
    endDate,
  };
}

/**
 * Validate a template configuration
 */
export function validateTemplateConfig(config: PaymentPlanTemplateConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if milestones exist
  if (config.milestones.length === 0) {
    errors.push("Template must have at least one milestone");
  }

  // Check for duplicate milestone codes
  const codes = new Set<string>();
  for (const milestone of config.milestones) {
    if (codes.has(milestone.code)) {
      errors.push(`Duplicate milestone code: ${milestone.code}`);
    }
    codes.add(milestone.code);

    // Validate recurring milestones have interval config
    if (milestone.schedulePatternType === "recurring") {
      if (!milestone.intervalUnit) {
        errors.push(
          `Milestone ${milestone.code} is recurring but missing intervalUnit`,
        );
      }
      if (!milestone.intervalValue) {
        errors.push(
          `Milestone ${milestone.code} is recurring but missing intervalValue`,
        );
      }
    }

    // Validate amount mode
    if (
      milestone.amountMode === "percentage_of_principal" &&
      milestone.amountValue > 100
    ) {
      errors.push(`Milestone ${milestone.code} has percentage > 100%`);
    }
  }

  // Check for duplicate fee rule codes
  const feeCodes = new Set<string>();
  for (const feeRule of config.feeRules) {
    if (feeCodes.has(feeRule.code)) {
      errors.push(`Duplicate fee rule code: ${feeRule.code}`);
    }
    feeCodes.add(feeRule.code);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper to add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Helper to add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Calculate fees for a schedule item based on fee rules
 */
function calculateFeesForItem(
  item: Pick<ScheduleItem, "templateMilestoneCode" | "amountDue">,
  feeRules: readonly TemplateFeeRule[],
  principalAmount: number,
  outstandingBalance: number,
): number {
  let totalFees = 0;

  for (const rule of feeRules) {
    // Check if this fee rule applies
    if (rule.chargeScope === "plan") {
      // Plan-level fees are handled separately
      continue;
    }

    // Check trigger timing
    let shouldApply = false;

    switch (rule.triggerTiming) {
      case "on_milestone_due":
        // Apply to all milestones (or specific ones based on milestoneCode)
        if (
          !rule.milestoneCode ||
          rule.milestoneCode === item.templateMilestoneCode
        ) {
          shouldApply = true;
        }
        break;
      case "on_plan_creation":
        // This would be handled as a separate schedule item
        continue;
      case "on_booking":
      case "on_contract_signing":
      case "on_handover":
        // Event-based fees - would need to check events
        // For now, apply if milestone code matches
        shouldApply =
          !rule.milestoneCode ||
          rule.milestoneCode === item.templateMilestoneCode;
        break;
      default:
        shouldApply =
          !rule.milestoneCode ||
          rule.milestoneCode === item.templateMilestoneCode;
    }

    if (!shouldApply) continue;

    // Calculate the fee amount
    let feeAmount = 0;

    switch (rule.calculationType) {
      case "fixed":
        feeAmount = rule.rateValue;
        break;

      case "percentage_of_principal":
        feeAmount = principalAmount * (rule.rateValue / 100);
        break;

      case "percentage_of_installment":
        feeAmount = item.amountDue * (rule.rateValue / 100);
        break;

      case "percentage_of_outstanding":
        feeAmount = outstandingBalance * (rule.rateValue / 100);
        break;
    }

    // Apply fee constraints
    if (
      rule.minAmount !== null &&
      rule.minAmount !== undefined &&
      feeAmount < rule.minAmount
    ) {
      feeAmount = rule.minAmount;
    }
    if (
      rule.maxAmount !== null &&
      rule.maxAmount !== undefined &&
      feeAmount > rule.maxAmount
    ) {
      feeAmount = rule.maxAmount;
    }

    totalFees += Math.round(feeAmount * 100) / 100;
  }

  return totalFees;
}

/**
 * Calculate the amount for a milestone based on amount mode
 */
function calculateMilestoneAmount(
  milestone: TemplateMilestone,
  principalAmount: number,
  remainingPrincipal: number,
): number {
  const { amountMode, amountValue, minAmount, maxAmount } = milestone;

  let calculatedAmount: number;

  switch (amountMode) {
    case "fixed_amount":
      calculatedAmount = amountValue;
      break;

    case "percentage_of_principal":
      calculatedAmount = principalAmount * (amountValue / 100);
      break;

    case "percentage_of_remaining_principal":
      calculatedAmount = remainingPrincipal * (amountValue / 100);
      break;

    case "formula":
      // For now, treat formula as percentage of principal
      // In the future, this could support custom formulas
      calculatedAmount = principalAmount * (amountValue / 100);
      break;

    default:
      calculatedAmount = 0;
  }

  // Apply min/max constraints
  if (
    minAmount !== null &&
    minAmount !== undefined &&
    calculatedAmount < minAmount
  ) {
    calculatedAmount = minAmount;
  }
  if (
    maxAmount !== null &&
    maxAmount !== undefined &&
    calculatedAmount > maxAmount
  ) {
    calculatedAmount = maxAmount;
  }

  return Math.round(calculatedAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate schedule items from a single milestone
 */
function generateItemsFromMilestone(
  milestone: TemplateMilestone,
  params: ScheduleGenerationParams,
  sequenceStart: number,
  remainingPrincipal: number,
): { items: ScheduleItem[]; newRemainingPrincipal: number } {
  const items: ScheduleItem[] = [];
  const { startDate, events, principalAmount, template } = params;

  // Get the anchor date
  const anchorDate = getAnchorDate(
    startDate,
    events,
    milestone.anchorType,
    milestone.anchorEventType,
  );

  // Calculate the base due date
  let baseDueDate = anchorDate;
  if (milestone.anchorOffsetDays) {
    baseDueDate = addDays(baseDueDate, milestone.anchorOffsetDays);
  }
  if (milestone.anchorOffsetMonths) {
    baseDueDate = addMonths(baseDueDate, milestone.anchorOffsetMonths);
  }

  // Generate items based on schedule pattern type
  if (milestone.schedulePatternType === "single") {
    const principalDue = calculateMilestoneAmount(
      milestone,
      principalAmount,
      remainingPrincipal,
    );
    const feesDue = calculateFeesForItem(
      {
        templateMilestoneCode: milestone.code,
        amountDue: principalDue,
      },
      template.feeRules,
      principalAmount,
      remainingPrincipal,
    );

    items.push({
      id: `milestone-${milestone.code}-${sequenceStart}`,
      templateMilestoneCode: milestone.code,
      occurrenceIndex: 1,
      dueDate: toISODate(baseDueDate),
      isDueDateEstimated: milestone.anchorType !== "absolute_date",
      principalDue,
      interestDue: 0,
      feesDue,
      amountDue: principalDue + feesDue,
      status: "pending",
      metadata: milestone.metadata as Record<string, unknown>,
    });

    return {
      items,
      newRemainingPrincipal: remainingPrincipal - principalDue,
    };
  }

  // Recurring pattern
  const occurrences = milestone.intervalOccurrences ?? 1;
  const intervalUnit = milestone.intervalUnit ?? "months";
  const intervalValue = milestone.intervalValue ?? 1;

  let currentDueDate = baseDueDate;
  let currentRemainingPrincipal = remainingPrincipal;

  for (let i = 0; i < occurrences; i++) {
    const principalDue = calculateMilestoneAmount(
      milestone,
      principalAmount,
      currentRemainingPrincipal,
    );
    const feesDue = calculateFeesForItem(
      {
        templateMilestoneCode: milestone.code,
        amountDue: principalDue,
      },
      template.feeRules,
      principalAmount,
      currentRemainingPrincipal,
    );

    items.push({
      id: `milestone-${milestone.code}-${sequenceStart}-${i + 1}`,
      templateMilestoneCode: milestone.code,
      occurrenceIndex: i + 1,
      dueDate: toISODate(currentDueDate),
      isDueDateEstimated: milestone.anchorType !== "absolute_date",
      principalDue,
      interestDue: 0,
      feesDue,
      amountDue: principalDue + feesDue,
      status: "pending",
      metadata: milestone.metadata as Record<string, unknown>,
    });

    // Update remaining principal
    currentRemainingPrincipal -= principalDue;

    // Move to next occurrence
    if (intervalUnit === "days") {
      currentDueDate = addDays(currentDueDate, intervalValue);
    } else {
      currentDueDate = addMonths(currentDueDate, intervalValue);
    }
  }

  return {
    items,
    newRemainingPrincipal: currentRemainingPrincipal,
  };
}

/**
 * Get the anchor date based on anchor type
 */
function getAnchorDate(
  startDate: string,
  events: PlanEvents,
  anchorType: TemplateMilestone["anchorType"],
  anchorEventType?: string | null,
): Date {
  const planStart = new Date(startDate);

  switch (anchorType) {
    case "absolute_date":
      // For absolute dates, we'll use the offset from plan start as the actual date
      return planStart;

    case "relative_to_plan_start":
      return planStart;

    case "relative_to_event":
      if (anchorEventType === "booking" && events.bookingDate) {
        return new Date(events.bookingDate);
      }
      if (
        anchorEventType === "contract_signing" &&
        events.contractSigningDate
      ) {
        return new Date(events.contractSigningDate);
      }
      if (anchorEventType === "handover" && events.handoverDate) {
        return new Date(events.handoverDate);
      }
      // Fallback to plan start if event not found
      return planStart;

    default:
      return planStart;
  }
}

/**
 * Helper to format date as ISO string
 */
function toISODate(date: Date): string {
  const parts = date.toISOString().split("T");
  return parts[0] ?? "";
}
