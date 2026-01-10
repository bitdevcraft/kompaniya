"use client";

import type { CustomFieldDefinition } from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import { Checkbox } from "@kompaniya/ui-common/components/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kompaniya/ui-common/components/form";
import { Input } from "@kompaniya/ui-common/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kompaniya/ui-common/components/select";
import { Textarea } from "@kompaniya/ui-common/components/textarea";
import { ENTITY_REFERENCE_CONFIGS } from "@repo/domain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React from "react";
import { Resolver, SubmitHandler, useForm, useWatch } from "react-hook-form";
import z from "zod";

import { env } from "@/env/client";

const fieldTypeOptions = [
  { value: "string", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "Date & Time" },
  { value: "single_select", label: "Single Select" },
  { value: "multi_select", label: "Multi Select" },
  { value: "json", label: "JSON" },
  { value: "reference", label: "Reference" },
] as const;

type FieldType = (typeof fieldTypeOptions)[number]["value"];

const fieldTypeValues = fieldTypeOptions.map((option) => option.value) as [
  FieldType,
  ...FieldType[],
];

const FormSchema = z
  .object({
    label: z.string().min(1, "Label is required"),
    key: z.string().regex(/^[a-zA-Z0-9_-]{1,50}$/, {
      message:
        "Key must be alphanumeric with underscores or hyphens (1-50 chars)",
    }),
    description: z.string().optional(),
    fieldType: z.enum(fieldTypeValues),
    isRequired: z.boolean().default(false),
    isIndexed: z.boolean().default(false),
    choices: z.string().optional(),
    referenceEntityType: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (isSelectType(data.fieldType)) {
      const choices = parseChoices(data.choices);
      if (choices.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["choices"],
          message: "Choices are required for select fields.",
        });
      }
    }
    if (data.fieldType === "reference" && !data.referenceEntityType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["referenceEntityType"],
        message: "Target entity is required for reference fields.",
      });
    }
  });

type CreatePayload = {
  entityType: string;
  key: string;
  label: string;
  description?: string;
  fieldType: FieldType;
  isRequired: boolean;
  isIndexed: boolean;
  choices?: { label: string; value: string }[];
  referenceConfig?: { targetType: string };
};

interface CustomFieldDefinitionFormProps {
  entityType: string;
  mode: FormMode;
  definition?: CustomFieldDefinition;
  onFinish?: () => void;
}

type FormMode = "create" | "edit";

type FormValue = z.output<typeof FormSchema>;

type UpdatePayload = Omit<CreatePayload, "entityType" | "key">;

