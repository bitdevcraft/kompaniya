"use client";

import type { EmailEditorOutputs } from "@kompaniya/ui-email-editor/editor";

import { UiEditor } from "@kompaniya/ui-email-editor/editor";
import { HtmlLivePreview } from "@kompaniya/ui-monaco-editor/components/html-live-preview";
import { useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";

export type MjmlRecordFieldProps = BaseRecordFieldProps<
  string | null | undefined
>;

type MjmlJsonNode = {
  tagName: string;
  attributes?: Record<string, string>;
  children?: MjmlJsonNode[];
  content?: string;
};

const PREVIEW_STYLES = `body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 1.5rem;
  background-color: #ffffff;
  color: #0f172a;
}`;

export function MjmlRecordField({
  description,
  editing,
  label,
  name,
  onChange,
  record,
  value,
}: MjmlRecordFieldProps) {
  const form = useFormContext();

  const initialValue = useMemo(() => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed) as MjmlJsonNode;
    } catch {
      return null;
    }
  }, [value]);

  const editorKey = useMemo(() => {
    const recordId =
      typeof record?.["id"] === "string" ? (record["id"] as string) : "";
    return recordId ? `mjml-${recordId}` : "mjml-editor";
  }, [record]);

  const previewHtml = useMemo(() => {
    const htmlContent =
      typeof record?.["htmlContent"] === "string"
        ? (record["htmlContent"] as string)
        : "";
    if (htmlContent.trim().length > 0) return htmlContent;
    const body =
      typeof record?.["body"] === "string" ? (record["body"] as string) : "";
    return body;
  }, [record]);

  const handleOutputsChange = useCallback(
    (outputs: EmailEditorOutputs) => {
      const jsonOutput = outputs.jsonOutput ?? "";
      onChange?.(jsonOutput);
      form.setValue("mjmlJsonContent", jsonOutput, { shouldDirty: true });
      form.setValue("mjmlContent", outputs.mjmlOutput ?? "", {
        shouldDirty: true,
      });
      form.setValue("htmlContent", outputs.htmlOutput ?? "", {
        shouldDirty: true,
      });
      form.setValue("body", outputs.htmlOutput ?? "", { shouldDirty: true });
    },
    [form, onChange],
  );

  if (!editing) {
    return (
      <div className="space-y-3">
        <RecordField fallback="" label={label} value={null} />
        <HtmlLivePreview
          frameClassName="min-h-[360px]"
          header={`${label} preview`}
          html={previewHtml}
          previewStyles={PREVIEW_STYLES}
        />
        <FieldDescription description={description} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className="min-h-svh">
        <UiEditor
          initialValue={initialValue}
          key={editorKey}
          onOutputsChange={handleOutputsChange}
        />
      </div>
      <FieldDescription description={description} />
    </div>
  );
}
