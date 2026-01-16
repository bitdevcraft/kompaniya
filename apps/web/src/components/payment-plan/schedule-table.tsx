/**
 * Schedule Table Component
 *
 * Displays the payment schedule for a payment plan instance.
 */

"use client";

import type { ScheduleItem, TemplateFeeRule } from "@repo/database/schema";

import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kompaniya/ui-common/components/table";

import { FeeBreakdownPopover } from "./fee-breakdown-popover";
import { ScheduleStatusBadge } from "./schedule-status-badge";

export interface ScheduleTableProps {
  scheduleItems: ScheduleItem[];
  currency: string;
  feeRules?: TemplateFeeRule[];
  onRowAction?: (item: ScheduleItem, action: string) => void;
  editable?: boolean;
}

export function ScheduleTable({
  scheduleItems,
  currency,
  feeRules = [],
  onRowAction,
  editable = false,
}: ScheduleTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get applicable fee rules for a schedule item
  const getApplicableFees = (item: ScheduleItem) => {
    return feeRules.filter((rule) => {
      if (rule.chargeScope === "plan") {
        return false;
      }
      if (
        rule.milestoneCode &&
        rule.milestoneCode !== item.templateMilestoneCode
      ) {
        return false;
      }
      return (
        rule.triggerTiming === "on_milestone_due" ||
        rule.triggerTiming === "on_plan_creation"
      );
    });
  };

  // Calculate totals
  const totals = scheduleItems.reduce(
    (acc, item) => ({
      principal: acc.principal + item.principalDue,
      interest: acc.interest + item.interestDue,
      fees: acc.fees + item.feesDue,
      total: acc.total + item.amountDue,
    }),
    { principal: 0, interest: 0, fees: 0, total: 0 },
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Schedule</CardTitle>
            <CardDescription>
              All scheduled payments for this payment plan
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {scheduleItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No schedule items yet.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm text-muted-foreground">Principal</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(totals.principal)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm text-muted-foreground">Interest</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(totals.interest)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm text-muted-foreground">Fees</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(totals.fees)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-xl font-semibold">
                  {formatCurrency(totals.total)}
                </div>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Fees</TableHead>
                    <TableHead className="text-right">Total Due</TableHead>
                    <TableHead>Status</TableHead>
                    {editable && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleItems.map((item, index) => {
                    const applicableFees = getApplicableFees(item);
                    const hasFees =
                      applicableFees.length > 0 && item.feesDue > 0;

                    return (
                      <TableRow key={item.id || index}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.templateMilestoneCode || "-"}
                            </div>
                            {item.occurrenceIndex &&
                              item.occurrenceIndex > 1 && (
                                <div className="text-xs text-muted-foreground">
                                  Payment {item.occurrenceIndex}
                                </div>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formatDate(item.dueDate)}
                            {item.isDueDateEstimated && (
                              <span className="text-xs text-muted-foreground">
                                (est.)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.principalDue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.interestDue)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {formatCurrency(item.feesDue)}
                            {hasFees && (
                              <FeeBreakdownPopover
                                currency={currency}
                                fees={applicableFees}
                                item={item}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.amountDue)}
                        </TableCell>
                        <TableCell>
                          <ScheduleStatusBadge status={item.status} />
                        </TableCell>
                        {editable && (
                          <TableCell>
                            {onRowAction && (
                              <Button
                                className="h-8 w-8"
                                onClick={() => onRowAction(item, "edit")}
                                size="icon"
                                variant="ghost"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                  />
                                </svg>
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Totals Row */}
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Total Amount Due
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totals.total)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
