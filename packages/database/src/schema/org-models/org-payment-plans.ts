// schema/payment-plan-instance.ts

import {
  char,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";
import { orgPaymentPlanTemplatesTable } from "./org-payment-plan-templates";

/* -------------------------------- Zod schemas ------------------------------- */

/**
 * Concrete schedule item as generated for a specific payment plan.
 * This is what you will later visualize as the auto-generated sales offer.
 */
export const scheduleItemSchema = z.object({
  id: z.string().optional(), // client-side id if you want
  templateMilestoneCode: z.string().nullable().optional(),
  occurrenceIndex: z.number().int().nullable().optional(), // 1..N if recurring

  dueDate: z.string().nullable().optional(), // ISO date
  isDueDateEstimated: z.boolean().optional().default(false),

  principalDue: z.number().default(0),
  interestDue: z.number().default(0),
  feesDue: z.number().default(0),

  amountDue: z.number().default(0),

  status: z
    .enum(["pending", "partial", "paid", "overdue", "waived", "cancelled"])
    .default("pending"),

  metadata: z.record(z.any(), z.any()).optional().default({}),
});

export type ScheduleItem = z.infer<typeof scheduleItemSchema>;

/**
 * Plan events (booking date, handover date, etc.) kept flexible.
 */
export const planEventsSchema = z
  .object({
    bookingDate: z.string().nullable().optional(), // ISO date
    contractSigningDate: z.string().nullable().optional(),
    handoverDate: z.string().nullable().optional(),
    // extend as needed: custom event keys
  })
  .loose(); // allow extra keys

export type PlanEvents = z.infer<typeof planEventsSchema>;

/**
 * JSON holder for the instance-level structure.
 */
export const paymentPlanInstanceConfigSchema = z.object({
  events: planEventsSchema.default({}),
  scheduleItems: z.array(scheduleItemSchema).default([]),
});

export type PaymentPlanInstanceConfig = z.infer<
  typeof paymentPlanInstanceConfigSchema
>;

export const orgPaymentPlansTable = pgTable("org_payment_plans", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  templateId: integer("template_id").references(
    () => orgPaymentPlanTemplatesTable.id,
  ),

  currency: char("currency", { length: 3 }).notNull(),
  principalAmount: numeric("principal_amount", {
    precision: 18,
    scale: 2,
  }).notNull(),

  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }),

  status: varchar("status", { length: 50 }).notNull(), // 'draft','active','completed',...

  // child schedule/instance data as jsonb
  instanceConfig: jsonb("instance_config")
    .$type<PaymentPlanInstanceConfig>()
    .notNull(),
});

export type NewOrgPaymentPlan = typeof orgPaymentPlansTable.$inferInsert;
export type OrgPaymentPlan = typeof orgPaymentPlansTable.$inferSelect;
