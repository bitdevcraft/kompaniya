"use client";

import Uppy, { type UploadResult } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import Tus from "@uppy/tus";
import { useEffect, useMemo } from "react";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

export type FileUploadProps<Meta extends Record<string, string> = Record<string, string>> = {
  endpoint?: string;
  autoProceed?: boolean;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  meta?: Meta;
  headers?: Record<string, string>;
  note?: string;
  proudlyDisplayPoweredByUppy?: boolean;
  height?: number;
  width?: number | string;
  showProgressDetails?: boolean;
  onComplete?: (
    result: UploadResult<Meta, Record<string, unknown>>
  ) => void;
};

export function FileUpload<Meta extends Record<string, string>>({
  endpoint = "/api/uploads",
  autoProceed = false,
  allowedFileTypes,
  maxFileSize,
  maxNumberOfFiles,
  meta,
  headers,
  note,
  proudlyDisplayPoweredByUppy = false,
  height = 360,
  width = "100%",
  showProgressDetails = true,
  onComplete,
}: FileUploadProps<Meta>) {
  const allowedFileTypesKey = useMemo(
    () => JSON.stringify(allowedFileTypes ?? null),
    [allowedFileTypes]
  );
  const metaKey = useMemo(() => JSON.stringify(meta ?? {}), [meta]);
  const headersKey = useMemo(() => JSON.stringify(headers ?? {}), [headers]);

  const uppy = useMemo(() => {
    const parsedAllowedFileTypes = allowedFileTypesKey
      ? (JSON.parse(allowedFileTypesKey) as string[] | null)
      : null;
    const parsedHeaders = JSON.parse(headersKey) as Record<string, string>;
    const parsedMeta = JSON.parse(metaKey) as Meta;

    const instance = new Uppy<Meta, Record<string, unknown>>({
      autoProceed,
      restrictions: {
        allowedFileTypes: parsedAllowedFileTypes ?? undefined,
        maxFileSize,
        maxNumberOfFiles,
      },
      meta: parsedMeta,
    });

    instance.use(Tus, {
      endpoint,
      headers:
        Object.keys(parsedHeaders).length > 0 ? parsedHeaders : undefined,
    });

    return instance;
  }, [
    allowedFileTypesKey,
    autoProceed,
    endpoint,
    headersKey,
    maxFileSize,
    maxNumberOfFiles,
    metaKey,
  ]);

  useEffect(() => {
    return () => {
      uppy.close({ reason: "unmount" });
    };
  }, [uppy]);

  useEffect(() => {
    if (!onComplete) {
      return undefined;
    }

    const handler = (result: UploadResult<Meta, Record<string, unknown>>) => {
      onComplete(result);
    };

    uppy.on("complete", handler);

    return () => {
      uppy.off("complete", handler);
    };
  }, [onComplete, uppy]);

  return (
    <Dashboard
      height={height}
      note={note}
      proudlyDisplayPoweredByUppy={proudlyDisplayPoweredByUppy}
      showProgressDetails={showProgressDetails}
      uppy={uppy}
      width={width}
    />
  );
}
