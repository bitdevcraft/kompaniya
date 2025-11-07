import {
  RecordFieldOption,
  RecordPageLayout,
} from "@/components/record-page/layout";

import type { ContactRecordFormValues } from "./contact-record-schema";

const DEFAULT_SEGMENTATION_OPTIONS: RecordFieldOption[] = [
  { label: "item 1", value: "item 1" },
  { label: "item 2", value: "item 2" },
  { label: "item 3", value: "item 3" },
];

export const contactRecordLayout: RecordPageLayout<ContactRecordFormValues> = {
  header: {
    avatar: {
      fallbackFieldId: "name",
      imageFieldId: "avatarUrl",
    },
    chips: [
      {
        fieldId: "email",
        icon: "mail",
        id: "email-chip",
        linkType: "mailto",
      },
      {
        fieldId: "phone",
        icon: "phone",
        id: "phone-chip",
        linkType: "tel",
      },
      {
        fieldId: "websiteUrl",
        icon: "globe",
        id: "website-chip",
        linkType: "url",
      },
    ],
    metadata: [
      {
        fieldId: "createdAt",
        id: "created-at",
        label: "Created",
        type: "datetime",
      },
      {
        fieldId: "updatedAt",
        id: "updated-at",
        label: "Updated",
        type: "datetime",
      },
      {
        fieldId: "lastActivityAt",
        id: "last-activity",
        label: "Last activity",
        type: "datetime",
      },
    ],
    subtitle: [
      {
        fieldId: "companyName",
      },
      {
        fieldId: "languagePref",
        prefix: "Language: ",
      },
    ],
    title: {
      fallback: "Unnamed contact",
      fieldId: "name",
    },
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Key identifiers that appear across the CRM, email campaigns, and automation workflows.",
          fields: [
            { id: "name", label: "Full name", type: "text" },
            { id: "salutation", label: "Salutation", type: "text" },
            { id: "companyName", label: "Company", type: "text" },
            {
              id: "email",
              label: "Email",
              placeholder: "name@example.com",
              type: "text",
            },
            {
              id: "phone",
              label: "Phone",
              placeholder: "+1 (555) 000-0000",
              type: "phone",
            },
            {
              id: "websiteUrl",
              label: "Website",
              placeholder: "https://",
              type: "text",
            },
            { id: "linkedinUrl", label: "LinkedIn", type: "text" },
            { id: "twitterHandle", label: "Twitter", type: "text" },
            { id: "languagePref", label: "Language preference", type: "text" },
            { id: "nationality", label: "Nationality", type: "text" },
            { id: "score", label: "Engagement score", type: "number" },
            { id: "birthday", label: "Birthday", type: "date" },
          ],
          id: "profile",
          title: "Profile",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description:
            "Classify the contact for list building, segmentation, and personalization.",
          fields: [
            {
              colSpan: 2,
              description:
                "Comma or line separated tags make it easy to drive automations.",
              id: "tags",
              label: "Tags",
              placeholder: "Add tags…",
              options: DEFAULT_SEGMENTATION_OPTIONS,
              type: "multipicklist",
            },
            {
              colSpan: 2,
              description: "Group contacts into consistent buckets for reporting.",
              id: "categories",
              label: "Categories",
              placeholder: "Add categories…",
              options: DEFAULT_SEGMENTATION_OPTIONS,
              type: "multipicklist",
            },
            { id: "industry", label: "Industry", type: "text" },
            { id: "annualRevenueBand", label: "Revenue band", type: "text" },
            { id: "employeeCountBand", label: "Company size", type: "text" },
          ],
          id: "segmentation",
          title: "Segmentation",
        },
        {
          description:
            "How this contact prefers to hear from us and their current consent status.",
          fields: [
            { id: "emailOptIn", label: "Email opt-in", type: "boolean" },
            { id: "smsOptIn", label: "SMS opt-in", type: "boolean" },
            { id: "phoneOptIn", label: "Phone opt-in", type: "boolean" },
            { id: "doNotContact", label: "Do not contact", type: "boolean" },
            { id: "doNotSell", label: "Do not sell", type: "boolean" },
            { id: "emailConfirmedAt", label: "Email confirmed", type: "datetime" },
            {
              id: "consentCapturedAt",
              label: "Consent captured",
              type: "datetime",
            },
            { id: "consentSource", label: "Consent source", type: "text" },
            { id: "consentIp", label: "Consent IP", type: "text" },
            { id: "gdprConsentScope", label: "Consent scope", type: "text" },
          ],
          id: "consent",
          title: "Consent & preferences",
        },
        {
          columns: 2,
          description: "Shipping details used for fulfillment and customer care.",
          fields: [
            { id: "shippingAddressLine1", label: "Address line 1", type: "text" },
            { id: "shippingAddressLine2", label: "Address line 2", type: "text" },
            { id: "shippingCity", label: "City", type: "text" },
            { id: "shippingRegion", label: "State / region", type: "text" },
            { id: "shippingPostalCode", label: "Postal code", type: "text" },
            { id: "shippingCountryCode", label: "Country", type: "text" },
            { id: "shippingLatitude", label: "Latitude", type: "text" },
            { id: "shippingLongitude", label: "Longitude", type: "text" },
          ],
          id: "shipping",
          title: "Shipping address",
        },
        {
          columns: 2,
          description:
            "Billing information that syncs with invoices and payment records.",
          fields: [
            { id: "billingAddressLine1", label: "Address line 1", type: "text" },
            { id: "billingAddressLine2", label: "Address line 2", type: "text" },
            { id: "billingCity", label: "City", type: "text" },
            { id: "billingRegion", label: "State / region", type: "text" },
            { id: "billingPostalCode", label: "Postal code", type: "text" },
            { id: "billingCountryCode", label: "Country", type: "text" },
            { id: "billingLatitude", label: "Latitude", type: "text" },
            { id: "billingLongitude", label: "Longitude", type: "text" },
          ],
          id: "billing",
          title: "Billing address",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description:
            "Track the last touchpoint and upcoming follow-up for this contact.",
          fields: [
            {
              description: "When we last heard from or engaged with this contact.",
              id: "lastActivityAt",
              label: "Last activity",
              type: "datetime",
            },
            {
              description: "The next scheduled task, outreach, or reminder.",
              id: "nextActivityAt",
              label: "Next activity",
              type: "datetime",
            },
            {
              colSpan: 2,
              description:
                "Internal notes that stay with the team—customers never see these.",
              id: "notes",
              label: "Internal notes",
              type: "textarea",
            },
          ],
          id: "activity",
          title: "Activity",
        },
        {
          description:
            "System metadata used for deduplication and downstream integrations.",
          fields: [{ id: "dedupeKey", label: "Dedupe key", type: "text" }],
          id: "system",
          title: "System metadata",
        },
      ],
    },
    sidebar: "secondColumn",
  },
  supplementalFields: [
    { id: "avatarUrl", label: "Avatar", readOnly: true, type: "text" },
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
  ],
};
