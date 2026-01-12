"use client";

import { Checkbox } from "@kompaniya/ui-common/components/checkbox";
import { Label } from "@kompaniya/ui-common/components/label";
import { CRUD, ORG_RESOURCES } from "@repo/shared/auth";
import { type Crud } from "@repo/shared/auth";

import type { PermissionState } from "../config";

type CheckedState = boolean | "indeterminate";

interface PermissionCheckboxGroupProps {
  value: PermissionState;
  onChange: (value: PermissionState) => void;
  disabled?: boolean;
}

export function PermissionCheckboxGroup({
  value,
  onChange,
  disabled = false,
}: PermissionCheckboxGroupProps) {
  // Helper to get checked state for a resource (including indeterminate)
  const getResourceCheckedState = (resource: string): CheckedState => {
    const permissions = value[resource] || [];
    const checkedCount = CRUD.filter((action) =>
      permissions.includes(action),
    ).length;

    if (checkedCount === 0) return false;
    if (checkedCount === CRUD.length) return true;
    return "indeterminate";
  };

  // Helper to check if all actions for a resource are selected
  const isResourceFullyChecked = (resource: string): boolean => {
    const permissions = value[resource] || [];
    return CRUD.every((action) => permissions.includes(action));
  };

  // Handle parent checkbox change
  const handleResourceToggle = (resource: string) => {
    const newPermissions = { ...value };
    if (isResourceFullyChecked(resource)) {
      // Deselect all
      newPermissions[resource] = [];
    } else {
      // Select all
      newPermissions[resource] = [...CRUD];
    }
    onChange(newPermissions);
  };

  // Handle individual action checkbox change
  const handleActionToggle = (resource: string, action: Crud) => {
    const newPermissions = { ...value };
    const current = newPermissions[resource] || [];

    if (current.includes(action)) {
      newPermissions[resource] = current.filter((a) => a !== action);
    } else {
      newPermissions[resource] = [...current, action];
    }

    onChange(newPermissions);
  };

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {ORG_RESOURCES.map((resource) => {
        const displayName = formatResourceName(resource);
        const checkedState = getResourceCheckedState(resource);
        const resourcePermissions = value[resource] || [];

        return (
          <div
            className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
            key={resource}
          >
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={checkedState}
                disabled={disabled}
                id={resource}
                onCheckedChange={() => handleResourceToggle(resource)}
              />
              <Label
                className="font-semibold cursor-pointer flex-1"
                htmlFor={resource}
              >
                {displayName}
              </Label>
              <span className="text-xs text-muted-foreground">
                {resourcePermissions.length} / {CRUD.length}
              </span>
            </div>

            <div className="ml-6 flex gap-4">
              {CRUD.map((action) => (
                <div
                  className="flex items-center gap-2"
                  key={`${resource}-${action}`}
                >
                  <Checkbox
                    checked={resourcePermissions.includes(action)}
                    disabled={disabled}
                    id={`${resource}-${action}`}
                    onCheckedChange={() => handleActionToggle(resource, action)}
                  />
                  <Label
                    className="cursor-pointer capitalize text-sm"
                    htmlFor={`${resource}-${action}`}
                  >
                    {action}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper to format resource name for display
function formatResourceName(resource: string): string {
  return resource
    .replace(/^org/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}
