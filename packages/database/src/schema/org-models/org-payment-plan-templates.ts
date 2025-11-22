// schema/payment-plan-template.ts

import {
  boolean,
  char,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

/* -------------------------------- Zod schemas ------------------------------- */

/**
 * Milestone template (child of payment_plan_template)
 * Drives both one-off and interval schedules (15 days, monthly, quarterly, etc.).
 */
export const templateMilestoneSchema = z.object({
  code: z.string(), // 'BOOKING_15D', 'POST_HANDOVER_M1'
  label: z.string(),
  description: z.string().optional(),

  sequenceNumber: z.number().int().min(1),

  // scheduling
  schedulePatternType: z.enum(["single", "recurring"]),
  anchorType: z.enum([
    "absolute_date",
    "relative_to_plan_start",
    "relative_to_event",
  ]),
  anchorEventType: z.string().nullable().optional(), // 'booking', 'handover', etc.

  anchorOffsetDays: z.number().int().optional().default(0),
  anchorOffsetMonths: z.number().int().optional().default(0),

  isAfterHandover: z.boolean().optional().default(false),

  // interval config (for recurring patterns)
  intervalUnit: z.enum(["days", "months"]).nullable().optional(), // days = every N days, months = every N months
  intervalValue: z.number().int().nullable().optional(), // e.g. 15, 1, 3, 6, 12
  intervalOccurrences: z.number().int().nullable().optional(), // how many times to repeat
  intervalLabel: z
    .enum(["monthly", "quarterly", "semi_annual", "annual", "every_15_days"])
    .or(z.string())
    .nullable()
    .optional(),

  // amount definition
  amountMode: z.enum([
    "percentage_of_principal",
    "percentage_of_remaining_principal",
    "fixed_amount",
    "formula",
  ]),
  amountValue: z.number(), // 0.10 => 10% if percentage; absolute if fixed
  minAmount: z.number().nullable().optional(),
  maxAmount: z.number().nullable().optional(),

  required: z.boolean().optional().default(true),
  allowOverride: z.boolean().optional().default(true),

  metadata: z.record(z.any(), z.any()).optional().default({}),
});

export type TemplateMilestone = z.infer<typeof templateMilestoneSchema>;

export const templateFeeRuleSchema = z.object({
  code: z.string(), // 'ADMIN_FEE', 'LATE_FEE_INSTALLMENT'
  name: z.string(),
  description: z.string().optional(),

  // linkage to milestone (by code) if needed on the JSON side
  milestoneCode: z.string().optional().nullable(),

  triggerTiming: z.enum([
    "on_plan_creation",
    "on_booking",
    "on_contract_signing",
    "on_handover",
    "on_milestone_due",
    "on_late",
    "on_payment",
  ]),

  chargeScope: z.enum(["plan", "milestone", "installment"]),

  calculationType: z.enum([
    "fixed",
    "percentage_of_principal",
    "percentage_of_installment",
    "percentage_of_outstanding",
  ]),

  calculationBase: z.enum([
    "principal",
    "installment_amount",
    "outstanding_principal",
    "custom",
  ]),

  rateValue: z.number(), // 0.02 => 2% if percentage; absolute if fixed

  minAmount: z.number().nullable().optional(),
  maxAmount: z.number().nullable().optional(),

  postingBehavior: z.enum([
    "include_in_same_installment",
    "separate_installment",
    "accrued_only",
  ]),

  isRefundable: z.boolean().optional().default(false),

  metadata: z.record(z.any(), z.any()).optional().default({}),
});

export type TemplateFeeRule = z.infer<typeof templateFeeRuleSchema>;

/**
 * JSON shape stored in payment_plan_template.milestones / .feeRules
 */
export const paymentPlanTemplateConfigSchema = z.object({
  milestones: z.array(templateMilestoneSchema),
  feeRules: z.array(templateFeeRuleSchema).default([]),
});

export type PaymentPlanTemplateConfig = z.infer<
  typeof paymentPlanTemplateConfigSchema
>;

/* --------------------------- Drizzle parent table --------------------------- */

export const orgPaymentPlanTemplatesTable = pgTable(
  "org_payment_plan_templates",
  {
    ...baseIdModel,
    ...baseTimestampModel,
    ...baseOrganizationModel,
    ...baseOwnerModel,
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),

    defaultCurrency: char("default_currency", { length: 3 }),
    subjectType: varchar("subject_type", { length: 100 }), // 'real_estate_unit', 'invoice', etc.

    minPrincipal: numeric("min_principal", { precision: 18, scale: 2 }),
    maxPrincipal: numeric("max_principal", { precision: 18, scale: 2 }),

    isActive: boolean("is_active").notNull().default(true),
    version: integer("version").notNull().default(1),

    // child "tables" collapsed into JSONB
    templateConfig: jsonb("template_config")
      .$type<PaymentPlanTemplateConfig>()
      .notNull(),
  },
);

export type NewOrgPaymentPlanTemplate =
  typeof orgPaymentPlanTemplatesTable.$inferInsert;
export type OrgPaymentPlanTemplate =
  typeof orgPaymentPlanTemplatesTable.$inferSelect;
