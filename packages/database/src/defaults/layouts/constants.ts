/**
 * Shared constants used across record layouts
 */

// Opportunity-related constants
export const OPPORTUNITY_TYPES = [
  { label: "New business", value: "new_business" },
  { label: "Renewal", value: "renewal" },
  { label: "Upsell", value: "upsell" },
  { label: "Cross-sell", value: "cross_sell" },
] as const;

export const OPPORTUNITY_STATUS = [
  { label: "Open", value: "open" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
  { label: "On hold", value: "on_hold" },
] as const;

export const OPPORTUNITY_PRIORITY = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
] as const;

export const FORECAST_CATEGORIES = [
  { label: "Pipeline", value: "pipeline" },
  { label: "Best case", value: "best_case" },
  { label: "Commit", value: "commit" },
  { label: "Omitted", value: "omitted" },
  { label: "Closed", value: "closed" },
] as const;

// Email campaign constants
export const CAMPAIGN_STATUS_OPTIONS = [
  { label: "Draft", value: "DRAFT" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Sending", value: "SENDING" },
  { label: "Paused", value: "PAUSED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Failed", value: "FAILED" },
] as const;

export const TAG_MATCH_OPTIONS = [
  { label: "Match all tags", value: "ALL" },
  { label: "Match any tag", value: "ANY" },
] as const;

export const AUDIENCE_OPTIONS = [
  { label: "Newsletter", value: "newsletter" },
  { label: "Product updates", value: "product-updates" },
  { label: "VIP", value: "vip" },
] as const;

// Real estate constants
export const REAL_ESTATE_PROPERTY_TYPES = [
  { label: "Unit", value: "unit" },
  { label: "Plot", value: "plot" },
  { label: "Villa", value: "villa" },
  { label: "Apartment", value: "apartment" },
  { label: "Other", value: "other" },
] as const;

export const REAL_ESTATE_LISTING_TYPES = [
  { label: "Sale", value: "sale" },
  { label: "Rent", value: "rent" },
] as const;

export const REAL_ESTATE_PROPERTY_STATUS = [
  { label: "Available", value: "available" },
  { label: "Reserved", value: "reserved" },
  { label: "Sold", value: "sold" },
  { label: "Rented", value: "rented" },
  { label: "Inactive", value: "inactive" },
] as const;

export const REAL_ESTATE_PROJECT_STATUS = [
  { label: "Planning", value: "planning" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export const REAL_ESTATE_BOOKING_TYPES = [
  { label: "Sale", value: "sale" },
  { label: "Rent", value: "rent" },
] as const;

export const REAL_ESTATE_BOOKING_STATUS = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
] as const;

// Email domain status
export const EMAIL_DOMAIN_STATUS = [
  { label: "Pending", value: "PENDING" },
  { label: "Ready", value: "READY" },
  { label: "Blocked", value: "BLOCKED" },
] as const;

// Email status
export const EMAIL_STATUS = [
  { label: "Sent", value: "SENT" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Bounced", value: "BOUNCED" },
  { label: "Opened", value: "OPENED" },
  { label: "Complaint", value: "COMPLAINT" },
] as const;
