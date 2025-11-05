"use client";

import Editor, { type EditorProps } from "@monaco-editor/react";
import { cn } from "@repo/shared-ui/lib/utils";
import * as React from "react";
import {
  type Control,
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

export type HtmlEditorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  /**
   * The react-hook-form control instance.
   */
  control: Control<TFieldValues>;
  /**
   * The form field name that should be connected with the editor.
   */
  name: TName;
  /**
   * Optional default value used when the form field is uninitialized.
   */
  defaultValue?: string;
  /**
   * Additional class name applied to the outer wrapper element.
   */
  className?: string;
  /**
   * Class name applied to the Monaco editor container.
   */
  editorClassName?: string;
  /**
   * Editor height. Falls back to 320px when not provided.
   */
  height?: EditorProps["height"];
  /**
   * Callback fired whenever the editor value changes.
   */
  onValueChange?: (value: string) => void;
  /**
   * Additional Monaco editor options.
   */
  options?: EditorProps["options"];
  /**
   * Called after the editor has been mounted.
   */
  onMount?: EditorProps["onMount"];
  /**
   * Additional change handler that receives Monaco's native event payload.
   */
  onEditorChange?: EditorProps["onChange"];
} & Omit<
  EditorProps,
  | "value"
  | "defaultValue"
  | "defaultLanguage"
  | "language"
  | "height"
  | "className"
  | "onChange"
  | "options"
  | "onMount"
>;

/**
 * A reusable Monaco-based HTML editor that works seamlessly with react-hook-form.
 */
export function HtmlEditor<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  defaultValue,
  className,
  editorClassName,
  height = 320,
  onValueChange,
  options,
  onMount,
  onEditorChange,
  ...editorProps
}: HtmlEditorProps<TFieldValues, TName>) {
  const mergedOptions = React.useMemo(() => {
    return {
      ...options,
      wordWrap: options?.wordWrap ?? "on",
      minimap: {
        enabled: options?.minimap?.enabled ?? false,
        ...(options?.minimap ?? {}),
      },
      scrollBeyondLastLine: options?.scrollBeyondLastLine ?? false,
    } satisfies EditorProps["options"];
  }, [options]);

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <Controller
        control={control}
        defaultValue={
          (defaultValue ?? "") as ControllerProps<
            TFieldValues,
            TName
          >["defaultValue"]
        }
        name={name}
        render={({ field }) => (
          <Editor
            {...editorProps}
            className={editorClassName}
            height={height}
            language="html"
            onChange={(value, event) => {
              const nextValue = value ?? "";
              field.onChange(nextValue);
              onValueChange?.(nextValue);
              onEditorChange?.(value, event);
            }}
            onMount={(editorInstance, monaco) => {
              const domNode = editorInstance.getDomNode();
              if (domNode) {
                field.ref(domNode as unknown as HTMLTextAreaElement);
              }
              const blurDisposable = editorInstance.onDidBlurEditorText(() => {
                field.onBlur();
              });
              const blurWidgetDisposable = editorInstance.onDidBlurEditorWidget(
                () => {
                  field.onBlur();
                },
              );
              editorInstance.onDidDispose(() => {
                blurDisposable.dispose();
                blurWidgetDisposable.dispose();
              });
              onMount?.(editorInstance, monaco);
            }}
            options={mergedOptions}
            theme={"vs-dark"}
            value={(field.value as string | undefined) ?? ""}
          />
        )}
      />
    </div>
  );
}
