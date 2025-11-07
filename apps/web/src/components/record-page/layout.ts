import type { FieldValues, Path } from "react-hook-form";

export type RecordFieldDataType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "picklist"
  | "multipicklist"
  | "phone"
  | "html";

export interface RecordFieldOption {
  label: string;
  value: string;
}

export interface RecordLayoutField<
  TFieldValues extends FieldValues = FieldValues,
> {
  colSpan?: number;
  /**
   * Whether the field should appear on create/new forms. Defaults to true.
   */
  availableOnCreate?: boolean;
  description?: string;
  id: Path<TFieldValues>;
  label: string;
  options?: RecordFieldOption[];
  placeholder?: string;
  readOnly?: boolean;
  type: RecordFieldDataType;
}

export interface RecordLayoutHeaderChip<TKey> {
  fieldId: TKey;
  icon?: RecordLayoutHeaderIcon;
  id: string;
  linkType?: "mailto" | "tel" | "url";
  prefix?: string;
  suffix?: string;
}

export type RecordLayoutHeaderIcon =
  | "user"
  | "mail"
  | "phone"
  | "globe"
  | "tags"
  | "building"
  | "calendar"
  | "mapPin"
  | "sparkles";

export interface RecordLayoutHeaderMetadata<TKey> {
  fieldId: TKey;
  id: string;
  label: string;
  type?: "text" | "number" | "date" | "datetime";
}

export interface RecordLayoutHeaderText<TKey> {
  fallback?: string;
  fieldId: TKey;
  prefix?: string;
  suffix?: string;
  type?: "text" | "number" | "date" | "datetime";
}

export interface RecordLayoutSection<
  TFieldValues extends FieldValues = FieldValues,
> {
  columns?: 1 | 2 | 3 | 4;
  description?: string;
  fields: RecordLayoutField<TFieldValues>[];
  id: string;
  title?: string;
}

export interface RecordLayoutSectionColumns<
  TFieldValues extends FieldValues = FieldValues,
> {
  firstColumn?: RecordLayoutSectionGroup<TFieldValues>;
  header?: RecordLayoutSectionGroup<TFieldValues>;
  secondColumn?: RecordLayoutSectionGroup<TFieldValues>;
  sidebar?: "firstColumn" | "secondColumn" | null;
}

export interface RecordLayoutSectionGroup<
  TFieldValues extends FieldValues = FieldValues,
> {
  sections: RecordLayoutSection<TFieldValues>[];
}

export interface RecordPageHeaderConfig<
  TFieldValues extends FieldValues = FieldValues,
> {
  avatar?: {
    fallbackFieldId?: Path<TFieldValues>;
    imageFieldId?: Path<TFieldValues>;
  };
  chips?: RecordLayoutHeaderChip<Path<TFieldValues>>[];
  metadata?: RecordLayoutHeaderMetadata<Path<TFieldValues>>[];
  subtitle?: RecordLayoutHeaderText<Path<TFieldValues>>[];
  title: RecordLayoutHeaderText<Path<TFieldValues>>;
}

export interface RecordPageLayout<
  TFieldValues extends FieldValues = FieldValues,
> {
  header: RecordPageHeaderConfig<TFieldValues>;
  sectionColumns?: RecordLayoutSectionColumns<TFieldValues>;
  sections?: RecordLayoutSection<TFieldValues>[];
  supplementalFields?: RecordLayoutField<TFieldValues>[];
}
