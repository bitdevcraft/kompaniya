import { useMemo } from "react";

import { Button } from "@repo/shared-ui/components/common/button";
import { Calendar } from "@repo/shared-ui/components/common/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/shared-ui/components/common/popover";
import { cn } from "@repo/shared-ui/lib/utils";
import { CalendarIcon, XIcon } from "lucide-react";

import { RecordField } from "./record-field";
import {
  FieldDescription,
  FieldLabel,
  type BaseRecordFieldProps,
} from "./record-field-types";
import { formatDateTime } from "./utils";

export type DateRecordFieldProps = BaseRecordFieldProps<string | null | undefined>;

export function DateRecordField({
  description,
  editing,
  fallback,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}: DateRecordFieldProps) {
  const parsedDate = useMemo(() => parseDate(value), [value]);

  if (!editing) {
    const displayValue = parsedDate
      ? formatDateTime(parsedDate, { dateStyle: "long", timeStyle: undefined })
      : value;

    return (
      <div className="space-y-2">
        <RecordField fallback={fallback} label={label} value={displayValue} />
        <FieldDescription description={description} />
      </div>
    );
  }

  const buttonLabel = parsedDate
    ? formatDateTime(parsedDate, { dateStyle: "long", timeStyle: undefined })
    : placeholder ?? "Select a date";

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                "justify-start text-left font-normal",
                !parsedDate && "text-muted-foreground",
              )}
              id={name}
              variant="outline"
            >
              <CalendarIcon className="mr-2 size-4" />
              {buttonLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              initialFocus
              mode="single"
              onSelect={(nextDate) => {
                if (!nextDate) {
                  onChange?.(null);
                  onBlur?.();
                  return;
                }

                onChange?.(formatDateInput(nextDate));
                onBlur?.();
              }}
              selected={parsedDate ?? undefined}
            />
          </PopoverContent>
        </Popover>
        {parsedDate ? (
          <Button
            aria-label="Clear date"
            onClick={() => {
              onChange?.(null);
              onBlur?.();
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <XIcon className="mr-1 size-4" />
            Clear
          </Button>
        ) : null}
      </div>
      <FieldDescription description={description} />
    </div>
  );
}

function parseDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
