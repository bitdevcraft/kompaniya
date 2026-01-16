/**
 * Schedule Preview Component
 *
 * Shows a live preview of the payment schedule based on the template configuration.
 */

"use client";

import type { ScheduleGenerationResult } from "@repo/shared/payment-plan";

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

export interface SchedulePreviewProps {
  schedule: ScheduleGenerationResult | null;
  currency: string;
}

export function SchedulePreview({ schedule, currency }: SchedulePreviewProps) {
  if (!schedule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Preview</CardTitle>
          <CardDescription>
            Add milestones to see a preview of the payment schedule.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No milestones configured yet. Go to the Milestones tab to add
            payment milestones.
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Principal</CardDescription>
            <CardTitle className="text-xl">
              {formatCurrency(schedule.totalPrincipal)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Fees</CardDescription>
            <CardTitle className="text-xl">
              {formatCurrency(schedule.totalFees)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Amount</CardDescription>
            <CardTitle className="text-xl">
              {formatCurrency(schedule.totalAmount)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Number of Payments</CardDescription>
            <CardTitle className="text-xl">
              {schedule.scheduleItems.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule Preview</CardTitle>
          <CardDescription>
            Based on a sample principal amount of $100,000 starting{" "}
            {formatDate(schedule.startDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Fees</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.scheduleItems.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {item.templateMilestoneCode}
                      </div>
                      {item.occurrenceIndex && item.occurrenceIndex > 1 && (
                        <div className="text-xs text-muted-foreground">
                          Installment {item.occurrenceIndex}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.dueDate ? formatDate(item.dueDate) : "-"}
                    {item.isDueDateEstimated && (
                      <span className="text-xs text-muted-foreground ml-1">
                        (est.)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.principalDue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.feesDue)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.amountDue)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals Row */}
          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Total Payments
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(schedule.totalAmount)}
              </div>
              <div className="text-xs text-muted-foreground">
                from {formatDate(schedule.startDate)} to{" "}
                {formatDate(schedule.endDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
