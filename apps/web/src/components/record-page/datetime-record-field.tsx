import { Button } from "@kompaniya/ui-common/components/button";
import { Calendar } from "@kompaniya/ui-common/components/calendar";
import { Input } from "@kompaniya/ui-common/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kompaniya/ui-common/components/popover";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { CalendarClockIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";
import { formatDateTime } from "./utils";

export type DatetimeRecordFieldProps = BaseRecordFieldProps<
  string | null | undefined
>;

export function DatetimeRecordField({
  description,
  editing,
  fallback,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}: DatetimeRecordFieldProps) {
  const parsedDate = useMemo(() => parseDate(value), [value]);

  // Local override only when the user types; null means "derive from parsedDate"
  const [timeInput, setTimeInput] = useState<string | null>(null);

  const displayTime =
    timeInput ?? (parsedDate ? formatTimeInput(parsedDate) : "");

  if (!editing) {
    const displayValue = parsedDate ? formatDateTime(parsedDate) : value;

    return (
      <div className="space-y-2">
        <RecordField fallback={fallback} label={label} value={displayValue} />
        <FieldDescription description={description} />
      </div>
    );
  }

  const buttonLabel = parsedDate
    ? formatDateTime(parsedDate)
    : (placeholder ?? "Select date and time");

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
              <CalendarClockIcon className="mr-2 size-4" />
              {buttonLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              initialFocus
              mode="single"
              onSelect={(nextDate) => {
                if (!nextDate) {
                  setTimeInput(null);
                  onChange?.(null);
                  onBlur?.();
                  return;
                }

                const nextValue = formatDateInput(nextDate);
                const nextTime =
                  displayTime && displayTime.length > 0 ? displayTime : "00:00";
                onChange?.(`${nextValue}T${nextTime}`);

                // Return to derived mode so UI reflects parent-controlled value
                setTimeInput(null);
                onBlur?.();
              }}
              selected={parsedDate ?? undefined}
            />
          </PopoverContent>
        </Popover>
        <Input
          aria-label="Select time"
          onBlur={onBlur}
          onChange={(event) => {
            const next = event.target.value;
            setTimeInput(next);
            if (parsedDate && next) {
              onChange?.(`${formatDateInput(parsedDate)}T${next}`);
              onBlur?.();
            } else if (parsedDate && !next) {
              onChange?.(`${formatDateInput(parsedDate)}T00:00`);
              onBlur?.();
            }
          }}
          placeholder="HH:MM"
          type="time"
          value={displayTime}
        />
        {parsedDate ? (
          <Button
            aria-label="Clear date and time"
            onClick={() => {
              setTimeInput(null);
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

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeInput(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
