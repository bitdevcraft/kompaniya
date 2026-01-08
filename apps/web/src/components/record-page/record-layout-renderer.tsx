"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@kompaniya/ui-common/components/avatar";
import { Badge } from "@kompaniya/ui-common/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import { Form, FormField } from "@kompaniya/ui-common/components/form";
import { cn } from "@kompaniya/ui-common/lib/utils";
import {
  Building2,
  CalendarDays,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Tags,
  UserCircle2,
} from "lucide-react";
import { ReactElement, type ReactNode, useEffect, useState } from "react";

import type {
  LookupFieldConfig,
  RecordFieldOption,
  RecordLayoutField,
  RecordLayoutHeaderChip,
  RecordLayoutHeaderIcon,
  RecordLayoutHeaderText,
  RecordLayoutSection,
  RecordPageLayout,
} from "./layout";

import { BooleanRecordField } from "./boolean-record-field";
import { DateRecordField } from "./date-record-field";
import { DatetimeRecordField } from "./datetime-record-field";
import { HtmlRecordField } from "./html-record-field";
import { InfoChip } from "./info-chip";
import {
  getAllLayoutFields,
  normalizeValueForSubmission,
} from "./layout-helpers";
import { LookupRecordField } from "./lookup-record-field";
import { MjmlRecordField } from "./mjml-record-field";
import { MultipicklistRecordField } from "./multipicklist-record-field";
import { NumberRecordField } from "./number-record-field";
import { PhoneRecordField } from "./phone-record-field";
import { PicklistRecordField } from "./picklist-record-field";
import { TagRecordField } from "./tag-record-field";
import { TextRecordField } from "./text-record-field";
import { TextareaRecordField } from "./textarea-record-field";
import { formatDateTime, formatScore, getInitials, renderLink } from "./utils";

const DEFAULT_LOOKUP_LABEL_KEY = "name";
const DEFAULT_LOOKUP_VALUE_KEY = "id";
const DEFAULT_LOOKUP_ID_PARAM = "id";
const HEADER_ICONS: Record<
  RecordLayoutHeaderIcon,
  React.ComponentType<{ className?: string }>
> = {
  building: Building2,
  calendar: CalendarDays,
  globe: Globe2,
  mail: Mail,
  mapPin: MapPin,
  phone: Phone,
  sparkles: Sparkles,
  tags: Tags,
  user: UserCircle2,
};

type FieldComponent = (props: {
  description?: string;
  editing: boolean;
  fallback?: string;
  label: string;
  lookup?: RecordLayoutField["lookup"];
  name?: string;
  onBlur?: () => void;
  onChange?: (value: unknown) => void;
  placeholder?: string;
  options?: RecordFieldOption[];
  record?: Record<string, unknown>;
  tag?: RecordLayoutField["tag"];
  value?: unknown;
}) => React.ReactNode | null;

interface HeaderChip {
  chip: {
    id: string;
    label: string | ReactNode;
    linkType?: "mailto" | "tel";
  };
  icon: React.ComponentType<{ className?: string }>;
}

interface HeaderProps<TFieldValues extends FieldValues> {
  actionButtons?: ReactNode;
  fieldMap: Map<Path<TFieldValues>, RecordLayoutField<TFieldValues>>;
  form: UseFormReturn<TFieldValues>;
  header: RecordPageLayout<TFieldValues>["header"];
  record: Record<string, unknown>;
}

interface RecordLayoutRendererProps<
  TRecord extends Record<string, unknown>,
  TFieldValues extends FieldValues,
> {
  actionButtons?: ReactNode;
  form: UseFormReturn<TFieldValues>;
  isEditing: boolean;
  layout: RecordPageLayout<TFieldValues>;
  record: TRecord;
}

interface SectionProps<TFieldValues extends FieldValues> {
  columnsOverride?: 1 | 2 | 3 | 4;
  form: UseFormReturn<TFieldValues>;
  isEditing: boolean;
  record: Record<string, unknown>;
  section: RecordLayoutSection<TFieldValues>;
}

