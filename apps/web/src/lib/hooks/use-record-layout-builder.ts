"use client";

import { useMemo, useState } from "react";

import type {
  RecordLayoutField,
  RecordLayoutSection,
  RecordPageLayout,
} from "@/components/record-page/layout";
import type { NativeFieldDefinition } from "@/lib/field-definitions";
import type { RecordLayoutResponse } from "@/lib/record-layouts";

import { getFieldDefinitions } from "@/lib/field-definitions";

/**
 * Actions for modifying the layout
 */
export interface BuilderActions {
  // Field operations
  addField: (
    sectionId: string,
    columnKey: ColumnKey,
    field: RecordLayoutField,
    index?: number,
  ) => void;
  removeField: (
    sectionId: string,
    columnKey: ColumnKey,
    fieldId: string,
  ) => void;
  moveField: (
    fromSectionId: string,
    fromColumnKey: ColumnKey,
    toSectionId: string,
    toColumnKey: ColumnKey,
    fieldId: string,
    toIndex: number,
  ) => void;
  updateField: (
    sectionId: string,
    columnKey: ColumnKey,
    fieldId: string,
    updates: Partial<RecordLayoutField>,
  ) => void;

  // Section operations
  addSection: (
    columnKey: ColumnKey,
    section: RecordLayoutSection,
    index?: number,
  ) => void;
  removeSection: (sectionId: string, columnKey: ColumnKey) => void;
  moveSection: (
    fromColumnKey: ColumnKey,
    toColumnKey: ColumnKey,
    sectionId: string,
    toIndex: number,
  ) => void;
  updateSection: (
    sectionId: string,
    columnKey: ColumnKey,
    updates: Partial<RecordLayoutSection>,
  ) => void;

  // Layout operations
  setSidebar: (column: "firstColumn" | "secondColumn" | null) => void;
  updateHeader: (header: RecordPageLayout["header"]) => void;
  updateSectionColumns: (
    sectionColumns: RecordPageLayout["sectionColumns"],
  ) => void;

  // State operations
  reset: () => void;
  setSelectedSection: (sectionId: string | null) => void;
  setSelectedField: (fieldId: string | null) => void;
}

/**
 * State for the record layout builder
 */
export interface BuilderState {
  entityType: string;
  layout: RecordPageLayout;
  availableFields: NativeFieldDefinition[];
  isDirty: boolean;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
}

/**
 * Column key type
 */
type ColumnKey = "firstColumn" | "secondColumn" | "header";

/**
 * Hook for managing record layout builder state
 */
