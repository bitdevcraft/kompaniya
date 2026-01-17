"use client";

import type {
  ScheduleItem,
  TemplateFeeRule,
  TemplateMilestone,
} from "@repo/database/schema";

import { Card, CardContent } from "@kompaniya/ui-common/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kompaniya/ui-common/components/table";

import { ScheduleTable } from "@/components/payment-plan/schedule-table";

import type { BaseRecordFieldProps } from "./record-field-types";

import { FieldDescription, FieldLabel } from "./record-field-types";

type FeesFieldProps = BaseRecordFieldProps<
  TemplateFeeRule[] | null | undefined
>;
type MilestonesFieldProps = BaseRecordFieldProps<
  TemplateMilestone[] | null | undefined
>;
type ScheduleFieldProps = BaseRecordFieldProps<
  ScheduleItem[] | null | undefined
>;

export function PaymentPlanFeesField({
  description,
  label,
  value,
}: FeesFieldProps) {
  const feeRules = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      {feeRules.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No fee rules configured.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Calculation</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRules.map((rule) => (
                  <TableRow key={rule.code}>
                    <TableCell>{rule.code}</TableCell>
                    <TableCell>{rule.name}</TableCell>
                    <TableCell>
                      {rule.triggerTiming.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      {rule.calculationType.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-right">
                      {rule.rateValue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <FieldDescription description={description} />
    </div>
  );
}

export function PaymentPlanMilestonesField({
  description,
  label,
  value,
}: MilestonesFieldProps) {
  const milestones = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      {milestones.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No milestones configured.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Amount Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map((milestone) => (
                  <TableRow key={milestone.code}>
                    <TableCell>{milestone.sequenceNumber}</TableCell>
                    <TableCell>{milestone.code}</TableCell>
                    <TableCell>{milestone.label}</TableCell>
                    <TableCell>
                      {milestone.schedulePatternType.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      {milestone.amountMode.replace(/_/g, " ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <FieldDescription description={description} />
    </div>
  );
}

export function PaymentPlanScheduleField({
  description,
  label,
  record,
  value,
}: ScheduleFieldProps) {
  const scheduleItems = Array.isArray(value) ? value : [];
  const currency =
    typeof record?.currency === "string" ? record.currency : "USD";

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <ScheduleTable currency={currency} scheduleItems={scheduleItems} />
      <FieldDescription description={description} />
    </div>
  );
}