export function extractEditableValues<TFieldValues extends FieldValues>(
  values: TFieldValues,
  layout: RecordPageLayout<TFieldValues>,
) {
  const editableFields = getAllLayoutFields(layout).filter(
    (field) => !field.readOnly,
  );
  const data: Record<string, unknown> = {};

  for (const field of editableFields) {
    const rawValue = values[field.id];
    data[field.id as string] = normalizeValueForSubmission(field, rawValue);
  }

  return data;
}

export function RecordLayoutRenderer<
  TRecord extends Record<string, unknown>,
  TFieldValues extends FieldValues,
>({
  actionButtons,
  form,
  isEditing,
  layout,
  record,
}: RecordLayoutRendererProps<TRecord, TFieldValues>) {
  const fields = getAllLayoutFields(layout);
  const fieldMap = new Map<Path<TFieldValues>, RecordLayoutField<TFieldValues>>(
    fields.map((field) => [field.id, field]),
  );

  const sectionsContent = renderLayoutSections(layout, {
    form,
    isEditing,
    record,
  });

  return (
    <Form {...form}>
      <div className="space-y-8">
        <Header
          actionButtons={actionButtons}
          fieldMap={fieldMap}
          form={form}
          header={layout.header}
          record={record}
        />
        {sectionsContent}
      </div>
    </Form>
  );
}

function buildHeaderChip<TFieldValues extends FieldValues>(
  chip: RecordLayoutHeaderChip<Path<TFieldValues>>,
  fieldMap: Map<Path<TFieldValues>, RecordLayoutField<TFieldValues>>,
  record: Record<string, unknown>,
  form: UseFormReturn<TFieldValues>,
): HeaderChip | null {
  const field = fieldMap.get(chip.fieldId);
  const icon = chip.icon ? HEADER_ICONS[chip.icon] : UserCircle2;
  const value = formatHeaderText(
    {
      fieldId: chip.fieldId,
      prefix: chip.prefix,
      suffix: chip.suffix,
      type:
        field?.type === "datetime"
          ? "datetime"
          : field?.type === "date"
            ? "date"
            : undefined,
    },
    fieldMap,
    record,
    form,
  );

  if (!value) {
    return null;
  }

  return {
    chip: {
      id: chip.id,
      label: value,
      linkType: chip.linkType === "url" ? undefined : chip.linkType,
    },
    icon,
  };
}

function buildLookupFindUrl(
  lookup: LookupFieldConfig,
  id: string,
): string | undefined {
  const replaced = lookup.findByIdEndpoint
    .replace(":id", encodeURIComponent(id))
    .replace("{id}", encodeURIComponent(id));

  if (replaced !== lookup.findByIdEndpoint) {
    return buildUrl(replaced);
  }

  const url = new URL(buildUrl(lookup.findByIdEndpoint));
  const idParam = lookup.idParam ?? DEFAULT_LOOKUP_ID_PARAM;

  if (lookup.findByIdEndpoint.includes("?")) {
    url.searchParams.set(idParam, id);
    return url.toString();
  }

  url.pathname = `${url.pathname.replace(/\/$/, "")}/${encodeURIComponent(id)}`;
  return url.toString();
}

