import { OrgLead } from "@repo/database/schema";
import { Button } from "@repo/shared-ui/components/common/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/shared-ui/components/common/card";
import { Checkbox } from "@repo/shared-ui/components/common/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/shared-ui/components/common/dropdown-menu";
import { DataTableRowAction } from "@repo/shared-ui/components/ts/data-table/utils/data-table-columns";
import { Row } from "@tanstack/react-table";
import { Edit, Ellipsis, Trash2 } from "lucide-react";
import React from "react";

import { DataTableActionType } from "@/types/data-table-actions";

interface DataTableCardProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<OrgLead> | null>
  >;
  row: Row<OrgLead>;
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
        <CardContent>{defaultItem}</CardContent>
      </Card>
    </div>
  );
}
