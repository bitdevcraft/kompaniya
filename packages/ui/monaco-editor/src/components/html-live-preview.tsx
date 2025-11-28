"use client";

import { cn } from "@kompaniya/ui-common/lib/utils";
import * as React from "react";

export type HtmlLivePreviewProps = {
  /**
   * The raw HTML string to render inside the preview frame.
   */
  html: string;
  /**
   * Optional styles injected into the preview document.
   */
  previewStyles?: string;
  /**
   * Optional title applied to the iframe for accessibility.
   */
  title?: string;
  /**
   * Class name applied to the preview container.
   */
  className?: string;
  /**
   * Class name forwarded to the iframe element.
   */
  frameClassName?: string;
  /**
   * Text displayed in the preview header.
   */
  header?: React.ReactNode;
};

/**
 * Renders HTML content in an isolated iframe that automatically updates as the
 * source markup changes.
 */
export function HtmlLivePreview({
  html,
  previewStyles,
  title = "HTML live preview",
  className,
  frameClassName,
  header = "Live preview",
}: HtmlLivePreviewProps) {
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const cleanupRef = React.useRef<(() => void) | null>(null);
  const srcDoc = React.useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${previewStyles ? `<style>${previewStyles}</style>` : ""}
  </head>
  <body>
    ${html}
  </body>
</html>`;
  }, [html, previewStyles]);

  React.useEffect(() => {
    const iframe = frameRef.current;
    if (!iframe) {
      return;
    }

    const attachInterceptor = () => {
      cleanupRef.current?.();

      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }

      const handleAnchorClick = (event: MouseEvent) => {
        const target = (event.target as Element | null)?.closest?.("a");
        if (!target) {
          return;
        }

        const href = target.getAttribute("href");
        if (!href || href.startsWith("#")) {
          return;
        }

        event.preventDefault();
      };

      doc.addEventListener("click", handleAnchorClick);
      cleanupRef.current = () =>
        doc.removeEventListener("click", handleAnchorClick);
    };

    const handleLoad = () => {
      attachInterceptor();
    };

    iframe.addEventListener("load", handleLoad);

    if (iframe.contentDocument?.readyState === "complete") {
      attachInterceptor();
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [srcDoc]);

  return (
    <section
      aria-label={typeof header === "string" ? header : undefined}
      className={cn(
        "flex h-full min-h-[320px] flex-1 flex-col overflow-hidden rounded-md border",
        className,
      )}
    >
      <header className="border-b bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
        {header}
      </header>
      <iframe
        className={cn("h-full w-full flex-1 bg-white", frameClassName)}
        ref={frameRef}
        sandbox=""
        srcDoc={srcDoc}
        title={title}
      />
    </section>
  );
}
