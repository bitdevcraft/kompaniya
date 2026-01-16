/**
 * Payment Plan Domain Types
 *
 * Re-exports database schema types and adds UI-specific types for payment plans.
 */

import type {
  PaymentPlanTemplateConfig,
  PlanEvents,
  ScheduleItem,
} from "@repo/database/schema";

export type { PaymentPlanTemplateConfig, PlanEvents, ScheduleItem };

export interface FeeDisplay {
  code: string;
  name: string;
  amount: number;
  calculatedFrom: string;
}

export interface FeeRuleFormData {
  id?: string;
  code: string;
  name: string;
  description?: string;
  milestoneCode?: string;
  triggerTiming:
    | "on_plan_creation"
    | "on_booking"
    | "on_contract_signing"
    | "on_handover"
    | "on_milestone_due"
    | "on_late"
    | "on_payment";
  chargeScope: "plan" | "milestone" | "installment";
  calculationType:
    | "fixed"
    | "percentage_of_principal"
    | "percentage_of_installment"
    | "percentage_of_outstanding";
  calculationBase:
    | "principal"
    | "installment_amount"
    | "outstanding_principal"
    | "custom";
  rateValue: number;
  minAmount?: number;
  maxAmount?: number;
  postToSeparateLineItem: boolean;
  refundable: boolean;
  // New fields for recurring/one-time support
  applyMode?: "all_occurrences" | "specific_occurrence";
  occurrenceNumber?: number;
}

// Form-specific types
export interface MilestoneFormData {
  id?: string;
  code: string;
  label: string;
  description?: string;
  sequenceNumber: number;
  schedulePatternType: "single" | "recurring";
  anchorType: "absolute_date" | "relative_to_plan_start" | "relative_to_event";
  anchorEventType?: "booking" | "contract_signing" | "handover" | "custom";
  offsetDays?: number;
  offsetMonths?: number;
  recurringCount?: number;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  amountMode:
    | "fixed_amount"
    | "percentage_of_principal"
    | "percentage_of_remaining_principal"
    | "formula";
  amountValue?: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaymentPlanTemplateFormData {
  name: string;
  code: string;
  description?: string;
  defaultCurrency: string;
  subjectType?: string;
  minPrincipal?: number;
  maxPrincipal?: number;
  isActive: boolean;
  milestones: MilestoneFormData[];
  feeRules: FeeRuleFormData[];
}

// UI-specific types
export interface ScheduleDisplayItem extends ScheduleItem {
  formattedDueDate?: string;
  formattedAmounts?: {
    principal: string;
    interest: string;
    fees: string;
    total: string;
  };
  feeBreakdown?: FeeDisplay[];
}

// Schedule generation types
export interface ScheduleGenerationParams {
  template: PaymentPlanTemplateConfig;
  principalAmount: number;
  currency: string;
  startDate: string;
  events: PlanEvents;
}

export interface ScheduleGenerationResult {
  scheduleItems: ScheduleItem[];
  totalPrincipal: number;
  totalInterest: number;
  totalFees: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
}

// Status options
export const SCHEDULE_ITEM_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Waived", value: "waived" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export const PAYMENT_PLAN_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
] as const;
