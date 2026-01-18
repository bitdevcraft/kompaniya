"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@kompaniya/ui-common/components/dialog";
import { Input } from "@kompaniya/ui-common/components/input";
import { Label } from "@kompaniya/ui-common/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kompaniya/ui-common/components/select";
import { Switch } from "@kompaniya/ui-common/components/switch";
import { useEffect, useState } from "react";

import type { CustomComponentDefinition } from "@/lib/component-definitions";

import { getEntityTypesWithDefinitions } from "@/lib/field-definitions";

interface ComponentConfigDialogProps {
  component: CustomComponentDefinition;
  open: boolean;
  onClose: () => void;
  onSave: (props: Record<string, unknown>) => void;
  currentProps?: Record<string, unknown>;
}

export function ComponentConfigDialog({
  component,
  open,
  onClose,
  onSave,
  currentProps,
}: ComponentConfigDialogProps) {
  const [values, setValues] = useState<Record<string, unknown>>(
    currentProps || {},
  );

  // Reset values when dialog opens or currentProps changes
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync form state when dialog opens
      setValues(currentProps || {});
    }
  }, [open, currentProps]);

  const handleSubmit = () => {
    onSave(values);
    onClose();
  };

  // Render different input types based on prop name and type
  const renderPropInput = (key: string, value: unknown) => {
    // sourceEntityType: entity type selector
    if (key === "sourceEntityType") {
      const entityTypes = getEntityTypesWithDefinitions();
      return (
        <Select
          onValueChange={(v) => setValues({ ...values, [key]: v })}
          value={(value as string) || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select entity type" />
          </SelectTrigger>
          <SelectContent>
            {entityTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {formatLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // currency: currency selector
    if (key === "currency") {
      const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
      return (
        <Select
          onValueChange={(v) => setValues({ ...values, [key]: v })}
          value={(value as string) || "USD"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr} value={curr}>
                {curr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Boolean values: toggle switch
    if (typeof value === "boolean") {
      return (
        <Switch
          checked={value as boolean}
          onCheckedChange={(v) => setValues({ ...values, [key]: v })}
        />
      );
    }

    // Number values: number input
    if (typeof value === "number") {
      return (
        <Input
          onChange={(e) =>
            setValues({ ...values, [key]: Number.parseFloat(e.target.value) })
          }
          type="number"
          value={value}
        />
      );
    }

    // String values: text input
    return (
      <Input
        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        type="text"
        value={(value as string) || ""}
      />
    );
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure {component.label}</DialogTitle>
          <DialogDescription>{component.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {Object.entries(component.props || {}).map(([key, defaultValue]) => (
            <div className="grid grid-cols-4 items-center gap-4" key={key}>
              <Label className="text-right" htmlFor={key}>
                {formatLabel(key)}
              </Label>
              <div className="col-span-3">
                {renderPropInput(key, values[key] ?? defaultValue)}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              onClose();
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="button">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ")
    .trim();
}
