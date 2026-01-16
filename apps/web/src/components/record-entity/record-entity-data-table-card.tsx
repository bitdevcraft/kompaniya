"use client";

import type { Row } from "@tanstack/react-table";
import type { Dispatch, ReactNode, SetStateAction } from "react";

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
import { Edit, Ellipsis, Trash2 } from "lucide-react";

import { DataTableActionType } from "@/types/data-table-actions";

interface RecordEntityCardProps<TData> {
  setRowAction: Dispatch<SetStateAction<DataTableRowAction<TData> | null>>;
  row: Row<TData>;
  defaultItem?: ReactNode;
  renderTitle?: (row: TData) => ReactNode;
  renderSubtitle?: (row: TData) => ReactNode;
}

export function RecordEntityCard<TData>({
  setRowAction,
  row,
  defaultItem,
  renderTitle,
  renderSubtitle,
}: RecordEntityCardProps<TData>) {
  const title = renderTitle ? renderTitle(row.original) : null;
  const subtitle = renderSubtitle ? renderSubtitle(row.original) : null;

  return (
    <div className="p-1">
      <Card
        className="transition-shadow hover:shadow-sm data-[state=selected]:ring-2 data-[state=selected]:ring-primary/40"
        data-state={row.getIsSelected() ? "selected" : undefined}
      >
        <CardHeader>
          <CardTitle className="flex gap-4 mt-2">{title}</CardTitle>
          {subtitle ? (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          ) : null}
          <CardAction className="flex gap-2 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  className="flex size-8 p-0"
                  size="sm"
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
                    setRowAction({ row, variant: DataTableActionType.DELETE })
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
        <CardContent>{defaultItem}</CardContent>
      </Card>
    </div>
  );
}
