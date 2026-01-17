"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kompaniya/ui-common/components/tabs";

import type { CustomComponentDefinition } from "@/lib/component-definitions";
import type { NativeFieldDefinition } from "@/lib/field-definitions";

import { ComponentPalette } from "./component-palette";
import { FieldPalette } from "./field-palette";

export interface PaletteSidebarProps {
  fields: NativeFieldDefinition[];
  components: CustomComponentDefinition[];
}

export function PaletteSidebar({ fields, components }: PaletteSidebarProps) {
  return (
    <Tabs className="w-full" defaultValue="fields">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="fields">Fields</TabsTrigger>
        <TabsTrigger value="components">Components</TabsTrigger>
      </TabsList>
      <TabsContent value="fields">
        <FieldPalette fields={fields} />
      </TabsContent>
      <TabsContent value="components">
        <ComponentPalette components={components} />
      </TabsContent>
    </Tabs>
  );
}
