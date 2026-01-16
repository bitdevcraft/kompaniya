/**
 * Payment Plan Instance Form
 *
 * Form for creating a payment plan from a template.
 */

/* eslint-disable react-hooks/incompatible-library */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
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
import { Label } from "@kompaniya/ui-common/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kompaniya/ui-common/components/select";
import { generateSchedule } from "@repo/shared/payment-plan";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";

const formSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
  name: z.string().min(1, "Name is required"),
  principalAmount: z
    .number()
    .min(0.01, "Principal amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  startDate: z.string().min(1, "Start date is required"),
  bookingDate: z.string().optional(),
  contractSigningDate: z.string().optional(),
  handoverDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentPlanInstanceFormProps {
  onFinish?: () => void;
  bookingId?: string;
  initialPrincipalAmount?: number;
  initialCurrency?: string;
}

interface PaymentPlanTemplate {
  id: string;
  name: string;
  code: string;
  defaultCurrency: string;
  minPrincipal?: string;
  maxPrincipal?: string;
  templateConfig: {
    milestones: Array<{
      code: string;
      label: string;
      description?: string;
      sequenceNumber: number;
      schedulePatternType: "single" | "recurring";
      anchorType:
        | "absolute_date"
        | "relative_to_plan_start"
        | "relative_to_event";
      anchorEventType?: string;
      anchorOffsetDays?: number;
      anchorOffsetMonths?: number;
      intervalUnit?: "days" | "months";
      intervalValue?: number;
      intervalOccurrences?: number;
      amountMode: string;
      amountValue: number;
      minAmount?: number;
      maxAmount?: number;
    }>;
    feeRules: Array<{
      code: string;
      name: string;
      description?: string;
      milestoneCode?: string;
      triggerTiming: string;
      chargeScope: string;
      calculationType: string;
      calculationBase: string;
      rateValue: number;
      minAmount?: number;
      maxAmount?: number;
      postingBehavior: string;
      isRefundable: boolean;
    }>;
  };
}

export function PaymentPlanInstanceForm({
  onFinish,
  bookingId,
  initialPrincipalAmount,
  initialCurrency,
}: PaymentPlanInstanceFormProps) {
  const queryClient = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: "",
      name: "",
      principalAmount: initialPrincipalAmount || 0,
      currency: initialCurrency || "USD",
      startDate: new Date().toISOString().split("T")[0],
      bookingDate: "",
      contractSigningDate: "",
      handoverDate: "",
    },
  });

  const selectedTemplateId = useWatch({
    control: form.control,
    name: "templateId",
  });

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["payment-plan-templates", activeOrganization?.id],
    queryFn: async () => {
      const res = await axios.get(
        `/api/organization/payment-plan-template/paginated?organizationId=${activeOrganization?.id}`,
      );
      return res.data.data || [];
    },
    enabled: !!activeOrganization?.id,
  });

  const selectedTemplate = templates?.find(
    (t: PaymentPlanTemplate) => t.id === selectedTemplateId,
  );

  // Update form when template is selected
  React.useEffect(() => {
    if (selectedTemplate) {
      form.setValue("currency", selectedTemplate.defaultCurrency);
      form.setValue(
        "name",
        `${selectedTemplate.name} - ${format(new Date(), "MMM dd, yyyy")}`,
      );

      if (selectedTemplate.minPrincipal) {
        // Validation could be added here for minimum principal amount
      }
    }
  }, [selectedTemplate, form]);

  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const template = templates?.find(
        (t: PaymentPlanTemplate) => t.id === values.templateId,
      );
      if (!template) throw new Error("Template not found");

      // Generate schedule from template
      const scheduleResult = generateSchedule({
        template: template.templateConfig,
        principalAmount: values.principalAmount,
        currency: values.currency,
        startDate: values.startDate,
        events: {
          bookingDate: values.bookingDate || null,
          contractSigningDate: values.contractSigningDate || null,
          handoverDate: values.handoverDate || null,
        },
      });

      // Create payment plan with generated schedule
      const payload = {
        name: values.name,
        templateId: values.templateId,
        currency: values.currency,
        principalAmount: values.principalAmount,
        startDate: values.startDate,
        status: "active",
        instanceConfig: {
          events: {
            bookingDate: values.bookingDate || null,
            contractSigningDate: values.contractSigningDate || null,
            handoverDate: values.handoverDate || null,
          },
          scheduleItems: scheduleResult.scheduleItems,
        },
      };

      const res = await axios.post("/api/organization/payment-plan", payload);
      return res.data;
    },
    onSuccess: async (data) => {
      const createdPlan = Array.isArray(data) ? data[0] : data;

      // If bookingId is provided, link the payment plan to the booking
      if (bookingId && createdPlan?.id) {
        try {
          await axios.patch(
            `/api/organization/real-estate-booking/r/${bookingId}`,
            {
              paymentPlanId: createdPlan.id,
            },
          );
        } catch (error) {
          console.error("Error linking booking to payment plan:", error);
        }
      }

      queryClient.invalidateQueries({
        queryKey: [`org_payment_plans-${activeOrganization?.id}`],
      });

      if (onFinish) onFinish();
    },
    onError: (error) => {
      console.error("Error creating payment plan:", error);
    },
  });

  const onSubmit = (values: FormValues) => {
    submitMutation.mutate(values);
  };

  // Preview schedule
  const previewSchedule =
    selectedTemplate && form.watch("principalAmount") > 0
      ? generateSchedule({
          template: selectedTemplate.templateConfig,
          principalAmount: form.watch("principalAmount"),
          currency: form.watch("currency"),
          startDate: form.watch("startDate"),
          events: {
            bookingDate: form.watch("bookingDate") || null,
            contractSigningDate: form.watch("contractSigningDate") || null,
            handoverDate: form.watch("handoverDate") || null,
          },
        })
      : null;

  const formatCurrency = (amount: number, currencyCode?: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode ?? form.getValues("currency"),
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Template</CardTitle>
              <CardDescription>
                Choose a payment plan template to base this plan on.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates?.map((template: PaymentPlanTemplate) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}{" "}
                              <span className="text-muted-foreground">
                                ({template.code})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedTemplate && (
                          <>
                            Currency: {selectedTemplate.defaultCurrency}
                            {selectedTemplate.minPrincipal &&
                              ` • Min: ${formatCurrency(Number(selectedTemplate.minPrincipal))}`}
                            {selectedTemplate.maxPrincipal &&
                              ` • Max: ${formatCurrency(Number(selectedTemplate.maxPrincipal))}`}
                          </>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Plan Details */}
          {selectedTemplate && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Plan Details</CardTitle>
                  <CardDescription>
                    Configure the details of this payment plan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="principalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Principal Amount</FormLabel>
                          <FormControl>
                            <Input
                              step="0.01"
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            {selectedTemplate.minPrincipal &&
                              `Min: ${selectedTemplate.minPrincipal}`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select
                            disabled
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="PHP">PHP</SelectItem>
                              <SelectItem value="AED">AED</SelectItem>
                              <SelectItem value="SAR">SAR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Event Dates */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Dates</CardTitle>
                  <CardDescription>
                    Configure key event dates. These may affect payment
                    scheduling depending on the template.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="booking-date">Booking Date</Label>
                      <Input
                        id="booking-date"
                        onChange={(e) =>
                          form.setValue("bookingDate", e.target.value)
                        }
                        type="date"
                        value={form.watch("bookingDate")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contract-date">
                        Contract Signing Date
                      </Label>
                      <Input
                        id="contract-date"
                        onChange={(e) =>
                          form.setValue("contractSigningDate", e.target.value)
                        }
                        type="date"
                        value={form.watch("contractSigningDate")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="handover-date">Handover Date</Label>
                      <Input
                        id="handover-date"
                        onChange={(e) =>
                          form.setValue("handoverDate", e.target.value)
                        }
                        type="date"
                        value={form.watch("handoverDate")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Preview */}
              {previewSchedule && (
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Preview</CardTitle>
                    <CardDescription>
                      This is the payment schedule that will be generated.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Total Principal
                          </div>
                          <div className="text-xl font-semibold">
                            {formatCurrency(previewSchedule.totalPrincipal)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Total Fees
                          </div>
                          <div className="text-xl font-semibold">
                            {formatCurrency(previewSchedule.totalFees)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Total Amount
                          </div>
                          <div className="text-xl font-semibold">
                            {formatCurrency(previewSchedule.totalAmount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Payments
                          </div>
                          <div className="text-xl font-semibold">
                            {previewSchedule.scheduleItems.length}
                          </div>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-2 text-sm font-medium">
                                #
                              </th>
                              <th className="text-left p-2 text-sm font-medium">
                                Due Date
                              </th>
                              <th className="text-right p-2 text-sm font-medium">
                                Principal
                              </th>
                              <th className="text-right p-2 text-sm font-medium">
                                Fees
                              </th>
                              <th className="text-right p-2 text-sm font-medium">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewSchedule.scheduleItems.map(
                              (item, index) => (
                                <tr className="border-t" key={item.id || index}>
                                  <td className="p-2 text-sm">{index + 1}</td>
                                  <td className="p-2 text-sm">
                                    {item.dueDate
                                      ? new Date(
                                          item.dueDate,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })
                                      : "-"}
                                  </td>
                                  <td className="p-2 text-sm text-right">
                                    {formatCurrency(item.principalDue)}
                                  </td>
                                  <td className="p-2 text-sm text-right">
                                    {formatCurrency(item.feesDue)}
                                  </td>
                                  <td className="p-2 text-sm text-right font-medium">
                                    {formatCurrency(item.amountDue)}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button onClick={onFinish} type="button" variant="outline">
                  Cancel
                </Button>
                <Button disabled={submitMutation.isPending} type="submit">
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Payment Plan"
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}
