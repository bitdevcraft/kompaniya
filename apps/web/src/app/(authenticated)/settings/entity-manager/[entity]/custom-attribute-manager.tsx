"use client";

import type { CustomFieldDefinition } from "@repo/database/schema";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@kompaniya/ui-common/components/alert";
import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kompaniya/ui-common/components/dropdown-menu";
import { ResponsiveDialog } from "@kompaniya/ui-common/components/responsive-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kompaniya/ui-common/components/table";
import { convertCase } from "@repo/shared/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Edit, Ellipsis, Plus, Trash2 } from "lucide-react";
import React from "react";

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { env } from "@/env/client";

import type { EntityConfig } from "../config";

import { CustomFieldDefinitionForm } from "./custom-field-definition-form";

interface CustomAttributeManagerProps {
  entity: EntityConfig;
}

const definitionEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/custom-fields/definitions`;

export function CustomAttributeManager({
  entity,
}: CustomAttributeManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingDefinition, setEditingDefinition] =
    React.useState<CustomFieldDefinition | null>(null);
  const [deletingDefinition, setDeletingDefinition] =
    React.useState<CustomFieldDefinition | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["custom-field-definitions", entity.entityType],
    queryFn: async () => {
      const response = await axios.get<CustomFieldDefinition[]>(
        definitionEndpoint,
        {
          params: { entityType: entity.entityType },
          withCredentials: true,
        },
      );
      return response.data;
    },
  });

  const definitions = data ?? [];
  const errorMessage = axios.isAxiosError(error)
    ? error.response?.data?.message || error.message
    : error instanceof Error
      ? error.message
      : "Unable to load custom attributes.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-2xl font-semibold">Custom Attributes</div>
          <div className="text-sm text-muted-foreground">
            Manage custom fields for {entity.label}.
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} variant="default">
          <Plus />
          New Attribute
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{entity.label} Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading custom attributes...
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load attributes</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : definitions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No custom attributes yet. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead className="hidden md:table-cell">Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Required
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Indexed
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Choices
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {definitions.map((definition) => (
                  <TableRow key={definition.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{definition.label}</div>
                        {definition.description && (
                          <div className="text-xs text-muted-foreground">
                            {definition.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs">
                      {definition.key}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {convertCase(definition.fieldType, "snake", "title")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant={definition.isRequired ? "default" : "outline"}
                      >
                        {definition.isRequired ? "Required" : "Optional"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant={definition.isIndexed ? "default" : "outline"}
                      >
                        {definition.isIndexed ? "Indexed" : "Not Indexed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {definition.choices?.length
                        ? `${definition.choices.length} options`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label="Open menu"
                            className="h-8 w-8 p-0"
                            variant="ghost"
                          >
                            <Ellipsis className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => setEditingDefinition(definition)}
                          >
                            <Edit />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => setDeletingDefinition(definition)}
                            variant="destructive"
                          >
                            <Trash2 />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        title="New Custom Attribute"
      >
        {isCreateOpen && (
          <CustomFieldDefinitionForm
            entityType={entity.entityType}
            mode="create"
            onFinish={() => setIsCreateOpen(false)}
          />
        )}
      </ResponsiveDialog>

      <ResponsiveDialog
        isOpen={!!editingDefinition}
        setIsOpen={(open) => {
          if (!open) setEditingDefinition(null);
        }}
        title="Update Custom Attribute"
      >
        {editingDefinition && (
          <CustomFieldDefinitionForm
            definition={editingDefinition}
            entityType={entity.entityType}
            mode="edit"
            onFinish={() => setEditingDefinition(null)}
          />
        )}
      </ResponsiveDialog>

      {deletingDefinition && (
        <ConfirmDeleteDialog
          description="This will remove the custom attribute definition."
          endpoint={`${definitionEndpoint}/${deletingDefinition.id}`}
          open={!!deletingDefinition}
          queryKey={["custom-field-definitions", entity.entityType]}
          setIsOpen={(open) => {
            if (!open) setDeletingDefinition(null);
          }}
          title={`Delete ${deletingDefinition.label}?`}
        />
      )}
    </div>
  );
}
