"use client";

import { Badge } from "@repo/shared-ui/components/common/badge";
import { Button } from "@repo/shared-ui/components/common/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@repo/shared-ui/components/common/card";
import { Checkbox } from "@repo/shared-ui/components/common/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/shared-ui/components/common/dropdown-menu";
import { Ellipsis, Trash2 } from "lucide-react";
import Link from "next/link";

import { DataTableActionType } from "@/types/data-table-actions";

import { model, tableType } from "./config";

interface DataTableCardProps {
  row: {
    id: string;
    original: tableType;
    getIsSelected: () => boolean;
    toggleSelected: (value?: boolean) => void;
  };
  setRowAction: (action: {
    row: DataTableCardProps["row"];
    variant: DataTableActionType;
  }) => void;
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
            <Link href={`/real-estate/${model.plural}/r/${row.original.id}`}>
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
