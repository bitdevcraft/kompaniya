/**
 * Fee Rules Builder Component
 *
 * Manages fee rules for additional charges on payments.
 */

"use client";

import type {
  FeeRuleFormData,
  MilestoneFormData,
} from "@repo/domain/payment-plans";

import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@kompaniya/ui-common/components/dialog";
import { Input } from "@kompaniya/ui-common/components/input";
import { Label } from "@kompaniya/ui-common/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kompaniya/ui-common/components/select";
import { Switch } from "@kompaniya/ui-common/components/switch";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export interface FeeRulesBuilderProps {
  feeRules: FeeRuleFormData[];
  milestones: MilestoneFormData[];
  onAdd: (feeRule: FeeRuleFormData) => void;
  onUpdate: (index: number, feeRule: FeeRuleFormData) => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  activeFeeRule: { index: number; data: FeeRuleFormData } | null;
  onCloseFeeRule: () => void;
}

interface FeeRuleCardProps {
  feeRule: FeeRuleFormData;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

interface FeeRuleFormProps {
  feeRule?: FeeRuleFormData;
  milestones: MilestoneFormData[];
  existingCodes: string[];
  onSave: (feeRule: FeeRuleFormData) => void;
  onCancel: () => void;
}

export function FeeRulesBuilder({
  feeRules,
  milestones,
  onAdd,
  onUpdate,
  onDelete,
  onEdit,
  activeFeeRule,
  onCloseFeeRule,
}: FeeRulesBuilderProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formResetCounter, setFormResetCounter] = useState(0);

