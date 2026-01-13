"use client";

import "@uppy/core/css/style.min.css";
import { Button } from "@kompaniya/ui-common/components/button";
import { Progress } from "@kompaniya/ui-common/components/progress";
import { cn } from "@kompaniya/ui-common/lib/utils";
import Uppy, {
  type Body,
  type State,
  type UploadResult,
  type UppyFile,
} from "@uppy/core";
import {
  UppyContextProvider,
  useDropzone,
  useUppyContext,
  useUppyState,
} from "@uppy/react";
import Tus from "@uppy/tus";
import { Info, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { env } from "@/env/client";

export type FileUploadProps<
  M extends Record<string, string> = Record<string, string>,
> = {
  allowedFileTypes?: string[];
  autoProceed?: boolean;
  endpoint?: string;
  headers?: Record<string, string>;
  height?: number;
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  meta?: M;
  note?: string;
  onComplete?: (result: UploadResult<M, Record<string, unknown>>) => void;
  proudlyDisplayPoweredByUppy?: boolean;
  width?: number | string;
};

type FileItemProps<M extends Record<string, string>, B extends Body> = {
  file: UppyFile<M, B>;
};

type InnerFileUploadProps<
  M extends Record<string, string>,
  B extends Body,
> = FileUploadProps<M> & {
  uppy: Uppy<M, B>;
};

export function FileUpload<M extends Record<string, string>>({
  allowedFileTypes,
  autoProceed = false,
  endpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/file-upload`,
  headers,
  height = 360,
  maxFileSize,
  maxNumberOfFiles,
  meta,
  note,
  onComplete,
  proudlyDisplayPoweredByUppy: _proudlyDisplayPoweredByUppy,
  width = "100%",
}: FileUploadProps<M>) {
  const allowedFileTypesKey = useMemo(
    () => JSON.stringify(allowedFileTypes ?? null),
    [allowedFileTypes],
  );
  const headersKey = useMemo(() => JSON.stringify(headers ?? {}), [headers]);
  const metaKey = useMemo(() => JSON.stringify(meta ?? {}), [meta]);

  const uppy = useMemo(() => {
    const parsedAllowedFileTypes = allowedFileTypesKey
      ? (JSON.parse(allowedFileTypesKey) as string[] | null)
      : null;
    const parsedHeaders = JSON.parse(headersKey) as Record<string, string>;
    const parsedMeta = JSON.parse(metaKey) as M;

    const instance = new Uppy<M, Record<string, unknown>>({
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
      withCredentials: true,
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

  // Clean up Uppy instance on unmount
  useEffect(() => {
    return () => {
      uppy.destroy();
    };
  }, [uppy]);

  return (
    <UppyContextProvider
      uppy={
        uppy as unknown as Uppy<Record<string, unknown>, Record<string, never>>
      }
    >
      <InnerFileUpload
        autoProceed={autoProceed}
        height={height}
        note={note}
        onComplete={onComplete}
        uppy={uppy}
        width={width}
      />
    </UppyContextProvider>
  );
}

function DropzoneArea() {
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);
  const { getRootProps, getInputProps } = useDropzone({
    onDragEnter: () => {
      dragDepth.current += 1;
      setDragOver(true);
    },
    onDragOver: () => setDragOver(true),
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) {
        setDragOver(false);
      }
    },
    onDrop: () => {
      dragDepth.current = 0;
      setDragOver(false);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-border rounded-lg p-8 transition-all",
        "hover:border-primary/50 hover:bg-accent/50 cursor-pointer",
        dragOver && "border-primary bg-primary/5",
      )}
    >
      <input {...getInputProps()} className="hidden" />
      <div className="flex flex-col items-center gap-3">
        <Upload className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          Drop files here or{" "}
          <span className="text-primary">click to browse</span>
        </p>
      </div>
    </div>
  );
}

function FileItem<M extends Record<string, string>, B extends Body>({
  file,
}: FileItemProps<M, B>) {
  const uppy = useUppyContext();
  const percentage = file.progress.percentage ?? 0;
  const isUploading = percentage > 0 && percentage < 100;
  const isComplete = percentage === 100;
  const hasError = !!file.error;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors",
        hasError && "border-destructive/50 bg-destructive/5",
        isComplete && "border-green-500/30 bg-green-500/5",
      )}
    >
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted shrink-0">
        {hasError ? (
          <X className="h-5 w-5 text-destructive" />
        ) : isComplete ? (
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        ) : (
          <svg
            className={cn(
              "h-5 w-5 text-muted-foreground",
              isUploading && "animate-pulse",
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            hasError && "text-destructive",
          )}
        >
          {file.name}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {file.size !== null ? formatSize(file.size) : "Unknown size"}
          </p>
          {isUploading && (
            <span className="text-xs text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
          {hasError && file.error && (
            <span className="text-xs text-destructive">
              {String(file.error)}
            </span>
          )}
        </div>
        {isUploading && <Progress className="h-1 mt-2" value={percentage} />}
      </div>

      <Button
        className="h-8 w-8 shrink-0"
        loading={false}
        onClick={() => {
          uppy.uppy?.removeFile(file.id);
        }}
        size="icon"
        variant="ghost"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function InnerFileUpload<M extends Record<string, string>, B extends Body>({
  uppy,
  note,
  autoProceed,
  height,
  width,
  onComplete,
}: InnerFileUploadProps<M, B>) {
  const files = useUppyState(uppy, (state: State<M, B>) =>
    Object.values(state.files),
  );

  // Handle complete event
  useEffect(() => {
    if (!onComplete) {
      return undefined;
    }

    const handler = (result: UploadResult<M, B>) => {
      onComplete(result as UploadResult<M, Record<string, unknown>>);
    };

    uppy.on("complete", handler);

    return () => {
      uppy.off("complete", handler);
    };
  }, [onComplete, uppy]);

  const hasUploadingFiles = files.some(
    (f) => f.progress.uploadStarted && !f.progress.uploadComplete,
  );

  return (
    <div className="overflow-auto" style={{ maxHeight: height, width }}>
      <div className="space-y-4">
        <DropzoneArea />

        {note && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{note}</p>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <FileItem file={file} key={file.id} />
            ))}
          </div>
        )}

        {!autoProceed && files.length > 0 && (
          <Button
            className="w-full"
            disabled={hasUploadingFiles}
            loading={hasUploadingFiles}
            onClick={() => uppy.upload()}
          >
            Upload {files.length} file{files.length > 1 ? "s" : ""}
          </Button>
        )}
      </div>
    </div>
  );
}
