"use client";

import { cn } from "@kompaniya/ui-common/lib/utils";
import { useState } from "react";

export function TableSizePicker({
  maxRows = 8,
  maxCols = 8,
  onSelect,
}: {
  maxRows?: number;
  maxCols?: number;
  onSelect: (rows: number, cols: number) => void;
}) {
  const [hover, setHover] = useState({ rows: 0, cols: 0 });

  return (
    <div className="flex flex-col gap-2 p-2">
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: maxRows }).map((_, rowIndex) =>
          Array.from({ length: maxCols }).map((__, colIndex) => {
            const isActive = rowIndex < hover.rows && colIndex < hover.cols;
            return (
              <button
                aria-label={`Insert ${rowIndex + 1} by ${colIndex + 1} table`}
                className={cn(
                  "h-4 w-4 rounded-[2px] border border-border bg-secondary",
                  isActive && "border-foreground",
                )}
                key={`${rowIndex}-${colIndex}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(rowIndex + 1, colIndex + 1);
                }}
                onMouseEnter={() =>
                  setHover({ rows: rowIndex + 1, cols: colIndex + 1 })
                }
                type="button"
              />
            );
          }),
        )}
      </div>
      <div className="text-center text-xs text-muted-foreground">
        {hover.rows} x {hover.cols}
      </div>
    </div>
  );
}
