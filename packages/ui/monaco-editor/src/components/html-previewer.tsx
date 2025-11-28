"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { cn } from "@kompaniya/ui-common/lib/utils";
import { ExternalLink } from "lucide-react";
import * as React from "react";

export type HtmlPreviewerProps = {
  /**
   * Raw HTML string that will be rendered in the preview tab.
   */
  html: string;
  /**
   * Optional document title for the preview tab.
   * Defaults to "HTML Preview".
   */
  title?: string;
  /**
   * Additional styles injected inside the preview document.
   */
  previewStyles?: string;
  /**
   * Callback invoked after attempting to open the preview window.
   */
  onOpen?: (previewWindow: Window | null) => void;
  /**
   * Class name applied to the wrapper element around the trigger button.
   */
  className?: string;
  /**
   * Props forwarded to the trigger button.
   */
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick" | "type">;
};

/**
 * Opens the provided HTML in a new browser tab for quick previewing.
 */
export function HtmlPreviewer({
  html,
  title = "HTML Preview",
  previewStyles,
  onOpen,
  className,
  buttonProps,
}: HtmlPreviewerProps) {
  const handleOpen = React.useCallback(() => {
    const previewWindow = window.open("", "_blank");

    if (previewWindow) {
      previewWindow.document.open();
      previewWindow.document.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${previewStyles ? `<style>${previewStyles}</style>` : ""}
  </head>
  <body>
    ${html}
  </body>
</html>`);
      previewWindow.document.close();
    }

    onOpen?.(previewWindow);
  }, [html, onOpen, previewStyles, title]);

  const {
    children,
    variant = "outline",
    ...restButtonProps
  } = buttonProps ?? {};

  return (
    <div className={cn("flex justify-end", className)}>
      <Button
        onClick={handleOpen}
        type="button"
        variant={variant}
        {...restButtonProps}
      >
        {children ?? (
          <span className="inline-flex items-center gap-2">
            <ExternalLink aria-hidden="true" className="size-4" />
            Open HTML preview
          </span>
        )}
      </Button>
    </div>
  );
}
