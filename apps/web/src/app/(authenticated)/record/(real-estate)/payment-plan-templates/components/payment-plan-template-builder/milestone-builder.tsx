/**
 * Milestone Builder Component
 *
 * Manages payment milestones with drag-and-drop reordering.
 */

"use client";

import type { MilestoneFormData } from "@repo/domain/payment-plans";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export interface MilestoneBuilderProps {
  milestones: MilestoneFormData[];
  onAdd: (milestone: MilestoneFormData) => void;
  onUpdate: (index: number, milestone: MilestoneFormData) => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  activeMilestone: { index: number; data: MilestoneFormData } | null;
  onCloseMilestone: () => void;
}

interface MilestoneFormProps {
  milestone?: MilestoneFormData;
  existingCodes: string[];
  defaultSequenceNumber: number;
  onSave: (milestone: MilestoneFormData) => void;
  onCancel: () => void;
}

interface SortableMilestoneProps {
  milestone: MilestoneFormData;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function MilestoneBuilder({
  milestones,
  onAdd,
  onUpdate,
  onDelete,
  onEdit,
  activeMilestone,
  onCloseMilestone,
}: MilestoneBuilderProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formResetCounter, setFormResetCounter] = useState(0);
  const existingCodes = milestones.map((m) => m.code);
  const nextSequenceNumber =
    Math.max(0, ...milestones.map((m) => m.sequenceNumber || 0)) + 1;
  const formKey = activeMilestone
    ? `edit-${activeMilestone.index}`
    : `new-${formResetCounter}`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Milestones</CardTitle>
              <CardDescription>
                Define when payments are due and how much should be paid.
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
              Add Milestone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No milestones yet. Add your first payment milestone.
            </div>
          ) : (
            <div className="space-y-2">
              <SortableContext
                items={milestones.map((m) => m.code)}
                strategy={verticalListSortingStrategy}
              >
                {milestones.map((milestone, index) => (
                  <SortableMilestone
                    index={index}
                    key={milestone.code}
                    milestone={milestone}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </SortableContext>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            onCloseMilestone();
          }
        }}
        open={showAddDialog || activeMilestone !== null}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeMilestone ? "Edit Milestone" : "Add Milestone"}
            </DialogTitle>
          </DialogHeader>
          <MilestoneForm
            defaultSequenceNumber={nextSequenceNumber}
            existingCodes={existingCodes}
            key={formKey}
            milestone={activeMilestone?.data}
            onCancel={() => {
              setShowAddDialog(false);
              onCloseMilestone();
            }}
            onSave={(milestone) => {
              if (activeMilestone) {
                onUpdate(activeMilestone.index, milestone);
              } else {
                onAdd(milestone);
              }
              setShowAddDialog(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MilestoneForm({
  milestone,
  existingCodes: _existingCodes,
  defaultSequenceNumber,
  onSave,
  onCancel,
}: MilestoneFormProps) {
  const initialSequenceNumber =
    milestone?.sequenceNumber ?? defaultSequenceNumber;
  const [formData, setFormData] = useState<MilestoneFormData>(
    milestone || {
      code: "",
      label: "",
      description: "",
      sequenceNumber: initialSequenceNumber,
      schedulePatternType: "single",
      anchorType: "relative_to_plan_start",
      anchorEventType: "booking",
      offsetDays: 0,
      offsetMonths: 0,
      recurringCount: 1,
      recurringInterval: "monthly",
      amountMode: "percentage_of_principal",
      amountValue: 10,
      minAmount: undefined,
      maxAmount: undefined,
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.label.trim()) return;
    onSave(formData);
  };

  const isRecurring = formData.schedulePatternType === "recurring";
  const isRelativeToEvent = formData.anchorType === "relative_to_event";

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="milestone-code">Code *</Label>
          <Input
            disabled={!!milestone}
            id="milestone-code"
            onChange={(e) =>
              setFormData({
                ...formData,
                code: e.target.value.toUpperCase().replace(/\s/g, "_"),
              })
            }
            placeholder="e.g., BOOKING_FEE"
            value={formData.code}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="milestone-label">Label *</Label>
          <Input
            id="milestone-label"
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            placeholder="e.g., Booking Fee"
            value={formData.label}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="milestone-description">Description</Label>
        <Input
          id="milestone-description"
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Optional description"
          value={formData.description}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schedule-pattern">Schedule Pattern</Label>
          <Select
            onValueChange={(value: "single" | "recurring") =>
              setFormData({ ...formData, schedulePatternType: value })
            }
            value={formData.schedulePatternType}
          >
            <SelectTrigger id="schedule-pattern">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Payment</SelectItem>
              <SelectItem value="recurring">Recurring Payments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="anchor-type">Anchor Type</Label>
          <Select
            onValueChange={(
              value:
                | "absolute_date"
                | "relative_to_plan_start"
                | "relative_to_event",
            ) => setFormData({ ...formData, anchorType: value })}
            value={formData.anchorType}
          >
            <SelectTrigger id="anchor-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relative_to_plan_start">
                Relative to Plan Start
              </SelectItem>
              <SelectItem value="relative_to_event">
                Relative to Event
              </SelectItem>
              <SelectItem value="absolute_date">Absolute Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isRelativeToEvent && (
        <div className="space-y-2">
          <Label htmlFor="anchor-event">Anchor Event</Label>
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                anchorEventType: value as
                  | "booking"
                  | "contract_signing"
                  | "handover",
              })
            }
            value={formData.anchorEventType}
          >
            <SelectTrigger id="anchor-event">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking">Booking Date</SelectItem>
              <SelectItem value="contract_signing">Contract Signing</SelectItem>
              <SelectItem value="handover">Handover Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="offset-days">Offset Days</Label>
          <Input
            id="offset-days"
            onChange={(e) =>
              setFormData({ ...formData, offsetDays: Number(e.target.value) })
            }
            type="number"
            value={formData.offsetDays ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="offset-months">Offset Months</Label>
          <Input
            id="offset-months"
            onChange={(e) =>
              setFormData({ ...formData, offsetMonths: Number(e.target.value) })
            }
            type="number"
            value={formData.offsetMonths ?? 0}
          />
        </div>
        {isRecurring && (
          <div className="space-y-2">
            <Label htmlFor="recurring-count">Occurrences</Label>
            <Input
              id="recurring-count"
              min={1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recurringCount: Number(e.target.value),
                })
              }
              type="number"
              value={formData.recurringCount ?? 1}
            />
          </div>
        )}
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <Label htmlFor="recurring-interval">Interval</Label>
          <Select
            onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") =>
              setFormData({ ...formData, recurringInterval: value })
            }
            value={formData.recurringInterval}
          >
            <SelectTrigger id="recurring-interval">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Amount Configuration</h4>

        <div className="space-y-2">
          <Label htmlFor="amount-mode">Amount Mode</Label>
          <Select
            onValueChange={(value: MilestoneFormData["amountMode"]) =>
              setFormData({ ...formData, amountMode: value })
            }
            value={formData.amountMode}
          >
            <SelectTrigger id="amount-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
              <SelectItem value="percentage_of_principal">
                % of Principal
              </SelectItem>
              <SelectItem value="percentage_of_remaining_principal">
                % of Remaining
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="space-y-2">
            <Label htmlFor="amount-value">
              {formData.amountMode.startsWith("percentage")
                ? "Percentage"
                : "Amount"}
            </Label>
            <Input
              id="amount-value"
              min={0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amountValue: Number(e.target.value),
                })
              }
              step="0.01"
              type="number"
              value={formData.amountValue ?? 0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-amount">Min Amount</Label>
            <Input
              id="min-amount"
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
              step="0.01"
              type="number"
              value={formData.minAmount ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-amount">Max Amount</Label>
            <Input
              id="max-amount"
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
              step="0.01"
              type="number"
              value={formData.maxAmount ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save Milestone</Button>
      </div>
    </form>
  );
}

function SortableMilestone({
  milestone,
  index,
  onEdit,
  onDelete,
}: SortableMilestoneProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: milestone.code,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="group" ref={setNodeRef} style={style}>
      <Card className="group/card">
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            <button
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                  #{milestone.sequenceNumber}
                </span>
                <CardTitle className="text-sm">{milestone.label}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  ({milestone.code})
                </span>
              </div>
              <CardDescription className="mt-1">
                {milestone.schedulePatternType === "recurring"
                  ? `Recurring: ${milestone.recurringCount}x ${milestone.recurringInterval}`
                  : "Single payment"}
                {" • "}
                {milestone.amountMode === "fixed_amount"
                  ? `$${milestone.amountValue?.toFixed(2)}`
                  : `${milestone.amountValue}%`}
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
    </div>
  );
}
