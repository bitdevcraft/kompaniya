"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kompaniya/ui-common/components/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building,
  Building2,
  Calculator,
  Calendar,
  Circle,
  Contact,
  FileText,
  type LucideIcon,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  User,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { RecordLayoutBuilder } from "@/components/record-layout-builder";
import { fetchRecordLayout, updateRecordLayout } from "@/lib/record-layouts";

import type { EntityConfig } from "../config";

import { CustomAttributeManager } from "./custom-attribute-manager";

interface EntityDetailProps {
  entity: EntityConfig;
}

// Static icon map defined outside of render
const iconMap: Record<string, LucideIcon> = {
  Building2,
  Building,
  Calculator,
  Calendar,
  Contact,
  FileText,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  User,
  Warehouse,
};

export function EntityDetail({ entity }: EntityDetailProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("custom-attributes");

  // Fetch layout data
  const { data: layout, isLoading: layoutLoading } = useQuery({
    queryKey: ["record-layout", entity.entityType],
    queryFn: () => fetchRecordLayout(entity.entityType),
  });

  // Update layout mutation
  const mutation = useMutation({
    mutationFn: (layoutData: unknown) =>
      updateRecordLayout(
        entity.entityType,
        layoutData as Record<string, unknown>,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["record-layout", entity.entityType],
      });
      toast.success("Layout saved successfully");
    },
    onError: () => {
      toast.error("Failed to save layout. Please try again.");
    },
  });

  // Get the icon component from the map, fallback to Circle
  const IconComponent = iconMap[entity.icon] ?? Circle;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/settings/entity-manager">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex size-10 items-center justify-center rounded-lg border">
          <IconComponent className="size-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{entity.label}</h1>
          <p className="text-sm text-muted-foreground">{entity.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="custom-attributes">Custom Attributes</TabsTrigger>
          <TabsTrigger value="record-layout">Record Layout</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="custom-attributes">
          <CustomAttributeManager entity={entity} />
        </TabsContent>

        <TabsContent className="mt-4" value="record-layout">
          {layoutLoading ? (
            <div className="p-4">Loading layout...</div>
          ) : layout ? (
            <RecordLayoutBuilder
              entityType={entity.entityType}
              initialLayout={layout}
              onSave={(data) =>
                mutation.mutateAsync(data).then(() => undefined)
              }
            />
          ) : (
            <div className="p-4">No layout found.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