function buildUrl(endpoint: string): string {
  const base =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  try {
    return new URL(endpoint, base).toString();
  } catch {
    return endpoint;
  }
}
async function fetchLookupDisplayValue(
  id: string,
  lookup: LookupFieldConfig,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = buildLookupFindUrl(lookup, id);
  if (!url) return null;

  const response = await fetch(url, { signal, credentials: "include" });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return normalizeLookupRecordLabel(data, lookup);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLookupRecordLabel(
  data: unknown,
  lookup: LookupFieldConfig,
): string | null {
  const valueKey = lookup.valueKey ?? DEFAULT_LOOKUP_VALUE_KEY;
  const labelKey = lookup.labelKey ?? DEFAULT_LOOKUP_LABEL_KEY;

  const record = toRecordArray(data)[0];
  if (!record) return null;

  const rawValue = record[valueKey];
  if (rawValue === null || rawValue === undefined) return null;

  const rawLabel = record[labelKey] ?? rawValue;
  return rawLabel === null || rawLabel === undefined ? null : String(rawLabel);
}

const FIELD_COMPONENTS: Record<RecordLayoutField["type"], FieldComponent> = {
  boolean: BooleanRecordField as FieldComponent,
  date: DateRecordField as FieldComponent,
  datetime: DatetimeRecordField as FieldComponent,
  html: HtmlRecordField as FieldComponent,
  mjml: MjmlRecordField as FieldComponent,
  lookup: LookupRecordField as FieldComponent,
  multipicklist: MultipicklistRecordField as FieldComponent,
  number: NumberRecordField as FieldComponent,
  phone: PhoneRecordField as FieldComponent,
  picklist: PicklistRecordField as FieldComponent,
  tag: TagRecordField as FieldComponent,
  text: TextRecordField as FieldComponent,
  textarea: TextareaRecordField as FieldComponent,
};

type SectionRenderContext<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  isEditing: boolean;
  record: Record<string, unknown>;
};

function fallbackFormat(
  value: unknown,
  type?: "text" | "number" | "date" | "datetime",
) {
  if (value === null || value === undefined) {
    return "";
  }

  switch (type) {
    case "date":
      return formatDateTime(value as string | Date | null | undefined, {
        dateStyle: "medium",
        timeStyle: undefined,
      });
    case "datetime":
      return formatDateTime(value as string | Date | null | undefined);
    case "number": {
      if (typeof value === "number") return formatScore(value);
      if (typeof value === "string") return value;
      return "";
    }
    default:
      return String(value);
  }
}

function FieldRenderer<TFieldValues extends FieldValues>({
  field,
  form,
  isEditing,
  record,
}: {
  field: RecordLayoutField<TFieldValues>;
  form: UseFormReturn<TFieldValues>;
  isEditing: boolean;
  record: Record<string, unknown>;
}) {
  const Component = FIELD_COMPONENTS[field.type];

  if (!Component) {
    return null;
  }

  if (isEditing && !field.readOnly) {
    return (
      <FormField
        control={form.control}
        name={field.id}
        render={({ field: controllerField }) => (
          <Component
            description={field.description}
            editing
            label={field.label}
            lookup={field.lookup}
            name={field.id as string}
            onBlur={controllerField.onBlur}
            onChange={(value) => controllerField.onChange(value)}
            options={field.options}
            placeholder={field.placeholder}
            record={record}
            tag={field.tag}
            value={controllerField.value}
          />
        )}
      />
    );
  }

  return (
    <Component
      description={field.description}
      editing={false}
      label={field.label}
      lookup={field.lookup}
      options={field.options}
      record={record}
      tag={field.tag}
      value={record[field.id as string]}
    />
  );
}

function formatHeaderText<TFieldValues extends FieldValues>(
  item: RecordLayoutHeaderText<Path<TFieldValues>>,
  fieldMap: Map<Path<TFieldValues>, RecordLayoutField<TFieldValues>>,
  record: Record<string, unknown>,
  form: UseFormReturn<TFieldValues>,
  allowFallback = false,
) {
  const field = fieldMap.get(item.fieldId);
  const rawValue = resolveFieldValue(record, form, item.fieldId);

  // For phone fields, return the raw string value since the chip will handle linking
  if (field?.type === "phone" && typeof rawValue === "string") {
    const value = rawValue.trim().length > 0 ? rawValue : null;
    if (!value && allowFallback) {
      return item.fallback ?? "";
    }
    if (!value) {
      return item.fallback ?? "";
    }
    return `${item.prefix ?? ""}${value}${item.suffix ?? ""}`;
  }

  const formatted = field
    ? formatValue(field, rawValue)
    : fallbackFormat(rawValue, item.type);

  if (!formatted && allowFallback) {
    return item.fallback;
  }

  if (!formatted) {
    return item.fallback ?? "";
  }

  if (
    typeof formatted === "string" ||
    typeof formatted === "bigint" ||
    typeof formatted === "number" ||
    typeof formatted === "boolean"
  )
    return `${item.prefix ?? ""}${formatted}${item.suffix ?? ""}`;

  return formatted;
}

