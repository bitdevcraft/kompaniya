import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { cn } from "@kompaniya/ui-common/lib/utils";

interface Props {
  id: UniqueIdentifier;
  index: number;
  orientation?: "vertical" | "horizontal";
  isEnabled?: boolean;
}

export function DroppableGap({
  id,
  index,
  orientation = "vertical",
  isEnabled = false,
  children,
  ...props
}: Props & Omit<React.ComponentProps<"div">, "id">) {
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable|${id}|${index}`,
    disabled: !isEnabled,
  });

  const isHorizontal = orientation === "horizontal";
  const gapPadding = 6;
  const gapStyle: React.CSSProperties = isHorizontal
    ? {
        width: 0,
        paddingLeft: gapPadding,
        paddingRight: gapPadding,
        marginLeft: -gapPadding,
        marginRight: -gapPadding,
      }
    : {
        height: 0,
        paddingTop: gapPadding,
        paddingBottom: gapPadding,
        marginTop: -gapPadding,
        marginBottom: -gapPadding,
      };

  return (
    <div
      className={cn("relative", isHorizontal ? "self-stretch" : "w-full")}
      id={`droppable|${id}|${index}`}
      ref={setNodeRef}
      style={{
        ...gapStyle,
      }}
      {...props}
    >
      {children}
      {isOver &&
        (isHorizontal ? (
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded bg-blue-500" />
        ) : (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-blue-500" />
        ))}
    </div>
  );
}
