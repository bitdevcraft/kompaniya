"use client";

import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@kompaniya/ui-common/components/card";
import { Checkbox } from "@kompaniya/ui-common/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kompaniya/ui-common/components/dropdown-menu";
import { DataTableRowAction } from "@kompaniya/ui-data-table/types/data-table";
import { Row } from "@tanstack/react-table";
import { Ellipsis, Trash2 } from "lucide-react";
import Link from "next/link";

import { DataTableActionType } from "@/types/data-table-actions";

import { tableType } from "./config";

interface DataTableCardProps {
  row: Row<tableType>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<tableType> | null>
  >;
  defaultItem?: React.ReactNode;
}

export function DataTableCard({
  defaultItem,
  row,
  setRowAction,
}: DataTableCardProps) {
  return (
    <div className="h-full">
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex flex-col gap-1">
            <Link href={`/record/payment-plan-templates/r/${row.original.id}`}>
              <Button size={"sm"} variant={"link"}>
                {row.original.code}
              </Button>
            </Link>
            <div className="text-sm font-semibold">{row.original.name}</div>
            <Badge variant={row.original.isActive ? "default" : "outline"}>
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
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
              <DropdownMenuContent align="end">
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
              className="size-6"
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          </div>
        </CardHeader>
        <CardContent>{defaultItem}</CardContent>
      </Card>
    </div>
  );
}
