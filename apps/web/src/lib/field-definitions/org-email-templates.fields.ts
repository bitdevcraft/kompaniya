import type { NativeFieldDefinition } from "./types";

/**
 * Native field definitions for Email Templates (org_email_templates)
 */
export const orgEmailTemplatesFields: NativeFieldDefinition[] = [
  {
    id: "name",
    label: "Template name",
    type: "text",
    category: "identity",
    group: "Template Info",
    sortOrder: 1,
  },
  {
    id: "subject",
    label: "Subject",
    type: "text",
    category: "metadata",
    group: "Content",
    sortOrder: 1,
  },
  {
    id: "body",
    label: "Body",
    type: "textarea",
    category: "metadata",
    group: "Content",
    sortOrder: 2,
  },
  {
    id: "mjml",
    label: "MJML",
    type: "mjml",
    category: "metadata",
    group: "Content",
    sortOrder: 3,
  },
  {
    id: "description",
    label: "Description",
    type: "textarea",
    category: "metadata",
    group: "Details",
    sortOrder: 1,
  },
];
