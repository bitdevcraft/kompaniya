import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@kompaniya/ui-common/components/accordion";
import { Button } from "@kompaniya/ui-common/components/button";
import { Copy } from "lucide-react";

import { copyToClipboard } from "../utils/clipboard";

export function OutputAccordionItem({
  value,
  title,
  content,
}: {
  value: string;
  title: string;
  content: string;
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="py-2">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <Button
            aria-label={`Copy ${title}`}
            className="h-7 w-7"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              copyToClipboard(content);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Copy />
          </Button>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <pre className="max-h-[260px] overflow-auto rounded-md border bg-muted p-3 text-xs leading-relaxed">
          {content}
        </pre>
      </AccordionContent>
    </AccordionItem>
  );
}
