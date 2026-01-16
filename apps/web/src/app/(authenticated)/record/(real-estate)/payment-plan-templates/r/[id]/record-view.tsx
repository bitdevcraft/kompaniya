import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import { type OrgPaymentPlanTemplate } from "@repo/database/schema";
import { generateSchedule } from "@repo/shared/payment-plan";
import { format } from "date-fns";
import Link from "next/link";

import { ScheduleTable } from "@/components/payment-plan/schedule-table";

interface RecordViewProps {
  record: OrgPaymentPlanTemplate;
}

const formatNumber = (value: number | null | undefined) => {
  if (value === null || typeof value === "undefined") return "—";
  return value.toLocaleString();
};

export function RecordView({ record }: RecordViewProps) {
  const milestones = [...record.templateConfig.milestones].sort(
    (left, right) => left.sequenceNumber - right.sequenceNumber,
  );

  // Generate a preview schedule with a sample principal amount
  const samplePrincipal = record.minPrincipal
    ? Number(record.minPrincipal)
    : 100000;
  const previewSchedule = generateSchedule({
    template: record.templateConfig,
    principalAmount: samplePrincipal,
    currency: record.defaultCurrency || "USD",
    startDate: format(new Date(), "yyyy-MM-dd"),
    events: {
      bookingDate: null,
      contractSigningDate: null,
      handoverDate: null,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            {record.name}
          </h1>
          <p className="text-muted-foreground">{record.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={record.isActive ? "default" : "outline"}>
            {record.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="secondary">v{record.version}</Badge>
          <Link href="/record/payment-plan-templates">
            <Button variant="outline">Back to list</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Subject type</p>
            <p className="font-medium">{record.subjectType ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Currency</p>
            <p className="font-medium">{record.defaultCurrency ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Principal range</p>
            <p className="font-medium">
              {formatNumber(Number(record.minPrincipal) || 0)} -{" "}
              {formatNumber(Number(record.maxPrincipal) || 0)}
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">
              {record.description?.trim()
                ? record.description
                : "No description provided."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Preview</CardTitle>
          <CardDescription>
            Based on a sample principal amount of{" "}
            {formatNumber(samplePrincipal)} {record.defaultCurrency}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleTable
            currency={record.defaultCurrency || "USD"}
            scheduleItems={previewSchedule.scheduleItems}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No milestones configured.
            </p>
          )}
          {milestones.map((milestone) => (
            <Card className="border-dashed" key={milestone.code}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                <div>
                  <CardTitle className="text-base">{milestone.label}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {milestone.code}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">#{milestone.sequenceNumber}</Badge>
                  {milestone.anchorType !== "absolute_date" && (
                    <Badge className="text-xs" variant="outline">
                      Estimated
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3 py-3">
                <div>
                  <p className="text-sm text-muted-foreground">Anchor</p>
                  <p className="font-medium capitalize">
                    {milestone.anchorType.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pattern</p>
                  <p className="font-medium capitalize">
                    {milestone.schedulePatternType.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount mode</p>
                  <p className="font-medium capitalize">
                    {milestone.amountMode.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount value</p>
                  <p className="font-medium">
                    {milestone.amountMode === "percentage_of_principal" ||
                    milestone.amountMode === "percentage_of_remaining_principal"
                      ? `${formatNumber(milestone.amountValue)}%`
                      : formatNumber(milestone.amountValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Offsets</p>
                  <p className="font-medium">
                    {formatNumber(milestone.anchorOffsetMonths)} months /{" "}
                    {formatNumber(milestone.anchorOffsetDays)} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recurring</p>
                  <p className="font-medium">
                    {milestone.intervalUnit
                      ? `Every ${formatNumber(milestone.intervalValue)} ${milestone.intervalUnit} x ${formatNumber(milestone.intervalOccurrences)}`
                      : "None"}
                  </p>
                </div>
                {milestone.description && (
                  <div className="md:col-span-3">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{milestone.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {record.templateConfig.feeRules.length === 0 && (
            <p className="text-sm text-muted-foreground">No fees attached.</p>
          )}
          {record.templateConfig.feeRules.map((feeRule) => (
            <Card className="border-dashed" key={feeRule.code}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                <div>
                  <CardTitle className="text-base">{feeRule.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {feeRule.code}
                  </p>
                </div>
                <Badge variant="secondary">
                  {feeRule.triggerTiming.replace(/_/g, " ")}
                </Badge>
              </CardHeader>
              <CardContent className="py-3">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <span>
                    <span className="text-muted-foreground">Scope:</span>{" "}
                    <span className="font-medium capitalize">
                      {feeRule.chargeScope.replace(/_/g, " ")}
                    </span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Calculation:</span>{" "}
                    <span className="font-medium capitalize">
                      {feeRule.calculationType.replace(/_/g, " ")}
                    </span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Base:</span>{" "}
                    <span className="font-medium capitalize">
                      {feeRule.calculationBase.replace(/_/g, " ")}
                    </span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Rate:</span>{" "}
                    <span className="font-medium">
                      {feeRule.calculationType === "fixed"
                        ? formatNumber(feeRule.rateValue)
                        : `${formatNumber(feeRule.rateValue)}%`}
                    </span>
                  </span>
                </div>
                {feeRule.description && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {feeRule.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