function formatValue<TFieldValues extends FieldValues>(
  field: RecordLayoutField<TFieldValues>,
  rawValue: unknown,
): ReactNode {
  switch (field.type) {
    case "boolean": {
      if (typeof rawValue === "boolean") {
        return rawValue ? "Yes" : "No";
      }
      return rawValue ? "Yes" : "No";
    }
    case "number": {
      if (rawValue === null || rawValue === undefined) return null;
      if (typeof rawValue === "number") return formatScore(rawValue);
      if (typeof rawValue === "string") {
        const parsed = Number(rawValue);
        return Number.isFinite(parsed) ? formatScore(parsed) : rawValue;
      }
      return null;
    }
    case "date": {
      return formatDateTime(rawValue as string | Date | null, {
        dateStyle: "long",
        timeStyle: undefined,
      });
    }
    case "datetime": {
      return formatDateTime(rawValue as string | Date | null);
    }
    case "phone": {
      if (typeof rawValue === "string" && rawValue.trim().length > 0) {
        return renderLink(rawValue, `tel:${rawValue}`);
      }
      return (rawValue as ReactNode) ?? null;
    }
    case "picklist": {
      if (typeof rawValue === "string") {
        const items = field.options;
        if (items && items.length > 0) {
          const match = items.find((option) => option.value === rawValue);
          if (match) {
            return match.label;
          }
        }
        return rawValue;
      }
      return (rawValue as ReactNode) ?? null;
    }
    case "multipicklist": {
      const values = normalizeMultipicklistValue(rawValue);
      if (values.length === 0) return null;
      const labelMap = field.options
        ? new Map(field.options.map((option) => [option.value, option.label]))
        : undefined;
      return (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <Badge
              key={`${field.id as string}-${value}-${index}`}
              variant="secondary"
            >
              {labelMap?.get(String(value)) ?? String(value)}
            </Badge>
          ))}
        </div>
      );
    }
    case "tag": {
      const values = normalizeMultipicklistValue(rawValue);
      if (values.length === 0) return null;
      return values.join(", ");
    }
    default: {
      if (rawValue === null || rawValue === undefined) return null;
      return String(rawValue);
    }
  }
}

function getColumnSpanClass(colSpan?: number) {
  if (!colSpan || colSpan <= 1) {
    return "col-span-1";
  }

  return `col-span-1 md:col-span-${colSpan}`;
}

function getGridClass(columns?: number) {
  const resolved = columns ?? 2;
  switch (resolved) {
    case 1:
      return "grid-cols-1";
    case 3:
      return "grid-cols-1 md:grid-cols-3";
    case 4:
      return "grid-cols-1 md:grid-cols-4";
    default:
      return "grid-cols-1 md:grid-cols-2";
  }
}

function getSectionColumnsGridClass(
  sidebar: "firstColumn" | "secondColumn" | null | undefined,
) {
  switch (sidebar) {
    case "firstColumn":
      return "md:[grid-template-columns:1fr_2fr]";
    case "secondColumn":
      return "md:[grid-template-columns:2fr_1fr]";
    default:
      return "md:grid-cols-2";
  }
}

