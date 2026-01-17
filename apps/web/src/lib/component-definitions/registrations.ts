import type { CustomComponentDefinition } from "@repo/domain";

import { ActivityTimeline } from "@/components/custom-components/activity-timeline";
import { EmailHistory } from "@/components/custom-components/email-history";
import { PaymentSchedulePreview } from "@/components/custom-components/payment-schedule-preview";
import { PaymentScheduleTable } from "@/components/custom-components/payment-schedule-table";

import { registerComponent } from "./registry";

const ACTIVITY_TIMELINE_DEFINITION: CustomComponentDefinition = {
  id: "activity-timeline",
  label: "Activity Timeline",
  description: "Recent activity updates and milestones.",
  category: "activity",
  iconName: "Activity",
  entityTypes: [],
  props: {
    title: "Activity Timeline",
    limit: 5,
  },
};

const EMAIL_HISTORY_DEFINITION: CustomComponentDefinition = {
  id: "email-history",
  label: "Email History",
  description: "Recent email interactions for this record.",
  category: "communication",
  iconName: "Mail",
  entityTypes: [],
  props: {
    title: "Email History",
  },
};

const PAYMENT_SCHEDULE_TABLE_DEFINITION: CustomComponentDefinition = {
  id: "payment-schedule",
  label: "Payment Schedule",
  description: "Display payment schedule for this payment plan",
  category: "finance",
  iconName: "DollarSign",
  entityTypes: ["org_payment_plans"],
  props: {
    currency: "USD",
  },
};

const PAYMENT_SCHEDULE_PREVIEW_DEFINITION: CustomComponentDefinition = {
  id: "schedule-preview",
  label: "Schedule Preview",
  description: "Preview payment schedule from template",
  category: "finance",
  iconName: "Eye",
  entityTypes: ["org_payment_plan_templates"],
  props: {
    currency: "USD",
    previewAmount: 100000,
  },
};

export function registerAllCustomComponents() {
  registerComponent(ACTIVITY_TIMELINE_DEFINITION, ActivityTimeline);
  registerComponent(EMAIL_HISTORY_DEFINITION, EmailHistory);
  registerComponent(PAYMENT_SCHEDULE_TABLE_DEFINITION, PaymentScheduleTable);
  registerComponent(
    PAYMENT_SCHEDULE_PREVIEW_DEFINITION,
    PaymentSchedulePreview,
  );
}
