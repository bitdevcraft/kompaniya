import { FieldOption as RecordFieldOption } from "@repo/domain";

import { type RecordPageLayout } from "@/components/record-page/layout";

import type { AccountRecordFormValues } from "./account-record-schema";

const DEFAULT_SEGMENTATION_OPTIONS: RecordFieldOption[] = [
  { label: "Enterprise", value: "enterprise" },
  { label: "SMB", value: "smb" },
  { label: "Startup", value: "startup" },
];

export const accountRecordLayout: RecordPageLayout<AccountRecordFormValues> = {
  header: {
    metadata: [
      {
        fieldId: "createdAt",
        id: "account-created",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "account-updated",
        label: "Updated",
        type: "datetime",
      },
    ],
    subtitle: [
      { fieldId: "industry", prefix: "Industry: " },
      { fieldId: "annualRevenueBand", prefix: "Revenue: " },
    ],
    title: {
      fallback: "Untitled account",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Primary company details used by the sales, marketing, and finance teams.",
          fields: [
            { id: "name", label: "Account name", type: "text" },
            { id: "companyName", label: "Legal name", type: "text" },
            { id: "industry", label: "Industry", type: "text" },
            {
              id: "email",
              label: "Email",
              placeholder: "name@example.com",
              type: "text",
            },
            { id: "phone", label: "Phone", type: "phone" },
            {
              id: "websiteUrl",
              label: "Website",
              placeholder: "https://",
              type: "text",
            },
            { id: "score", label: "Account score", type: "number" },
          ],
          id: "account-overview",
          title: "Account overview",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description:
            "Categorize the account for segmentation, routing, and automation.",
          fields: [
            {
              colSpan: 2,
              description: "Use tags to power workflows and reporting.",
              id: "tags",
              label: "Tags",
              placeholder: "Add tags…",
              tag: {
                relatedType: "account",
              },
              type: "tag",
            },
            {
              colSpan: 2,
              description: "Classify accounts into cohorts or programs.",
              id: "categories",
              label: "Categories",
              options: DEFAULT_SEGMENTATION_OPTIONS,
              placeholder: "Add categories…",
              type: "multipicklist",
            },
            {
              colSpan: 2,
              description: "Long-form context shared with the account team.",
              id: "notes",
              label: "Notes",
              type: "textarea",
            },
          ],
          id: "account-segmentation",
          title: "Segmentation & notes",
        },
        {
          description:
            "Operational details that influence forecasting and resource planning.",
          fields: [
            { id: "annualRevenueBand", label: "Revenue band", type: "text" },
            { id: "employeeCountBand", label: "Employee band", type: "text" },
          ],
          id: "account-business-profile",
          title: "Business profile",
        },
        {
          columns: 2,
          description: "Shipping details used for fulfillment and support.",
          fields: [
            {
              id: "shippingAddressLine1",
              label: "Address line 1",
              type: "text",
            },
            {
              id: "shippingAddressLine2",
              label: "Address line 2",
              type: "text",
            },
            { id: "shippingCity", label: "City", type: "text" },
            { id: "shippingRegion", label: "State / region", type: "text" },
            { id: "shippingPostalCode", label: "Postal code", type: "text" },
            { id: "shippingCountryCode", label: "Country", type: "text" },
            { id: "shippingLatitude", label: "Latitude", type: "text" },
            { id: "shippingLongitude", label: "Longitude", type: "text" },
          ],
          id: "account-shipping",
          title: "Shipping address",
        },
        {
          columns: 2,
          description:
            "Billing information synchronized with invoices and ERP systems.",
          fields: [
            {
              id: "billingAddressLine1",
              label: "Address line 1",
              type: "text",
            },
            {
              id: "billingAddressLine2",
              label: "Address line 2",
              type: "text",
            },
            { id: "billingCity", label: "City", type: "text" },
            { id: "billingRegion", label: "State / region", type: "text" },
            { id: "billingPostalCode", label: "Postal code", type: "text" },
            { id: "billingCountryCode", label: "Country", type: "text" },
            { id: "billingLatitude", label: "Latitude", type: "text" },
            { id: "billingLongitude", label: "Longitude", type: "text" },
          ],
          id: "account-billing",
          title: "Billing address",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description:
            "Timeline entries provide a quick snapshot of engagement status.",
          fields: [
            {
              availableOnCreate: false,
              id: "lastActivityAt",
              label: "Last activity",
              readOnly: true,
              type: "datetime",
            },
            {
              availableOnCreate: false,
              id: "nextActivityAt",
              label: "Next activity",
              readOnly: true,
              type: "datetime",
            },
          ],
          id: "account-timeline",
          title: "Activity timeline",
        },
        {
          description: "Reference profiles across social platforms.",
          fields: [
            { id: "linkedinUrl", label: "LinkedIn", type: "text" },
            { id: "twitterHandle", label: "Twitter", type: "text" },
          ],
          id: "account-social",
          title: "Social links",
        },
      ],
    },
  },
};
