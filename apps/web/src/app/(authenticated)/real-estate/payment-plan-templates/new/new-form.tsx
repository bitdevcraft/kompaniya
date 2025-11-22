"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/shared-ui/components/common/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/shared-ui/components/common/card";
import { Checkbox } from "@repo/shared-ui/components/common/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/shared-ui/components/common/form";
import { Input } from "@repo/shared-ui/components/common/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shared-ui/components/common/select";
import { Textarea } from "@repo/shared-ui/components/common/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";

import { authClient } from "@/lib/auth/client";

import { model, modelEndpoint } from "../config";

const coerceOptionalNumber = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (value === "" || value === null || typeof value === "undefined") {
      return undefined;
    }
    if (typeof value === "string" && value.trim() === "") return undefined;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
  }, schema);

const coerceNullableNumber = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (value === "" || value === null || typeof value === "undefined") {
      return null;
    }
    if (typeof value === "string" && value.trim() === "") return null;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? value : numeric;
  }, schema);

const milestoneSchema = z.object({
  code: z.string().min(1, "Code is required"),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  sequenceNumber: coerceOptionalNumber(z.number().int().min(1)),
  schedulePatternType: z.enum(["single", "recurring"]),
  anchorType: z.enum([
    "absolute_date",
    "relative_to_plan_start",
    "relative_to_event",
  ]),
  anchorEventType: z.string().nullable().optional(),
  anchorOffsetDays: coerceOptionalNumber(z.number().int().optional()),
  anchorOffsetMonths: coerceOptionalNumber(z.number().int().optional()),
  isAfterHandover: z.boolean().default(false),
  intervalUnit: z.enum(["days", "months"]).nullable().optional(),
  intervalValue: coerceNullableNumber(z.number().int().nullable().optional()),
  intervalOccurrences: coerceNullableNumber(
    z.number().int().nullable().optional(),
  ),
  intervalLabel: z
    .enum(["monthly", "quarterly", "semi_annual", "annual", "every_15_days"])
    .or(z.string())
    .nullable()
    .optional(),
  amountMode: z.enum([
    "percentage_of_principal",
    "percentage_of_remaining_principal",
    "fixed_amount",
    "formula",
  ]),
  amountValue: coerceOptionalNumber(z.number()),
  minAmount: coerceNullableNumber(z.number().nullable().optional()),
  maxAmount: coerceNullableNumber(z.number().nullable().optional()),
  required: z.boolean().default(true),
  allowOverride: z.boolean().default(true),
  metadata: z.record(z.any(), z.any()).optional(),
});

const feeRuleSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  milestoneCode: z.string().nullable().optional(),
  triggerTiming: z.enum([
    "on_plan_creation",
    "on_booking",
    "on_contract_signing",
    "on_handover",
    "on_milestone_due",
    "on_late",
    "on_payment",
  ]),
  chargeScope: z.enum(["plan", "milestone", "installment"]),
  calculationType: z.enum([
    "fixed",
    "percentage_of_principal",
    "percentage_of_installment",
    "percentage_of_outstanding",
  ]),
  calculationBase: z.enum([
    "principal",
    "installment_amount",
    "outstanding_principal",
    "custom",
  ]),
  rateValue: coerceOptionalNumber(z.number()),
  minAmount: coerceNullableNumber(z.number().nullable().optional()),
  maxAmount: coerceNullableNumber(z.number().nullable().optional()),
  postingBehavior: z.enum([
    "include_in_same_installment",
    "separate_installment",
    "accrued_only",
  ]),
  isRefundable: z.boolean().default(false),
  metadata: z.record(z.any(), z.any()).optional(),
});

const formSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  defaultCurrency: z
    .string()
    .length(3, "Currency must be a 3 letter code")
    .transform((value) => value.toUpperCase()),
  subjectType: z.string().optional(),
  minPrincipal: coerceNullableNumber(
    z.number().nonnegative().nullable().optional(),
  ),
  maxPrincipal: coerceNullableNumber(
    z.number().nonnegative().nullable().optional(),
  ),
  isActive: z.boolean().default(true),
  version: coerceOptionalNumber(z.number().int().min(1)).default(1),
  templateConfig: z.object({
    milestones: z
      .array(milestoneSchema)
      .min(1, "Add at least one milestone to the template"),
    feeRules: z.array(feeRuleSchema).default([]),
  }),
});

export type PaymentPlanTemplateFormValues = z.infer<typeof formSchema>;

const useSubmit = () => {
  return useMutation({
    mutationFn: async (payload: PaymentPlanTemplateFormValues) => {
      const res = await axios.post(`${modelEndpoint}`, payload, {
        withCredentials: true,
      });

      return res.data;
    },
  });
};

interface NewRecordFormProps {
  onFinish?: () => void;
}

