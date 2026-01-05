"use client";

import type { ComponentProps } from "react";

import {
  type EmailEditorOutputs,
  UiEditor,
} from "@kompaniya/ui-email-editor/editor";
import { memo, useCallback, useState } from "react";

type EmailEditorFormProps = {
  initialValue?: ComponentProps<typeof UiEditor>["initialValue"];
};

type EmailEditorFormValues = {
  json: string;
  mjml: string;
  html: string;
};

const MemoUiEditor = memo(UiEditor);

export function EmailEditorForm({ initialValue }: EmailEditorFormProps) {
  const [formValues, setFormValues] = useState<EmailEditorFormValues>({
    json: "",
    mjml: "",
    html: "",
  });

  const handleOutputsChange = useCallback((outputs: EmailEditorOutputs) => {
    setFormValues({
      json: outputs.jsonOutput,
      mjml: outputs.mjmlOutput,
      html: outputs.htmlOutput,
    });
  }, []);

  return (
    <form className="flex min-h-svh justify-center">
      <input name="emailJson" readOnly type="hidden" value={formValues.json} />
      <input name="emailMjml" readOnly type="hidden" value={formValues.mjml} />
      <input name="emailHtml" readOnly type="hidden" value={formValues.html} />
      <MemoUiEditor
        initialValue={initialValue}
        onOutputsChange={handleOutputsChange}
      />
    </form>
  );
}
