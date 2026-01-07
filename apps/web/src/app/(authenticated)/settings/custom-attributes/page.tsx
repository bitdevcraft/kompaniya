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

import { customAttributeEntities } from "./entity-types";

export default function Page() {
  const router = useRouter();
  const [value, setValue] = React.useState<string | undefined>();

  return (
    <div className="p-4 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Custom Attributes</CardTitle>
          <CardDescription>
            Select the entity you want to customize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={(nextValue) => {
              setValue(nextValue);
              router.push(`/settings/custom-attribute/${nextValue}`);
            }}
            value={value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an entity" />
            </SelectTrigger>
            <SelectContent>
              {customAttributeEntities.map((entity) => (
                <SelectItem key={entity.slug} value={entity.slug}>
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
