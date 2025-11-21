import { sql, SQL } from "drizzle-orm";
import {
  boolean,
  char,
  inet,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { baseIdModel } from "../abstract/baseIdModel";
import { baseOrganizationModel } from "../abstract/baseOrganizationModel";
import { baseOwnerModel } from "../abstract/baseOwnerModel";
import { baseTimestampModel } from "../abstract/baseTimestampModel";

export const orgContactsTable = pgTable("org_contacts", {
  ...baseIdModel,
  ...baseTimestampModel,
  ...baseOrganizationModel,
  ...baseOwnerModel,

  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  salutation: varchar("salutation", { length: 255 }),
  name: varchar("name", { length: 1024 }).generatedAlwaysAs(
    (): SQL =>
      sql`btrim(
        coalesce(${orgContactsTable.salutation} || ' ', '') ||
        ${orgContactsTable.firstName} || ' ' || ${orgContactsTable.lastName}
      )`,
  ),
  phone: varchar("phone", { length: 50 }),
  phoneE164: varchar("phone_e164", { length: 50 }),

  email: varchar("email", { length: 255 }),
  emailNormalized: text("email_normalized"),
  nationality: varchar("nationality", { length: 255 }),

  // Additional Data
  tags: text("tags").array(),
  categories: text("categories").array(),

  notes: text("notes"),

  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
  nextActivityAt: timestamp("next_activity_at", { withTimezone: true }),
  score: numeric("score", { precision: 10, scale: 2 }),

  // Consent & compliance
  emailOptIn: boolean("email_opt_in").notNull().default(false),
  smsOptIn: boolean("sms_opt_in").notNull().default(false),
  phoneOptIn: boolean("phone_opt_in").notNull().default(false),
  emailConfirmedAt: timestamp("email_confirmed_at", { withTimezone: true }),
  consentCapturedAt: timestamp("consent_captured_at", { withTimezone: true }),
  consentSource: text("consent_source"),
  consentIp: inet("consent_ip"),
  gdprConsentScope: text("gdpr_consent_scope"),
  doNotContact: boolean("do_not_contact").notNull().default(false),
  doNotSell: boolean("do_not_sell").notNull().default(false),

  // Shipping Address
  shippingAddressLine1: text("shipping_address_line1"),
  shippingAddressLine2: text("shipping_address_line2"),
  shippingCity: text("shipping_city"),
  shippingRegion: text("shipping_region"),
  shippingPostalCode: text("shipping_postal_code"),
  shippingCountryCode: char("shipping_country_code", { length: 3 }),
  shippingLatitude: numeric("shipping_latitude", { precision: 9, scale: 6 }),
  shippingLongitude: numeric("shipping_longitude", { precision: 9, scale: 6 }),

  // Billing Address
  billingAddressLine1: text("billing_address_line1"),
  billingAddressLine2: text("billing_address_line2"),
  billingCity: text("billing_city"),
  billingRegion: text("billing_region"),
  billingPostalCode: text("billing_postal_code"),
  billingCountryCode: char("billing_country_code", { length: 3 }),
  billingLatitude: numeric("billing_latitude", { precision: 9, scale: 6 }),
  billingLongitude: numeric("billing_longitude", { precision: 9, scale: 6 }),

  // Communication preferences
  languagePref: text("language_pref"),

  // System & hygiene
  dedupeKey: text("dedupe_key"),
  externalIds: jsonb("external_ids").$type<Record<string, string | number>>(),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),

  // Enrichments
  linkedinUrl: text("linkedin_url"),
  twitterHandle: text("twitter_handle"),
  websiteUrl: text("website_url"),
  companyName: text("company_name"),
  avatarUrl: text("avatar_url"),
  birthday: timestamp("birthday", { mode: "date" }),
  industry: text("industry"),
  annualRevenueBand: text("annual_revenue_band"),
  employeeCountBand: text("employee_count_band"),

  metadata: jsonb("metadata"),
});

export type NewOrgContact = typeof orgContactsTable.$inferInsert;
export type OrgContact = typeof orgContactsTable.$inferSelect;
