"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { MjmlJsonNode } from "./types/ui-component";

import { selectDoc, useEmailDocStore } from "./store";
import { formatMjmlErrors, serializeMjml } from "./utils/mjml";

export type EmailEditorOutputActions = {
  getJSONValue: () => MjmlJsonNode | null;
  getMJMLValue: () => string;
  getHTMLValue: () => Promise<string>;
};

export type EmailEditorOutputs = {
  mjmlJson: MjmlJsonNode | null;
  jsonOutput: string;
  mjmlOutput: string;
  htmlOutput: string;
  htmlStatus: "idle" | "loading" | "error";
  htmlError: string | null;
};

export type UseEmailEditorOutputsOptions = {
  onOutputsChange?: (outputs: EmailEditorOutputs) => void;
};

const compileMjmlToHtml = async (mjml: string) => {
  try {
    const { default: mjml2html } = await import("mjml-browser");
    const result = mjml2html(mjml);
    const errorBanner = formatMjmlErrors(result.errors ?? []);
    const html = errorBanner ? `${errorBanner}\n${result.html}` : result.html;

    return {
      html,
      error: errorBanner || null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown MJML error";
    return {
      html: `<!-- MJML compile failed: ${message} -->`,
      error: message,
    };
  }
};

export const useEmailEditorOutputs = (
  options: UseEmailEditorOutputsOptions = {},
): EmailEditorOutputs & EmailEditorOutputActions => {
  const { onOutputsChange } = options;
  const data = useEmailDocStore(selectDoc);
  const toMjmlJson = useEmailDocStore((state) => state.toMjmlJson);
  const [compiledHtml, setCompiledHtml] = useState(() => ({
    mjml: "",
    html: "",
    error: null as string | null,
  }));

  const mjmlJson = useMemo(() => {
    void data;
    return toMjmlJson();
  }, [data, toMjmlJson]);
  const jsonOutput = useMemo(
    () => (mjmlJson ? JSON.stringify(mjmlJson, null, 2) : "{}"),
    [mjmlJson],
  );
  const mjmlOutput = useMemo(
    () => (mjmlJson ? serializeMjml(mjmlJson) : ""),
    [mjmlJson],
  );

  useEffect(() => {
    let cancelled = false;

    if (!mjmlOutput) {
      return () => {
        cancelled = true;
      };
    }

    const run = async () => {
      const { html, error } = await compileMjmlToHtml(mjmlOutput);
      if (!cancelled) {
        setCompiledHtml({
          mjml: mjmlOutput,
          html,
          error,
        });
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [mjmlOutput]);

  const htmlOutput = useMemo(
    () => (mjmlOutput ? compiledHtml.html : ""),
    [compiledHtml.html, mjmlOutput],
  );
  const htmlError = useMemo(() => {
    if (!mjmlOutput) return null;
    if (compiledHtml.mjml !== mjmlOutput) return null;
    return compiledHtml.error;
  }, [compiledHtml.error, compiledHtml.mjml, mjmlOutput]);
  const htmlStatus = useMemo<EmailEditorOutputs["htmlStatus"]>(() => {
    if (!mjmlOutput) return "idle";
    if (compiledHtml.mjml !== mjmlOutput) return "loading";
    return compiledHtml.error ? "error" : "idle";
  }, [compiledHtml.error, compiledHtml.mjml, mjmlOutput]);

  useEffect(() => {
    if (!onOutputsChange) return;

    onOutputsChange({
      mjmlJson,
      jsonOutput,
      mjmlOutput,
      htmlOutput,
      htmlStatus,
      htmlError,
    });
  }, [
    onOutputsChange,
    mjmlJson,
    jsonOutput,
    mjmlOutput,
    htmlOutput,
    htmlStatus,
    htmlError,
  ]);

  const getJSONValue = useCallback(() => mjmlJson, [mjmlJson]);
  const getMJMLValue = useCallback(() => mjmlOutput, [mjmlOutput]);
  const getHTMLValue = useCallback(async () => {
    if (!mjmlOutput) return "";
    if (compiledHtml.mjml === mjmlOutput) return htmlOutput;
    const { html } = await compileMjmlToHtml(mjmlOutput);
    return html;
  }, [compiledHtml.mjml, htmlOutput, mjmlOutput]);

  return {
    mjmlJson,
    jsonOutput,
    mjmlOutput,
    htmlOutput,
    htmlStatus,
    htmlError,
    getJSONValue,
    getMJMLValue,
    getHTMLValue,
  };
};
