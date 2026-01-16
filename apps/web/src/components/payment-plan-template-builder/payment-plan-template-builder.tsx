/**
 * Payment Plan Template Builder
 *
 * A visual drag-and-drop builder for creating payment plan templates
 * with milestones and fee rules.
 */

"use client";

import type {
  FeeRuleFormData,
  MilestoneFormData,
  PaymentPlanTemplateConfig,
  PaymentPlanTemplateFormData,
} from "@repo/domain/payment-plans";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import { Input } from "@kompaniya/ui-common/components/input";
import { Label } from "@kompaniya/ui-common/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kompaniya/ui-common/components/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kompaniya/ui-common/components/tabs";
import { Textarea } from "@kompaniya/ui-common/components/textarea";
import {
  generateSchedule,
  validateTemplateConfig,
} from "@repo/shared/payment-plan";
import { useState } from "react";

import { FeeRulesBuilder } from "./fee-rules-builder";
import { MilestoneBuilder } from "./milestone-builder";
import { SchedulePreview } from "./schedule-preview";

export interface PaymentPlanTemplateBuilderProps {
  initialTemplate?: PaymentPlanTemplateFormData;
  onSave: (config: PaymentPlanTemplateConfig) => void;
  onCancel?: () => void;
}

export function PaymentPlanTemplateBuilder({
  initialTemplate,
  onSave,
  onCancel,
}: PaymentPlanTemplateBuilderProps) {
  const [activeTab, setActiveTab] = useState<
    "general" | "milestones" | "fee-rules" | "preview"
  >("general");

  const [template, setTemplate] = useState<PaymentPlanTemplateFormData>(
    initialTemplate || {
      name: "",
      code: "",
      description: "",
      defaultCurrency: "USD",
      subjectType: "real_estate_property",
      minPrincipal: undefined,
      maxPrincipal: undefined,
      isActive: true,
      milestones: [],
      feeRules: [],
    },
  );

  const [activeMilestone, setActiveMilestone] = useState<{
    index: number;
    data: MilestoneFormData;
  } | null>(null);

  const [activeFeeRule, setActiveFeeRule] = useState<{
    index: number;
    data: FeeRuleFormData;
  } | null>(null);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const mapIntervalConfig = (
    interval?: MilestoneFormData["recurringInterval"],
  ) => {
    switch (interval) {
      case "weekly":
        return { intervalUnit: "days" as const, intervalValue: 7 };
      case "yearly":
        return { intervalUnit: "months" as const, intervalValue: 12 };
      case "daily":
        return { intervalUnit: "days" as const, intervalValue: 1 };
      case "monthly":
      default:
        return { intervalUnit: "months" as const, intervalValue: 1 };
    }
  };

  const mapMilestoneToTemplate = (
    milestone: MilestoneFormData,
  ): PaymentPlanTemplateConfig["milestones"][number] => {
    const intervalConfig = mapIntervalConfig(milestone.recurringInterval);
    const isRecurring = milestone.schedulePatternType === "recurring";

    return {
      code: milestone.code,
      label: milestone.label,
      description: milestone.description,
      sequenceNumber: milestone.sequenceNumber,
      schedulePatternType: milestone.schedulePatternType,
      anchorType: milestone.anchorType,
      anchorEventType: milestone.anchorEventType ?? null,
      anchorOffsetDays: milestone.offsetDays ?? 0,
      anchorOffsetMonths: milestone.offsetMonths ?? 0,
      isAfterHandover: false,
      intervalUnit: isRecurring ? intervalConfig.intervalUnit : null,
      intervalValue: isRecurring ? intervalConfig.intervalValue : null,
      intervalOccurrences: isRecurring ? (milestone.recurringCount ?? 1) : null,
      intervalLabel: isRecurring
        ? (milestone.recurringInterval ?? "monthly")
        : null,
      amountMode: milestone.amountMode,
      amountValue: milestone.amountValue ?? 0,
      minAmount: milestone.minAmount ?? null,
      maxAmount: milestone.maxAmount ?? null,
      required: true,
      allowOverride: true,
      metadata: {},
    };
  };

  const mapFeeRuleToTemplate = (
    feeRule: FeeRuleFormData,
  ): PaymentPlanTemplateConfig["feeRules"][number] => ({
    code: feeRule.code,
    name: feeRule.name,
    description: feeRule.description,
    milestoneCode: feeRule.milestoneCode,
    triggerTiming: feeRule.triggerTiming,
    chargeScope: feeRule.chargeScope,
    calculationType: feeRule.calculationType,
    calculationBase: feeRule.calculationBase,
    rateValue: feeRule.rateValue,
    minAmount: feeRule.minAmount,
    maxAmount: feeRule.maxAmount,
    postingBehavior: feeRule.postToSeparateLineItem
      ? "separate_installment"
      : "include_in_same_installment",
    isRefundable: feeRule.refundable ?? false,
    metadata: {},
  });

  const handleSave = () => {
    // Validate
    const config: PaymentPlanTemplateConfig = {
      milestones: template.milestones.map(mapMilestoneToTemplate),
      feeRules: template.feeRules.map(mapFeeRuleToTemplate),
    };

    const validation = validateTemplateConfig(config);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    onSave(config);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = template.milestones.findIndex(
      (m) => m.code === active.id,
    );
    const overIndex = template.milestones.findIndex((m) => m.code === over.id);

    if (activeIndex === -1 || overIndex === -1) return;

    const newMilestones = [...template.milestones];
    const [moved] = newMilestones.splice(activeIndex, 1);
    newMilestones.splice(overIndex, 0, moved);

    // Update sequence numbers
    newMilestones.forEach((m, i) => {
      m.sequenceNumber = i + 1;
    });

    setTemplate({ ...template, milestones: newMilestones });
  };

  const handleDragStart = (_event: DragStartEvent) => {
    // Could be used to show drag preview
  };

  const updateTemplate = (updates: Partial<PaymentPlanTemplateFormData>) => {
    setTemplate((prev) => ({ ...prev, ...updates }));
    setValidationErrors([]);
  };

  const addMilestone = (milestone: MilestoneFormData) => {
    const newMilestones = [...template.milestones, milestone];
    newMilestones.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    setTemplate({ ...template, milestones: newMilestones });
    setActiveMilestone(null);
  };

  const updateMilestone = (index: number, milestone: MilestoneFormData) => {
    const newMilestones = [...template.milestones];
    newMilestones[index] = milestone;
    newMilestones.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    setTemplate({ ...template, milestones: newMilestones });
    setActiveMilestone(null);
  };

  const deleteMilestone = (index: number) => {
    const newMilestones = template.milestones.filter((_, i) => i !== index);
    setTemplate({ ...template, milestones: newMilestones });
    setActiveMilestone(null);
  };

  const addFeeRule = (feeRule: FeeRuleFormData) => {
    const newFeeRules = [...template.feeRules, feeRule];
    setTemplate({ ...template, feeRules: newFeeRules });
    setActiveFeeRule(null);
  };

  const updateFeeRule = (index: number, feeRule: FeeRuleFormData) => {
    const newFeeRules = [...template.feeRules];
    newFeeRules[index] = feeRule;
    setTemplate({ ...template, feeRules: newFeeRules });
    setActiveFeeRule(null);
  };

  const deleteFeeRule = (index: number) => {
    const newFeeRules = template.feeRules.filter((_, i) => i !== index);
    setTemplate({ ...template, feeRules: newFeeRules });
    setActiveFeeRule(null);
  };

  // Generate preview schedule
  const previewSchedule =
    template.milestones.length > 0
      ? generateSchedule({
          template: {
            milestones: template.milestones.map(mapMilestoneToTemplate),
            feeRules: template.feeRules.map(mapFeeRuleToTemplate),
          },
          principalAmount: 100000,
          currency: template.defaultCurrency,
          startDate: new Date().toISOString().split("T")[0],
          events: {},
        })
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Plan Template Builder</h2>
          <p className="text-muted-foreground">
            Configure payment milestones and fee rules for your payment plan
            template.
          </p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, i) => (
                <li className="text-sm text-destructive" key={i}>
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        value={activeTab}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="milestones">
            Milestones ({template.milestones.length})
          </TabsTrigger>
          <TabsTrigger value="fee-rules">
            Fee Rules ({template.feeRules.length})
          </TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent className="space-y-4" value="general">
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
              <CardDescription>
                Basic information about this payment plan template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    onChange={(e) => updateTemplate({ name: e.target.value })}
                    placeholder="e.g., 24-Month Installment Plan"
                    value={template.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-code">Code</Label>
                  <Input
                    id="template-code"
                    onChange={(e) =>
                      updateTemplate({
                        code: e.target.value.toUpperCase().replace(/\s/g, "_"),
                      })
                    }
                    placeholder="e.g., 24_MONTH_INSTALLMENT"
                    value={template.code}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  onChange={(e) =>
                    updateTemplate({ description: e.target.value })
                  }
                  placeholder="Describe when this template should be used..."
                  rows={3}
                  value={template.description}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-currency">Default Currency</Label>
                  <Select
                    onValueChange={(value) =>
                      updateTemplate({ defaultCurrency: value })
                    }
                    value={template.defaultCurrency}
                  >
                    <SelectTrigger id="template-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                      <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                      <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-principal">Min Principal</Label>
                  <Input
                    id="min-principal"
                    onChange={(e) =>
                      updateTemplate({
                        minPrincipal: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="No minimum"
                    type="number"
                    value={template.minPrincipal ?? ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-principal">Max Principal</Label>
                  <Input
                    id="max-principal"
                    onChange={(e) =>
                      updateTemplate({
                        maxPrincipal: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="No maximum"
                    type="number"
                    value={template.maxPrincipal ?? ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            sensors={sensors}
          >
            <MilestoneBuilder
              activeMilestone={activeMilestone}
              milestones={template.milestones}
              onAdd={addMilestone}
              onCloseMilestone={() => setActiveMilestone(null)}
              onDelete={deleteMilestone}
              onEdit={(index) =>
                setActiveMilestone({ index, data: template.milestones[index] })
              }
              onUpdate={updateMilestone}
            />
          </DndContext>
        </TabsContent>

        {/* Fee Rules */}
        <TabsContent value="fee-rules">
          <FeeRulesBuilder
            activeFeeRule={activeFeeRule}
            feeRules={template.feeRules}
            milestones={template.milestones}
            onAdd={addFeeRule}
            onCloseFeeRule={() => setActiveFeeRule(null)}
            onDelete={deleteFeeRule}
            onEdit={(index) =>
              setActiveFeeRule({ index, data: template.feeRules[index] })
            }
            onUpdate={updateFeeRule}
          />
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview">
          <SchedulePreview
            currency={template.defaultCurrency}
            schedule={previewSchedule}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