  const existingCodes = feeRules.map((f) => f.code);
  const formKey = activeFeeRule
    ? `edit-${activeFeeRule.index}`
    : `new-${formResetCounter}`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fee Rules</CardTitle>
              <CardDescription>
                Configure additional fees and charges that apply to payments.
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setFormResetCounter((value) => value + 1);
                setShowAddDialog(true);
              }}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {feeRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fee rules yet. Add additional charges like admin fees or taxes.
            </div>
          ) : (
            <div className="space-y-2">
              {feeRules.map((feeRule, index) => (
                <FeeRuleCard
                  feeRule={feeRule}
                  index={index}
                  key={feeRule.code}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            onCloseFeeRule();
          }
        }}
        open={showAddDialog || activeFeeRule !== null}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeFeeRule ? "Edit Fee Rule" : "Add Fee Rule"}
            </DialogTitle>
          </DialogHeader>
          <FeeRuleForm
            existingCodes={existingCodes}
            feeRule={activeFeeRule?.data}
            key={formKey}
            milestones={milestones}
            onCancel={() => {
              setShowAddDialog(false);
              onCloseFeeRule();
            }}
            onSave={(feeRule) => {
              if (activeFeeRule) {
                onUpdate(activeFeeRule.index, feeRule);
              } else {
                onAdd(feeRule);
              }
              setShowAddDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FeeRuleCard({ feeRule, index, onEdit, onDelete }: FeeRuleCardProps) {
  return (
    <Card className="group">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm">{feeRule.name}</CardTitle>
              <span className="text-xs text-muted-foreground">
                ({feeRule.code})
              </span>
            </div>
            <CardDescription className="mt-1">
              {feeRule.triggerTiming.replace(/_/g, " ")} •{" "}
              {feeRule.calculationType.replace(/_/g, " ")}
              {feeRule.rateValue !== undefined &&
                (feeRule.calculationType === "fixed"
                  ? `: $${feeRule.rateValue.toFixed(2)}`
                  : `: ${feeRule.rateValue}%`)}
              {feeRule.applyMode === "specific_occurrence" &&
                ` • Occurrence ${feeRule.occurrenceNumber} only`}
            </CardDescription>
          </div>
          <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Button
              className="h-8 w-8"
              onClick={() => onEdit(index)}
              size="icon"
              variant="ghost"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(index)}
              size="icon"
              variant="ghost"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function FeeRuleForm({
  feeRule,
  milestones,
  existingCodes: _existingCodes,
  onSave,
  onCancel,
}: FeeRuleFormProps) {
  const [formData, setFormData] = useState<FeeRuleFormData>(
    feeRule || {
      code: "",
      name: "",
      description: "",
      milestoneCode: undefined,
      triggerTiming: "on_milestone_due",
      chargeScope: "milestone",
      calculationType: "fixed",
      calculationBase: "principal",
      rateValue: 0,
      minAmount: undefined,
      maxAmount: undefined,
      postToSeparateLineItem: false,
      refundable: false,
      applyMode: "all_occurrences",
      occurrenceNumber: undefined,
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;
    onSave(formData);
  };

  // Get the selected milestone to check if it's recurring
  const selectedMilestone = formData.milestoneCode
    ? milestones.find((m) => m.code === formData.milestoneCode)
    : null;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fee-code">Code *</Label>
          <Input
            disabled={!!feeRule}
            id="fee-code"
            onChange={(e) =>
              setFormData({
                ...formData,
                code: e.target.value.toUpperCase().replace(/\s/g, "_"),
              })
            }
            placeholder="e.g., ADMIN_FEE"
            value={formData.code}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fee-name">Name *</Label>
          <Input
            id="fee-name"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Administrative Fee"
            value={formData.name}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fee-description">Description</Label>
        <Input
          id="fee-description"
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Optional description"
          value={formData.description}
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Trigger Configuration</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trigger-timing">Trigger Timing</Label>
            <Select
              onValueChange={(value: FeeRuleFormData["triggerTiming"]) =>
                setFormData({ ...formData, triggerTiming: value })
              }
              value={formData.triggerTiming}
            >
              <SelectTrigger id="trigger-timing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="on_milestone_due">
                  On Milestone Due
                </SelectItem>
                <SelectItem value="on_plan_creation">
                  On Plan Creation
                </SelectItem>
                <SelectItem value="on_booking">On Booking</SelectItem>
                <SelectItem value="on_contract_signing">
                  On Contract Signing
                </SelectItem>
                <SelectItem value="on_handover">On Handover</SelectItem>
                <SelectItem value="on_payment">On Payment</SelectItem>
                <SelectItem value="on_late">On Late</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="charge-scope">Charge Scope</Label>
            <Select
              onValueChange={(value: FeeRuleFormData["chargeScope"]) =>
                setFormData({ ...formData, chargeScope: value })
              }
              value={formData.chargeScope}
            >
              <SelectTrigger id="charge-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="milestone">
                  Milestone (All or Specific)
                </SelectItem>
                <SelectItem value="installment">Installment</SelectItem>
                <SelectItem value="plan">Plan Level (One-time)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(formData.chargeScope === "milestone" ||
          formData.chargeScope === "installment") &&
          milestones.length > 0 && (
            <div className="space-y-2 mt-3">
              <Label htmlFor="milestone-select">Milestone</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    milestoneCode: value === "all" ? undefined : value,
                  })
                }
                value={formData.milestoneCode ?? "all"}
              >
                <SelectTrigger id="milestone-select">
                  <SelectValue placeholder="All milestones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All milestones</SelectItem>
                  {milestones.map((m) => (
                    <SelectItem key={m.code} value={m.code}>
                      {m.sequenceNumber}. {m.label} ({m.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        {/* Show Apply To when a recurring milestone is selected */}
        {selectedMilestone != null &&
          selectedMilestone.schedulePatternType === "recurring" && (
            <div className="space-y-2 mt-3">
              <Label htmlFor="apply-mode">Apply To</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    applyMode: value as FeeRuleFormData["applyMode"],
                  })
                }
                value={formData.applyMode ?? "all_occurrences"}
              >
                <SelectTrigger id="apply-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_occurrences">
                    All Occurrences
                  </SelectItem>
                  <SelectItem value="specific_occurrence">
                    Specific Occurrence Only
                  </SelectItem>
                </SelectContent>
              </Select>

              {formData.applyMode === "specific_occurrence" && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="occurrence-number">Select Occurrence</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        occurrenceNumber: Number(value),
                      })
                    }
                    value={formData.occurrenceNumber?.toString() ?? ""}
                  >
                    <SelectTrigger id="occurrence-number">
                      <SelectValue placeholder="Select occurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: selectedMilestone.recurringCount || 1 },
                        (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Occurrence {i + 1}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Calculation Configuration</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calculation-type">Calculation Type</Label>
            <Select
              onValueChange={(value: FeeRuleFormData["calculationType"]) => {
                const calculationBase: FeeRuleFormData["calculationBase"] =
                  value === "percentage_of_installment"
                    ? "installment_amount"
                    : value === "percentage_of_outstanding"
                      ? "outstanding_principal"
                      : "principal";

                setFormData({
                  ...formData,
                  calculationType: value,
                  calculationBase,
                });
              }}
              value={formData.calculationType}
            >
              <SelectTrigger id="calculation-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="percentage_of_principal">
                  % of Principal
                </SelectItem>
                <SelectItem value="percentage_of_installment">
                  % of Installment Amount
                </SelectItem>
                <SelectItem value="percentage_of_outstanding">
                  % of Outstanding Balance
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate-value">
              {formData.calculationType === "fixed" ? "Amount" : "Rate (%)"}
            </Label>
            <Input
              id="rate-value"
              min={0}
              onChange={(e) =>
                setFormData({ ...formData, rateValue: Number(e.target.value) })
              }
              step={0.01}
              type="number"
              value={formData.rateValue ?? 0}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="space-y-2">
            <Label htmlFor="fee-min-amount">Min Amount</Label>
            <Input
              id="fee-min-amount"
              min={0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minAmount: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="No minimum"
              type="number"
              value={formData.minAmount ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee-max-amount">Max Amount</Label>
            <Input
              id="fee-max-amount"
              min={0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxAmount: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="No maximum"
              type="number"
              value={formData.maxAmount ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Posting Behavior</h4>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="separate-line">Post to Separate Line Item</Label>
              <p className="text-sm text-muted-foreground">
                Add as a separate installment instead of including with the
                milestone payment
              </p>
            </div>
            <Switch
              checked={formData.postToSeparateLineItem}
              id="separate-line"
              onCheckedChange={(checked) =>
                setFormData({ ...formData, postToSeparateLineItem: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="refundable">Refundable</Label>
              <p className="text-sm text-muted-foreground">
                This fee can be refunded if the payment plan is cancelled
              </p>
            </div>
            <Switch
              checked={formData.refundable}
              id="refundable"
              onCheckedChange={(checked) =>
                setFormData({ ...formData, refundable: checked })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save Fee Rule</Button>
      </div>
    </form>
  );
}