function Header<TFieldValues extends FieldValues>({
  actionButtons,
  fieldMap,
  form,
  header,
  record,
}: HeaderProps<TFieldValues>) {
  const [subtitleValues, setSubtitleValues] = useState<ReactNode[]>([]);
  const title = formatHeaderText(header.title, fieldMap, record, form);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadSubtitle = async () => {
      if (!header.subtitle || header.subtitle.length === 0) {
        if (active) {
          setSubtitleValues([]);
        }
        return;
      }

      const values = await Promise.all(
        header.subtitle.map(async (item) => {
          const field = fieldMap.get(item.fieldId);
          const rawValue = resolveFieldValue(record, form, item.fieldId);
          const emptyFallback = item.fallback ?? "Empty";

          if (field?.type === "lookup") {
            const id =
              rawValue === null || rawValue === undefined
                ? ""
                : String(rawValue);

            if (!id) {
              return emptyFallback;
            }

            if (!field.lookup) {
              return (
                formatHeaderText(item, fieldMap, record, form, true) ??
                emptyFallback
              );
            }

            try {
              const displayValue = await fetchLookupDisplayValue(
                id,
                field.lookup,
                controller.signal,
              );

              if (!displayValue) {
                return emptyFallback;
              }

              const prefix = item.prefix ?? "";
              const suffix = item.suffix ?? "";
              return `${prefix}${displayValue}${suffix}`;
            } catch (_error) {
              return emptyFallback;
            }
          }

          return formatHeaderText(item, fieldMap, record, form, true);
        }),
      );

      if (!active) return;
      setSubtitleValues(
        values.filter(
          (value): value is ReactElement =>
            value !== null && value !== undefined,
        ),
      );
    };

    void loadSubtitle();

    return () => {
      active = false;
      controller.abort();
    };
  }, [fieldMap, form, header.subtitle, record]);

  const avatarSrc = header.avatar
    ? resolveFieldValue(record, form, header.avatar.imageFieldId)
    : undefined;
  const avatarFallbackValue = header.avatar
    ? formatHeaderText(
        {
          fieldId: header.avatar.fallbackFieldId ?? header.title.fieldId,
          fallback: "?",
        },
        fieldMap,
        record,
        form,
      )
    : "";

  const metadataEntries = (header.metadata ?? [])
    .map((item) => ({
      id: item.id,
      label: item.label,
      value: formatHeaderText(item, fieldMap, record, form, true),
    }))
    .filter((entry) => Boolean(entry.value));

  const chips = header.chips
    ?.map((chip) => buildHeaderChip(chip, fieldMap, record, form))
    .filter((chip): chip is HeaderChip => chip !== null);

  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col gap-6 px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          {header.avatar ? (
            <Avatar className="size-16">
              <AvatarImage src={String(avatarSrc ?? "") || undefined} />
              <AvatarFallback>
                {getInitials(String(avatarFallbackValue ?? "?"))}
              </AvatarFallback>
            </Avatar>
          ) : null}

          <div className="flex flex-col gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {title}
              </h1>
              {subtitleValues.length > 0 ? (
                <p className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  {subtitleValues.map((value, index) => (
                    <span
                      className="flex items-center gap-2"
                      key={`subtitle-${index}`}
                    >
                      {index > 0 ? <span aria-hidden="true">·</span> : null}
                      <span>{value}</span>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>

            {chips && chips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {chips.map(({ chip, icon }) => (
                  <InfoChip
                    icon={icon}
                    key={chip.id}
                    label={chip.label as string}
                    linkType={chip.linkType}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 md:w-auto md:items-end">
          {actionButtons}

          {metadataEntries.length > 0 ? (
            <div className="grid gap-1 text-sm text-muted-foreground">
              {metadataEntries.map((item) => (
                <div className="flex gap-2 md:justify-end" key={item.id}>
                  <span className="font-medium text-foreground/80">
                    {item.label}
                  </span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function normalizeMultipicklistValue(value: unknown) {
  if (!value) return [] as string[];

  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry : String(entry)))
      .filter((entry) => entry.trim().length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [String(value)];
}

function renderLayoutSections<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
  context: SectionRenderContext<TFieldValues>,
) {
  const { form, isEditing, record } = context;
  const renderSection = (
    section: RecordLayoutSection<TFieldValues>,
    columnsOverride?: 1 | 2 | 3 | 4,
  ) => (
    <Section
      columnsOverride={columnsOverride}
      form={form}
      isEditing={isEditing}
      key={section.id}
      record={record}
      section={section}
    />
  );

  const sectionColumns = layout.sectionColumns;
  if (sectionColumns) {
    const headerSections = sectionColumns.header?.sections ?? [];
    const firstColumnSections = sectionColumns.firstColumn?.sections ?? [];
    const secondColumnSections = sectionColumns.secondColumn?.sections ?? [];

    const blocks: ReactNode[] = [];

    if (headerSections.length > 0) {
      blocks.push(
        <div className="space-y-6" key="header">
          {headerSections.map((section) =>
            renderSection(section, sectionColumns.header?.fieldsGridColumns),
          )}
        </div>,
      );
    }

    if (secondColumnSections.length > 0) {
      blocks.push(
        <div
          className={cn(
            "grid grid-cols-1 gap-6",
            getSectionColumnsGridClass(sectionColumns.sidebar),
          )}
          key="columns"
        >
          <div className="space-y-6">
            {firstColumnSections.map((section) =>
              renderSection(
                section,
                sectionColumns.firstColumn?.fieldsGridColumns,
              ),
            )}
          </div>
          <div className="space-y-6">
            {secondColumnSections.map((section) =>
              renderSection(
                section,
                sectionColumns.secondColumn?.fieldsGridColumns,
              ),
            )}
          </div>
        </div>,
      );
    } else if (firstColumnSections.length > 0) {
      blocks.push(
        <div className="space-y-6" key="first-column">
          {firstColumnSections.map((section) =>
            renderSection(
              section,
              sectionColumns.firstColumn?.fieldsGridColumns,
            ),
          )}
        </div>,
      );
    }

    if (blocks.length === 0) {
      return null;
    }

    return <div className="space-y-6">{blocks}</div>;
  }

  const sections = layout.sections ?? [];
  if (sections.length === 0) {
    return null;
  }

  return sections.map((section) => renderSection(section));
}

function resolveFieldValue<TFieldValues extends FieldValues>(
  record: Record<string, unknown>,
  form: UseFormReturn<TFieldValues> | undefined,
  fieldId: Path<TFieldValues> | undefined,
) {
  if (!fieldId) return undefined;
  if (form) {
    try {
      const value = form.getValues(fieldId);
      if (value !== undefined) return value;
    } catch (_error) {
      // noop - fall back to record
    }
  }

  return record[fieldId as string];
}

function Section<TFieldValues extends FieldValues>({
  columnsOverride,
  form,
  isEditing,
  record,
  section,
}: SectionProps<TFieldValues>) {
  const gridClass = getGridClass(section.columns ?? columnsOverride);

  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-2">
        {section.title ? (
          <CardTitle className="text-lg">{section.title}</CardTitle>
        ) : null}
        {section.description ? (
          <CardDescription className="max-w-2xl text-sm text-muted-foreground">
            {section.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-6", gridClass)}>
          {section.fields.map((field) => (
            <div
              className={getColumnSpanClass(field.colSpan)}
              key={field.id as string}
            >
              <FieldRenderer
                field={field}
                form={form}
                isEditing={isEditing}
                record={record}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function toRecordArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((entry): entry is Record<string, unknown> =>
      isRecord(entry),
    );
  }

  if (isRecord(data)) {
    if (Array.isArray(data.data)) {
      return data.data.filter((entry): entry is Record<string, unknown> =>
        isRecord(entry),
      );
    }

    if (isRecord(data.data)) {
      return [data.data];
    }

    return [data];
  }

  return [];
}