export function NewRecordForm({ onFinish }: NewRecordFormProps) {
  const queryClient = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const defaultMilestone = useMemo<
    PaymentPlanTemplateFormValues["templateConfig"]["milestones"][number]
  >(
    () => ({
      code: "",
      label: "",
      description: "",
      sequenceNumber: 1,
      schedulePatternType: "single",
      anchorType: "relative_to_plan_start",
      anchorEventType: null,
      anchorOffsetDays: 0,
      anchorOffsetMonths: 0,
      isAfterHandover: false,
      intervalUnit: null,
      intervalValue: null,
      intervalOccurrences: null,
      intervalLabel: null,
      amountMode: "percentage_of_principal",
      amountValue: 0,
      minAmount: null,
      maxAmount: null,
      required: true,
      allowOverride: true,
      metadata: {},
    }),
    [],
  );

  const defaultFeeRule = useMemo<
    PaymentPlanTemplateFormValues["templateConfig"]["feeRules"][number]
  >(
    () => ({
      code: "",
      name: "",
      description: "",
      milestoneCode: null,
      triggerTiming: "on_plan_creation",
      chargeScope: "plan",
      calculationType: "fixed",
      calculationBase: "principal",
      rateValue: 0,
      minAmount: null,
      maxAmount: null,
      postingBehavior: "include_in_same_installment",
      isRefundable: false,
      metadata: {},
    }),
    [],
  );

  const form = useForm<PaymentPlanTemplateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      defaultCurrency: "USD",
      subjectType: "real_estate_unit",
      minPrincipal: null,
      maxPrincipal: null,
      isActive: true,
      version: 1,
      templateConfig: {
        milestones: [defaultMilestone],
        feeRules: [],
      },
    },
  });

  const milestoneFields = useFieldArray({
    control: form.control,
    name: "templateConfig.milestones",
  });

  const feeRuleFields = useFieldArray({
    control: form.control,
    name: "templateConfig.feeRules",
  });

  const submit = useSubmit();

  const sanitizePayload = (
    values: PaymentPlanTemplateFormValues,
  ): PaymentPlanTemplateFormValues => {
    return {
      ...values,
      templateConfig: {
        milestones: values.templateConfig.milestones.map((milestone) => ({
          ...milestone,
          anchorEventType: milestone.anchorEventType ?? null,
          anchorOffsetDays: milestone.anchorOffsetDays ?? 0,
          anchorOffsetMonths: milestone.anchorOffsetMonths ?? 0,
          intervalUnit: milestone.intervalUnit ?? null,
          intervalValue: milestone.intervalValue ?? null,
          intervalOccurrences: milestone.intervalOccurrences ?? null,
          intervalLabel: milestone.intervalLabel ?? null,
          minAmount: milestone.minAmount ?? null,
          maxAmount: milestone.maxAmount ?? null,
          isAfterHandover: milestone.isAfterHandover ?? false,
          required: milestone.required ?? true,
          allowOverride: milestone.allowOverride ?? true,
          metadata: milestone.metadata ?? {},
        })),
        feeRules: values.templateConfig.feeRules.map((fee) => ({
          ...fee,
          milestoneCode: fee.milestoneCode ?? null,
          minAmount: fee.minAmount ?? null,
          maxAmount: fee.maxAmount ?? null,
          metadata: fee.metadata ?? {},
          isRefundable: fee.isRefundable ?? false,
        })),
      },
    };
  };

  const onSubmit = (data: PaymentPlanTemplateFormValues) => {
    const payload = sanitizePayload(data);

    submit.mutate(payload, {
      onSuccess: () => {
        if (onFinish) onFinish();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || error.message;
          form.setError("code", {
            type: "custom",
            message,
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [`${model.plural}-${activeOrganization?.id}`],
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Template details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="BOOKING_PLAN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Booking linked plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe where this template should be used"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="defaultCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default currency</FormLabel>
                    <FormControl>
                      <Input
                        maxLength={3}
                        placeholder="USD"
                        {...field}
                        onChange={(event) =>
                          field.onChange(event.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      3 letter ISO currency code.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subjectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject type</FormLabel>
                    <FormControl>
                      <Input placeholder="real_estate_unit" {...field} />
                    </FormControl>
                    <FormDescription>
                      Entity type the plan applies to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input
                        min={1}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value),
                          )
                        }
                        type="number"
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : field.value
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minPrincipal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum principal</FormLabel>
                    <FormControl>
                      <Input
                        min={0}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                        type="number"
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : field.value
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Optional lower principal bound.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxPrincipal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum principal</FormLabel>
                    <FormControl>
                      <Input
                        min={0}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                          )
                        }
                        type="number"
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : field.value
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Optional upper principal bound.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Inactive templates remain hidden from selection.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) => field.onChange(!!value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Milestones</CardTitle>
              <Button
                onClick={() => milestoneFields.append(defaultMilestone)}
                size="sm"
                type="button"
                variant="outline"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestoneFields.fields.map((fieldItem, index) => (
              <Card className="border-dashed" key={fieldItem.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">
                    Milestone {index + 1}
                  </CardTitle>
                  {milestoneFields.fields.length > 1 && (
                    <Button
                      aria-label="Remove milestone"
                      onClick={() => milestoneFields.remove(index)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code</FormLabel>
                          <FormControl>
                            <Input placeholder="BOOKING_15D" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="15 days after booking"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`templateConfig.milestones.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explain when this milestone triggers"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.sequenceNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sequence</FormLabel>
                          <FormControl>
                            <Input
                              min={1}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? undefined
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormDescription>Order of execution.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.schedulePatternType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pattern</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pattern" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="recurring">
                                Recurring
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.anchorType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anchor</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select anchor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="absolute_date">
                                Absolute date
                              </SelectItem>
                              <SelectItem value="relative_to_plan_start">
                                Relative to plan start
                              </SelectItem>
                              <SelectItem value="relative_to_event">
                                Relative to event
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.anchorEventType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anchor event</FormLabel>
                          <FormControl>
                            <Input placeholder="booking" {...field} />
                          </FormControl>
                          <FormDescription>
                            Optional event code.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.anchorOffsetDays`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offset (days)</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? undefined
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.anchorOffsetMonths`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offset (months)</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? undefined
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.amountMode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount mode</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage_of_principal">
                                % of principal
                              </SelectItem>
                              <SelectItem value="percentage_of_remaining_principal">
                                % of remaining principal
                              </SelectItem>
                              <SelectItem value="fixed_amount">
                                Fixed amount
                              </SelectItem>
                              <SelectItem value="formula">Formula</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.amountValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount value</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? undefined
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.intervalUnit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interval unit</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(value || null)
                            }
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Optional" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Leave empty for non-recurring patterns.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.intervalValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interval value</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.intervalOccurrences`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occurrences</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.intervalLabel`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interval label</FormLabel>
                          <FormControl>
                            <Input placeholder="monthly" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.minAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum amount</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.maxAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum amount</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Required</FormLabel>
                            <FormDescription>
                              Must be paid before plan completion.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(value) =>
                                field.onChange(!!value)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.allowOverride`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Allow override</FormLabel>
                            <FormDescription>
                              Permit adjustments on plan creation.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(value) =>
                                field.onChange(!!value)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.milestones.${index}.isAfterHandover`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>After handover</FormLabel>
                            <FormDescription>
                              Marks milestones occurring post-handover.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(value) =>
                                field.onChange(!!value)
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fees</CardTitle>
              <Button
                onClick={() => feeRuleFields.append(defaultFeeRule)}
                size="sm"
                type="button"
                variant="outline"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add fee rule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {feeRuleFields.fields.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No fees added yet.
              </div>
            )}
            {feeRuleFields.fields.map((fieldItem, index) => (
              <Card className="border-dashed" key={fieldItem.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Fee {index + 1}</CardTitle>
                  <Button
                    aria-label="Remove fee"
                    onClick={() => feeRuleFields.remove(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.code`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code</FormLabel>
                          <FormControl>
                            <Input placeholder="ADMIN_FEE" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Administration fee"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`templateConfig.feeRules.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe this fee"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.triggerTiming`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trigger timing</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timing" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="on_plan_creation">
                                On plan creation
                              </SelectItem>
                              <SelectItem value="on_booking">
                                On booking
                              </SelectItem>
                              <SelectItem value="on_contract_signing">
                                On contract signing
                              </SelectItem>
                              <SelectItem value="on_handover">
                                On handover
                              </SelectItem>
                              <SelectItem value="on_milestone_due">
                                On milestone due
                              </SelectItem>
                              <SelectItem value="on_late">On late</SelectItem>
                              <SelectItem value="on_payment">
                                On payment
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.chargeScope`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Charge scope</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select scope" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="plan">Plan</SelectItem>
                              <SelectItem value="milestone">
                                Milestone
                              </SelectItem>
                              <SelectItem value="installment">
                                Installment
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.postingBehavior`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posting</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select behavior" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="include_in_same_installment">
                                Include in same installment
                              </SelectItem>
                              <SelectItem value="separate_installment">
                                Separate installment
                              </SelectItem>
                              <SelectItem value="accrued_only">
                                Accrued only
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.calculationType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calculation type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="percentage_of_principal">
                                % of principal
                              </SelectItem>
                              <SelectItem value="percentage_of_installment">
                                % of installment
                              </SelectItem>
                              <SelectItem value="percentage_of_outstanding">
                                % of outstanding
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.calculationBase`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calculation base</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select base" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="principal">
                                Principal
                              </SelectItem>
                              <SelectItem value="installment_amount">
                                Installment amount
                              </SelectItem>
                              <SelectItem value="outstanding_principal">
                                Outstanding principal
                              </SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.rateValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate value</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? undefined
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.minAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum amount</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`templateConfig.feeRules.${index}.maxAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum amount</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                                )
                              }
                              type="number"
                              value={
                                field.value === undefined ||
                                field.value === null
                                  ? ""
                                  : field.value
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`templateConfig.feeRules.${index}.milestoneCode`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked milestone code</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`templateConfig.feeRules.${index}.isRefundable`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Refundable</FormLabel>
                          <FormDescription>
                            Indicates whether the fee can be refunded.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(value) => field.onChange(!!value)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="flex w-full justify-end gap-2">
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
            ) : (
              <>Save template</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
