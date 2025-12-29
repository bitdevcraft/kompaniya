"use client";

import React from "react";

import { MjmlEditor, createEmptyDoc } from "@kompaniya/ui-mjml-editor";

export function MjmlEditorSample() {
  const [doc] = React.useState(() => createEmptyDoc("Marketing sample"));

  return (
    <div className="h-[70vh] min-h-[480px] w-full">
      <MjmlEditor initialDoc={doc} />
    </div>
  );
}
