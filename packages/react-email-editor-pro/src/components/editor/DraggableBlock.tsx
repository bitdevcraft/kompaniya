import type { PropsWithChildren } from "react";

import { cn } from "../../lib/utils";

interface DraggableBlockProps extends PropsWithChildren {
  active?: boolean;
}

export function DraggableBlock({
  active = false,
  children,
}: DraggableBlockProps) {
  return (
    <div className={cn("relative", active && "pl-6")}>
      {active && (
        <span className="absolute left-0 top-2 flex h-4 w-4 items-center justify-center text-slate-400">
          ⋮⋮
        </span>
      )}
      {children}
    </div>
  );
}
