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
> =
  | ControlledHtmlEditorProps<TFieldValues, TName>
  | UncontrolledHtmlEditorProps;

type BaseHtmlEditorProps = {
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
  /**
   * Optional blur handler fired when the editor loses focus.
   */
  onBlur?: () => void;
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

type ControlledHtmlEditorProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = BaseHtmlEditorProps & {
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
  value?: never;
};

type UncontrolledHtmlEditorProps = BaseHtmlEditorProps & {
  control?: undefined;
  name?: undefined;
  defaultValue?: string;
  value?: string;
};

export function HtmlEditor<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: HtmlEditorProps<TFieldValues, TName>) {
  const {
    className,
    editorClassName,
    height = 320,
    onValueChange,
    options,
    onMount,
    onEditorChange,
    onBlur,
    defaultValue,
    ...editorProps
  } = props;
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

  const handleMount: EditorProps["onMount"] = (editorInstance, monaco) => {
    const blurDisposable = editorInstance.onDidBlurEditorText(() => {
      onBlur?.();
    });
    const blurWidgetDisposable = editorInstance.onDidBlurEditorWidget(() => {
      onBlur?.();
    });
    editorInstance.onDidDispose(() => {
      blurDisposable.dispose();
      blurWidgetDisposable.dispose();
    });
    onMount?.(editorInstance, monaco);
  };

  if (isControlledHtmlEditorProps(props)) {
    return (
      <div className={cn("flex w-full flex-col", className)}>
        <Controller
          control={props.control}
          defaultValue={
            (defaultValue ?? "") as ControllerProps<
              TFieldValues,
              TName
            >["defaultValue"]
          }
          name={props.name}
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
                const blurDisposable = editorInstance.onDidBlurEditorText(
                  () => {
                    field.onBlur();
                    onBlur?.();
                  },
                );
                const blurWidgetDisposable =
                  editorInstance.onDidBlurEditorWidget(() => {
                    field.onBlur();
                    onBlur?.();
                  });
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

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <Editor
        {...editorProps}
        className={editorClassName}
        height={height}
        language="html"
        onChange={(value, event) => {
          const nextValue = value ?? "";
          props.onValueChange?.(nextValue);
          onEditorChange?.(value, event);
        }}
        onMount={(editorInstance, monaco) => {
          handleMount(editorInstance, monaco);
        }}
        options={mergedOptions}
        theme={"vs-dark"}
        value={props.value ?? defaultValue ?? ""}
      />
    </div>
  );
}

/**
 * A reusable Monaco-based HTML editor that works seamlessly with react-hook-form.
 */
function isControlledHtmlEditorProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(
  props: HtmlEditorProps<TFieldValues, TName>,
): props is ControlledHtmlEditorProps<TFieldValues, TName> {
  return (
    typeof (props as ControlledHtmlEditorProps<TFieldValues, TName>).control !==
    "undefined"
  );
}