const useSubmit = (mode: FormMode, definition?: CustomFieldDefinition) => {
  return useMutation({
    mutationFn: async (payload: CreatePayload | UpdatePayload) => {
      const endpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/custom-fields/definitions`;

      if (mode === "edit") {
        const res = await axios.patch(
          `${endpoint}/${definition?.id}`,
          payload,
          {
            withCredentials: true,
          },
        );
        return res.data;
      }

      const res = await axios.post(endpoint, payload, {
        withCredentials: true,
      });

      return res.data;
    },
  });
};

export function CustomFieldDefinitionForm({
  entityType,
  mode,
  definition,
  onFinish,
}: CustomFieldDefinitionFormProps) {
  const queryClient = useQueryClient();
  const submit = useSubmit(mode, definition);

  const form = useForm<FormValue>({
    resolver: zodResolver(FormSchema) as Resolver<FormValue>,
    defaultValues: getDefaultValues(definition),
  });

  React.useEffect(() => {
    form.reset(getDefaultValues(definition));
  }, [definition, form]);

  const fieldType = useWatch({
    control: form.control,
    name: "fieldType",
  });

  React.useEffect(() => {
    if (!isSelectType(fieldType)) {
      form.setValue("choices", "");
    }
    if (fieldType !== "reference") {
      form.setValue("referenceEntityType", "");
    }
  }, [fieldType, form]);

  const onSubmit: SubmitHandler<FormValue> = (data) => {
    const payload = buildPayload(data, entityType, mode);

    submit.mutate(payload, {
      onSuccess: () => {
        if (onFinish) onFinish();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          form.setError("label", {
            type: "custom",
            message: error.response?.data?.message || error.message,
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["custom-field-definitions", entityType],
        });
      },
    });
  };

  return (
    <Form<FormValue> {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input placeholder="Customer ID" {...field} />
                </FormControl>
                <FormDescription>Display name shown in the UI.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key</FormLabel>
                <FormControl>
                  <Input
                    placeholder="customer_id"
                    {...field}
                    disabled={mode === "edit"}
                  />
                </FormControl>
                <FormDescription>
                  Used in the API. Letters, numbers, underscores, or hyphens.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe how this field is used."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fieldType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field Type</FormLabel>
                <Select
                  disabled={mode === "edit"}
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a field type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fieldTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isSelectType(fieldType) && (
            <FormField
              control={form.control}
              name="choices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choices</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="One option per line"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the options users can choose from.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {fieldType === "reference" && (
            <FormField
              control={form.control}
              name="referenceEntityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Entity</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the entity to reference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENTITY_REFERENCE_CONFIGS.map((config) => (
                        <SelectItem
                          key={config.entityType}
                          value={config.entityType}
                        >
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The entity type that this field will reference.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="isRequired"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-lg border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) =>
                        field.onChange(Boolean(value))
                      }
                    />
                  </FormControl>
                  <div>
                    <FormLabel>Required</FormLabel>
                    <FormDescription>
                      Must be set before saving a record.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isIndexed"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 rounded-lg border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) =>
                        field.onChange(Boolean(value))
                      }
                    />
                  </FormControl>
                  <div>
                    <FormLabel>Indexed</FormLabel>
                    <FormDescription>
                      Use for fields that you filter on often.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex w-full justify-end gap-2 pt-6">
          <Button
            className="w-full md:w-auto"
            disabled={submit.isPending}
            onClick={onFinish}
            type="button"
            variant={"outline"}
          >
            Cancel
          </Button>
          <Button
            className="w-full md:w-auto"
            disabled={submit.isPending}
            type="submit"
          >
            {submit.isPending ? (
              <Loader2 className="animate-spin" />
            ) : mode === "edit" ? (
              <>Update</>
            ) : (
              <>Create</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function buildPayload(
  data: FormValue,
  entityType: string,
  mode: FormMode,
): CreatePayload | UpdatePayload {
  const choices = isSelectType(data.fieldType)
    ? parseChoices(data.choices)
    : undefined;

  const basePayload = {
    label: data.label.trim(),
    description: data.description?.trim() || undefined,
    fieldType: data.fieldType,
    isRequired: data.isRequired,
    isIndexed: data.isIndexed,
    choices: choices && choices.length > 0 ? choices : undefined,
    referenceConfig:
      data.fieldType === "reference" && data.referenceEntityType
        ? { targetType: data.referenceEntityType }
        : undefined,
  };

  if (mode === "edit") {
    return basePayload;
  }

  return {
    ...basePayload,
    entityType,
    key: data.key.trim(),
  };
}

function getDefaultValues(definition?: CustomFieldDefinition) {
  return {
    label: definition?.label ?? "",
    key: definition?.key ?? "",
    description: definition?.description ?? "",
    fieldType: (definition?.fieldType as FieldType) ?? "string",
    isRequired: definition?.isRequired ?? false,
    isIndexed: definition?.isIndexed ?? false,
    choices:
      definition?.choices?.map((choice) => choice.label).join("\n") ?? "",
    referenceEntityType:
      (definition?.referenceConfig as { targetType?: string })?.targetType ??
      "",
  };
}

function isSelectType(fieldType: FieldType) {
  return fieldType === "single_select" || fieldType === "multi_select";
}

function parseChoices(input?: string) {
  if (!input) return [];

  return input
    .split(/\r?\n/u)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => ({ label: value, value }));
}
