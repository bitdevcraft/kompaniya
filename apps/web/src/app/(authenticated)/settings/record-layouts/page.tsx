"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kompaniya/ui-common/components/select";
import { useRouter } from "next/navigation";
import React from "react";

import { ENTITY_TYPES } from "@/lib/field-definitions";

export default function Page() {
  const router = useRouter();
  const [value, setValue] = React.useState<string | undefined>();

  return (
    <div className="p-4 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Record Layouts</CardTitle>
          <CardDescription>
            Select the entity type whose layout you want to customize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={(nextValue) => {
              setValue(nextValue);
              router.push(`/settings/record-layouts/${nextValue}`);
            }}
            value={value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an entity type" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((entity) => (
                <SelectItem key={entity.value} value={entity.value}>
                  {entity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
