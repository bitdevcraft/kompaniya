/**
 * Default record layout for org_real_estate_projects
 */

import { REAL_ESTATE_PROJECT_STATUS } from "./constants";

export const orgRealEstateProjectsLayout = {
  header: {
    title: { fieldId: "name", fallback: "Untitled project" },
    metadata: [
      {
        fieldId: "status",
        id: "project-status",
        label: "Status",
      },
      {
        fieldId: "launchYear",
        id: "project-launch",
        label: "Launched",
      },
      {
        fieldId: "totalUnits",
        id: "project-units",
        label: "Total units",
      },
    ],
    subtitle: [
      { fieldId: "city", prefix: "" },
      { fieldId: "developerName", prefix: "by " },
    ],
  },
  sectionColumns: {
    header: {
      sections: [
        {
          description:
            "Real estate projects represent development or construction projects with multiple properties.",
          fields: [
            { id: "name", label: "Project name", type: "text" },
            {
              id: "description",
              label: "Description",
              type: "textarea",
            },
            {
              id: "developerName",
              label: "Developer name",
              type: "text",
            },
            {
              id: "status",
              label: "Project status",
              type: "picklist",
              options: REAL_ESTATE_PROJECT_STATUS,
            },
          ],
          id: "project-overview",
          title: "Project overview",
        },
        {
          description: "Project timeline and milestones.",
          columns: 2,
          fields: [
            {
              id: "launchYear",
              label: "Launch year",
              type: "number",
            },
            {
              id: "expectedCompletionYear",
              label: "Expected completion",
              type: "number",
            },
          ],
          id: "project-timeline",
          title: "Timeline",
        },
        {
          description: "Project capacity and scale.",
          fields: [
            {
              id: "totalUnits",
              label: "Total units",
              type: "number",
            },
          ],
          id: "project-capacity",
          title: "Capacity",
        },
        {
          columns: 2,
          description: "Physical location of the project.",
          fields: [
            {
              id: "addressLine1",
              label: "Address line 1",
              type: "text",
            },
            {
              id: "addressLine2",
              label: "Address line 2",
              type: "text",
            },
            { id: "city", label: "City", type: "text" },
            { id: "state", label: "State / region", type: "text" },
            { id: "country", label: "Country", type: "text" },
          ],
          id: "project-location",
          title: "Location",
        },
      ],
    },
    firstColumn: {
      sections: [
        {
          description: "Owner and tracking information.",
          fields: [
            { id: "ownerId", label: "Owner ID", type: "text" },
            { id: "createdBy", label: "Created by", type: "text" },
            { id: "lastUpdatedBy", label: "Last updated by", type: "text" },
          ],
          id: "project-tracking",
          title: "Tracking",
        },
      ],
    },
    secondColumn: {
      sections: [
        {
          description: "Custom fields configured for your organization.",
          fields: [
            { id: "customFields", label: "Custom fields", type: "json" },
          ],
          id: "project-custom",
          title: "Custom fields",
        },
      ],
    },
  },
  supplementalFields: [
    { id: "createdAt", label: "Created", readOnly: true, type: "datetime" },
    { id: "updatedAt", label: "Updated", readOnly: true, type: "datetime" },
    { id: "deletedAt", label: "Deleted", readOnly: true, type: "datetime" },
  ],
};
