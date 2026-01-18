import type {
  HeaderAvatar as DomainHeaderAvatar,
  HeaderChip as DomainHeaderChip,
  HeaderMetadata as DomainHeaderMetadata,
  HeaderText as DomainHeaderText,
  LayoutField as DomainLayoutField,
  LayoutSection as DomainLayoutSection,
  LayoutSectionColumns as DomainLayoutSectionColumns,
  LayoutSectionGroup as DomainLayoutSectionGroup,
  RecordLayoutHeader as DomainRecordLayoutHeader,
  RecordPageLayout as DomainRecordPageLayout,
  HeaderDataType,
  HeaderIconType,
  HeaderLinkType,
} from "@repo/domain";
import type { FieldValues, Path } from "react-hook-form";

/**
 * Re-export domain icon and link types for convenience
 */
export type {
  FieldMode,
  HeaderDataType,
  HeaderIconType,
  HeaderLinkType,
} from "@repo/domain";

/**
 * React-hook-form typed layout field
 */
export interface RecordLayoutField<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<DomainLayoutField, "id"> {
  id: Path<TFieldValues>;
}

/**
 * React-hook-form typed header avatar
 */
export interface RecordLayoutHeaderAvatar<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<DomainHeaderAvatar, "imageFieldId" | "fallbackFieldId"> {
  imageFieldId?: Path<TFieldValues>;
  fallbackFieldId?: Path<TFieldValues>;
}

/**
 * React-hook-form typed header chip
 */
export interface RecordLayoutHeaderChip<TKey>
  extends Omit<DomainHeaderChip, "fieldId"> {
  fieldId: TKey;
  icon?: HeaderIconType;
  linkType?: HeaderLinkType;
}

/**
 * React-hook-form typed header metadata
 */
export interface RecordLayoutHeaderMetadata<TKey>
  extends Omit<DomainHeaderMetadata, "fieldId"> {
  fieldId: TKey;
  type?: HeaderDataType;
}

/**
 * React-hook-form typed header text
 */
export interface RecordLayoutHeaderText<TKey>
  extends Omit<DomainHeaderText, "fieldId"> {
  fieldId: TKey;
}

/**
 * React-hook-form typed section
 */
export interface RecordLayoutSection<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<DomainLayoutSection, "fields"> {
  fields: RecordLayoutField<TFieldValues>[];
}

/**
 * React-hook-form typed section columns
 */
export interface RecordLayoutSectionColumns<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<
    DomainLayoutSectionColumns,
    "header" | "firstColumn" | "secondColumn"
  > {
  header?: RecordLayoutSectionGroup<TFieldValues>;
  firstColumn?: RecordLayoutSectionGroup<TFieldValues>;
  secondColumn?: RecordLayoutSectionGroup<TFieldValues>;
}

/**
 * React-hook-form typed section group
 */
export interface RecordLayoutSectionGroup<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<DomainLayoutSectionGroup, "sections"> {
  sections: RecordLayoutSection<TFieldValues>[];
}

/**
 * React-hook-form typed header
 */
export interface RecordPageHeaderConfig<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<
    DomainRecordLayoutHeader,
    "title" | "avatar" | "chips" | "metadata" | "subtitle"
  > {
  title: RecordLayoutHeaderText<Path<TFieldValues>>;
  avatar?: RecordLayoutHeaderAvatar<TFieldValues>;
  chips?: RecordLayoutHeaderChip<Path<TFieldValues>>[];
  metadata?: RecordLayoutHeaderMetadata<Path<TFieldValues>>[];
  subtitle?: RecordLayoutHeaderText<Path<TFieldValues>>[];
}

/**
 * React-hook-form typed complete layout
 * This extends the domain layout with react-hook-form types
 */
export interface RecordPageLayout<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<
    DomainRecordPageLayout,
    "header" | "sectionColumns" | "sections" | "supplementalFields"
  > {
  header: RecordPageHeaderConfig<TFieldValues>;
  sectionColumns?: RecordLayoutSectionColumns<TFieldValues>;
  sections?: RecordLayoutSection<TFieldValues>[];
  supplementalFields?: RecordLayoutField<TFieldValues>[];
}
