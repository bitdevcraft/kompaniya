/**
 * Default table column preferences for each entity type
 *
 * These define the default visibility, order, and pinning for columns
 * when a user hasn't customized their view yet.
 */

import type {
  ColumnOrderState,
  ColumnVisibilityState,
} from "../schema/org-models/org-user-table-preferences";

/**
 * Default column preferences per entity type
 * Custom field columns (prefixed with "customFields.") are handled separately
 * and added to the end of the order array by the service
 */
export const DEFAULT_TABLE_COLUMN_PREFERENCES = {
  org_contacts: {
    visibility: {
      name: true,
      email: true,
      phone: true,
      companyName: true,
      tags: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: [
      "name",
      "email",
      "phone",
      "companyName",
      "tags",
      "createdAt",
      "updatedAt",
    ] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_leads: {
    visibility: {
      name: true,
      email: true,
      phone: true,
      score: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: [
      "name",
      "email",
      "phone",
      "score",
      "createdAt",
      "updatedAt",
    ] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_accounts: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_opportunities: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_activities: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_categories: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_tags: {
    visibility: {
      name: true,
      color: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: [
      "name",
      "color",
      "createdAt",
      "updatedAt",
    ] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_events: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_tasks: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_email_templates: {
    visibility: {
      name: true,
      subject: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: [
      "name",
      "subject",
      "createdAt",
      "updatedAt",
    ] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_email_campaigns: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_email_domains: {
    visibility: {
      domain: true,
      verified: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: [
      "domain",
      "verified",
      "createdAt",
      "updatedAt",
    ] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_real_estate_projects: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_real_estate_properties: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_real_estate_bookings: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_payment_plans: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_payment_plan_templates: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_email_test_receivers: {
    visibility: {
      email: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["email", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_emails: {
    visibility: {
      subject: true,
      to: true,
      status: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: [
      "subject",
      "to",
      "status",
      "createdAt",
      "updatedAt",
    ] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_email_clicks: {
    visibility: {
      link: true,
      clickedAt: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: [
      "link",
      "clickedAt",
      "createdAt",
      "updatedAt",
    ] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
  org_real_estate_booking_buyers: {
    visibility: {
      name: true,
      createdAt: false,
      updatedAt: false,
    } satisfies ColumnVisibilityState,
    order: ["name", "createdAt", "updatedAt"] satisfies ColumnOrderState,
    pinning: {
      left: [],
      right: ["actions"],
    },
  },
} as const;

export type DefaultTablePreferenceEntityType =
  keyof typeof DEFAULT_TABLE_COLUMN_PREFERENCES;

export const getDefaultTableColumnPreferences = (
  entityType: DefaultTablePreferenceEntityType,
) => {
  const defaults = DEFAULT_TABLE_COLUMN_PREFERENCES[entityType];

  return {
    visibility: { ...defaults.visibility },
    order: [...defaults.order],
    pinning: {
      left: [...defaults.pinning.left],
      right: [...defaults.pinning.right],
    },
  };
};