export function useRecordLayoutBuilder(
  entityType: string,
  initialLayout: RecordLayoutResponse,
): { state: BuilderState; actions: BuilderActions } {
  // Get available fields from registry
  const availableFields = useMemo(
    () => getFieldDefinitions(entityType),
    [entityType],
  );

  // Parse initial layout
  const initialParsedState = useMemo<BuilderState>(
    () => ({
      entityType,
      layout: {
        header: initialLayout.header as RecordPageLayout["header"],
        sectionColumns:
          initialLayout.sectionColumns as RecordPageLayout["sectionColumns"],
        sections: initialLayout.sections as RecordLayoutSection[] | undefined,
        supplementalFields: initialLayout.supplementalFields as
          | RecordLayoutField[]
          | undefined,
      },
      availableFields,
      isDirty: false,
      selectedSectionId: null,
      selectedFieldId: null,
    }),
    [entityType, initialLayout, availableFields],
  );

  const [state, setState] = useState<BuilderState>(initialParsedState);

  // Actions
  const actions: BuilderActions = {
    // Add a field to a section
    addField: (sectionId, columnKey, field, index) => {
      setState((prev) => {
        const sections = getSectionsFromColumn(
          prev.layout.sectionColumns,
          columnKey,
        );
        const updatedSections = sections.map((section) => {
          if (section.id === sectionId) {
            const newFields = [...section.fields];
            if (index !== undefined) {
              newFields.splice(index, 0, field);
            } else {
              newFields.push(field);
            }
            return { ...section, fields: newFields };
          }
          return section;
        });

        return {
          ...prev,
          layout: {
            ...prev.layout,
            sectionColumns: setSectionsInColumn(
              prev.layout.sectionColumns,
              columnKey,
              updatedSections,
            ),
          },
          isDirty: true,
        };
      });
    },

    // Remove a field from a section
    removeField: (sectionId, columnKey, fieldId) => {
      setState((prev) => {
        const sections = getSectionsFromColumn(
          prev.layout.sectionColumns,
          columnKey,
        );
        const updatedSections = sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              fields: section.fields.filter((f) => f.id !== fieldId),
            };
          }
          return section;
        });

        return {
          ...prev,
          layout: {
            ...prev.layout,
            sectionColumns: setSectionsInColumn(
              prev.layout.sectionColumns,
              columnKey,
              updatedSections,
            ),
          },
          isDirty: true,
        };
      });
    },

    // Move a field within or between sections
    moveField: (
      fromSectionId,
      fromColumnKey,
      toSectionId,
      toColumnKey,
      fieldId,
      toIndex,
    ) => {
      setState((prev) => {
        // Find and remove the field from source
        const fromSections = getSectionsFromColumn(
          prev.layout.sectionColumns,
          fromColumnKey,
        );
        let fieldToMove: RecordLayoutField | null = null;
        const updatedFromSections = fromSections.map((section) => {
          if (section.id === fromSectionId) {
            const fieldIndex = section.fields.findIndex(
              (f) => f.id === fieldId,
            );
            if (fieldIndex !== -1) {
              fieldToMove = section.fields[fieldIndex] || null;
              return {
                ...section,
                fields: section.fields.filter((f) => f.id !== fieldId),
              };
            }
          }
          return section;
        });

        if (!fieldToMove) return prev;

        // Add the field to destination
        let newSectionColumns = setSectionsInColumn(
          prev.layout.sectionColumns,
          fromColumnKey,
          updatedFromSections,
        );

        // If moving to a different column, update that column too
        if (fromColumnKey !== toColumnKey) {
          const toSections = getSectionsFromColumn(
            newSectionColumns,
            toColumnKey,
          );
          const updatedToSections = toSections.map((section) => {
            if (section.id === toSectionId) {
              const newFields = [...section.fields];
              newFields.splice(toIndex, 0, fieldToMove!);
              return { ...section, fields: newFields };
            }
            return section;
          });
          newSectionColumns = setSectionsInColumn(
            newSectionColumns,
            toColumnKey,
            updatedToSections,
          );
        } else {
          // Same column, already updated above
          const toSections = getSectionsFromColumn(
            newSectionColumns,
            toColumnKey,
          );
          const updatedToSections = toSections.map((section) => {
            if (section.id === toSectionId) {
              const newFields = [...section.fields];
              newFields.splice(toIndex, 0, fieldToMove!);
              return { ...section, fields: newFields };
            }
            return section;
          });
          newSectionColumns = setSectionsInColumn(
            newSectionColumns,
            toColumnKey,
            updatedToSections,
          );
        }

        return {
          ...prev,
          layout: {
            ...prev.layout,
            sectionColumns: newSectionColumns,
          },
          isDirty: true,
        };
      });
    },

    // Update a field
    updateField: (sectionId, columnKey, fieldId, updates) => {
      setState((prev) => {
        const sections = getSectionsFromColumn(
          prev.layout.sectionColumns,
          columnKey,
        );
        const updatedSections = sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              fields: section.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f,
              ),
            };
          }
          return section;
        });

        return {
          ...prev,
          layout: {
            ...prev.layout,
            sectionColumns: setSectionsInColumn(
              prev.layout.sectionColumns,
              columnKey,
              updatedSections,
            ),
          },
          isDirty: true,
        };
      });
    },

    // Add a section
    addSection: (columnKey, section, index) => {
      setState((prev) => {
        const sections = getSectionsFromColumn(
          prev.layout.sectionColumns,
          columnKey,
        );
        const newSections = [...sections];
        if (index !== undefined) {
          newSections.splice(index, 0, section);
        } else {
          newSections.push(section);
        }

        return {
          ...prev,
          layout: {
            ...prev.layout,
            sectionColumns: setSectionsInColumn(
              prev.layout.sectionColumns,
              columnKey,
              newSections,
            ),
          },
          isDirty: true,
        };
      });
    },

    // Remove a section
    removeSection: (sectionId, columnKey) => {
      setState((prev) => {
        const sections = getSectionsFromColumn(
          prev.layout.sectionColumns,
          columnKey,
        );
        const updatedSections = sections.filter((s) => s.id !== sectionId);

        return {
          ...prev,
          layout: {
            ...prev.layout,
            sectionColumns: setSectionsInColumn(
              prev.layout.sectionColumns,
              columnKey,
              updatedSections,
            ),
          },
          isDirty: true,
        };
      });
    },

    // Move a section within or between columns
    moveSection: (fromColumnKey, toColumnKey, sectionId, toIndex) => {
      setState((prev) => {
        // Find and remove the section from source
        const fromSections = getSectionsFromColumn(
          prev.layout.sectionColumns,
          fromColumnKey,
        );
        let sectionToMove: RecordLayoutSection | null = null;
        const updatedFromSections = fromSections.filter((section) => {
          if (section.id === sectionId) {
            sectionToMove = section;
            return false;
          }
          return true;
        });

        if (!sectionToMove) return prev;

        let newSectionColumns = setSectionsInColumn(
          prev.layout.sectionColumns,
          fromColumnKey,
          updatedFromSections,
        );

        // Add the section to destination
        const toSections = getSectionsFromColumn(
          newSectionColumns,
          toColumnKey,
        );
        const newToSections = [...toSections];
        newToSections.splice(toIndex, 0, sectionToMove);

        newSectionColumns = setSectionsInColumn(
          newSectionColumns,
          toColumnKey,
          newToSections,
        );

        return {
          ...prev,
          layout: {
            ...prev.layout,
            sectionColumns: newSectionColumns,
          },
          isDirty: true,
        };
      });
    },

    // Update a section
    updateSection: (sectionId, columnKey, updates) => {
      setState((prev) => {
        const sections = getSectionsFromColumn(
          prev.layout.sectionColumns,
          columnKey,
        );
        const updatedSections = sections.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section,
        );

        return {
          ...prev,
          layout: {
            ...prev.layout,
            sectionColumns: setSectionsInColumn(
              prev.layout.sectionColumns,
              columnKey,
              updatedSections,
            ),
          },
          isDirty: true,
        };
      });
    },

    // Set sidebar position
    setSidebar: (column) => {
      setState((prev) => ({
        ...prev,
        layout: {
          ...prev.layout,
          sectionColumns: {
            ...prev.layout.sectionColumns,
            sidebar: column,
          },
        },
        isDirty: true,
      }));
    },

    // Update header configuration
    updateHeader: (header) => {
      setState((prev) => ({
        ...prev,
        layout: {
          ...prev.layout,
          header,
        },
        isDirty: true,
      }));
    },

    // Update section columns configuration
    updateSectionColumns: (sectionColumns) => {
      setState((prev) => ({
        ...prev,
        layout: {
          ...prev.layout,
          sectionColumns,
        },
        isDirty: true,
      }));
    },

    // Reset to initial state
    reset: () => {
      setState(initialParsedState);
    },

    // Set selected section
    setSelectedSection: (sectionId) => {
      setState((prev) => ({ ...prev, selectedSectionId: sectionId }));
    },

    // Set selected field
    setSelectedField: (fieldId) => {
      setState((prev) => ({ ...prev, selectedFieldId: fieldId }));
    },
  };

  return { state, actions };
}

/**
 * Helper to get sections from a column
 */
function getSectionsFromColumn(
  sectionColumns: RecordPageLayout["sectionColumns"],
  columnKey: "header" | "firstColumn" | "secondColumn",
): RecordLayoutSection[] {
  return sectionColumns?.[columnKey]?.sections || [];
}

/**
 * Helper to set sections in a column
 */
function setSectionsInColumn(
  sectionColumns: RecordPageLayout["sectionColumns"] | undefined,
  columnKey: "header" | "firstColumn" | "secondColumn",
  sections: RecordLayoutSection[],
): RecordPageLayout["sectionColumns"] {
  const current = sectionColumns || {};
  const column = current[columnKey] || { sections: [] };

  return {
    ...current,
    [columnKey]: {
      ...column,
      sections,
    },
  };
}
