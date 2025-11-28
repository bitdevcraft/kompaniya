"use client";

import { Card, CardContent } from "@kompaniya/ui-common/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kompaniya/ui-common/components/tabs";
import { HtmlEditor } from "@kompaniya/ui-monaco-editor/components/html-editor";
import { HtmlLivePreview } from "@kompaniya/ui-monaco-editor/components/html-live-preview";
import * as React from "react";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";

export type HtmlRecordFieldProps = BaseRecordFieldProps<
  string | null | undefined
> & {
  /**
   * Optional styles that will be injected into the live preview iframe.
   */
  previewStyles?: string;
};

const DEFAULT_PREVIEW_STYLES = `body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 1.5rem;
  background-color: #ffffff;
  color: #0f172a;
}`;

export function HtmlRecordField({
  description,
  editing,
  label,
  name,
  onBlur,
  onChange,
  previewStyles,
  value,
}: HtmlRecordFieldProps) {
  const [mode, setMode] = React.useState<"code" | "preview">("code");
  const htmlValue = typeof value === "string" ? value : (value ?? "");

  if (!editing) {
    return (
      <div className="space-y-3">
        <RecordField fallback="" label={label} value={null} />
        <Card className="border-border/60">
          <CardContent className="p-0">
            <HtmlLivePreview
              frameClassName="min-h-[320px]"
              header={label}
              html={htmlValue}
              previewStyles={previewStyles ?? DEFAULT_PREVIEW_STYLES}
            />
          </CardContent>
        </Card>
        <FieldDescription description={description} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Tabs
        className="space-y-3"
        onValueChange={(next) => setMode(next as "code" | "preview")}
        value={mode}
      >
        <TabsList className="w-full justify-start">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent className="space-y-3" value="code">
          <div className="rounded-md border">
            <HtmlEditor
              editorClassName="h-[320px]"
              height={320}
              onBlur={onBlur}
              onValueChange={(next) => onChange?.(next)}
              options={{ minimap: { enabled: false }, wordWrap: "on" }}
              value={htmlValue}
            />
          </div>
        </TabsContent>
        <TabsContent className="space-y-3" value="preview">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <HtmlLivePreview
                frameClassName="min-h-[320px]"
                header={`${label} preview`}
                html={htmlValue}
                previewStyles={previewStyles ?? DEFAULT_PREVIEW_STYLES}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <FieldDescription description={description} />
    </div>
  );
}
