import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import { Checkbox } from "@kompaniya/ui-common/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kompaniya/ui-common/components/dropdown-menu";
import { DataTableRowAction } from "@kompaniya/ui-data-table/utils/data-table-columns";
import { HtmlLivePreview } from "@kompaniya/ui-monaco-editor/components/html-live-preview";
import { Row } from "@tanstack/react-table";
import { Edit, Ellipsis, Trash2 } from "lucide-react";
import React from "react";

import { DataTableActionType } from "@/types/data-table-actions";

import { tableType } from "./config";

interface DataTableCardProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<tableType> | null>
  >;
  row: Row<tableType>;
  defaultItem?: React.ReactNode;
}

export function DataTableCard({
  setRowAction,
  row,
  defaultItem,
}: DataTableCardProps) {
  return (
    <div className="p-1">
      <Card
        className="transition-shadow hover:shadow-sm data-[state=selected]:ring-2 data-[state=selected]:ring-primary/40"
        data-state={row.getIsSelected() ? "selected" : undefined}
      >
        <CardHeader className="">
          <CardTitle className="flex gap-4 mt-2">{row.original.name}</CardTitle>
          <CardAction className="flex gap-2 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  className="flex size-8 p-0"
                  size={"sm"}
                  variant="ghost"
                >
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() =>
                    setRowAction({ row, variant: DataTableActionType.UPDATE })
                  }
                >
                  <Edit />
                  Update
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    setRowAction({ row, variant: DataTableActionType.VIEW })
                  }
                  variant="destructive"
                >
                  <Trash2 />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Checkbox
              aria-label="Select row"
              checked={row.getIsSelected()}
              className="bg-muted size-6"
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-2">
          {defaultItem}
          <div>
            <HtmlLivePreview
              className="flex-1"
              html={row.original.body ?? ""}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
