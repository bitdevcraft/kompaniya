"use client";

import { Checkbox } from "@kompaniya/ui-common/components/checkbox";
import { Label } from "@kompaniya/ui-common/components/label";

import { SETTINGS_RESOURCES } from "@/lib/record-permissions";

import type { PermissionState } from "../config";

interface SettingsPermissionsTogglesProps {
  value: PermissionState;
  onChange: (value: PermissionState) => void;
  disabled?: boolean;
}

const SETTINGS_LABELS: Record<string, string> = {
  settingsOrganization: "Organization",
  settingsEmailSetup: "Email Setup",
  settingsEntityManager: "Entity Manager",
  settingsTags: "Tags",
};

export function SettingsPermissionsToggles({
  value,
  onChange,
  disabled = false,
}: SettingsPermissionsTogglesProps) {
  // Handle toggle change
  const handleToggle = (resource: string) => {
    const newPermissions = { ...value };
    const current = newPermissions[resource] || [];

    if (current.includes("access")) {
      // Remove access
      newPermissions[resource] = [];
    } else {
      // Add access
      newPermissions[resource] = ["access"];
    }

    onChange(newPermissions);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Settings</h3>
      <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
        {SETTINGS_RESOURCES.map((resource) => {
          const hasAccess = value[resource]?.includes("access") ?? false;

          return (
            <div
              className="flex items-center justify-between hover:bg-muted/50 rounded-md p-2 transition-colors"
              key={resource}
            >
              <Label
                className="cursor-pointer font-normal"
                htmlFor={`settings-${resource}`}
              >
                {SETTINGS_LABELS[resource] || resource}
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {hasAccess ? "Granted" : "None"}
                </span>
                <Checkbox
                  checked={hasAccess}
                  disabled={disabled}
                  id={`settings-${resource}`}
                  onCheckedChange={() => handleToggle(resource)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
