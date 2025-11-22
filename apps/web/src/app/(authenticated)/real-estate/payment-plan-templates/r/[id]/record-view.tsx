import { type OrgPaymentPlanTemplate } from "@repo/database/schema";
import { Badge } from "@repo/shared-ui/components/common/badge";
import { Button } from "@repo/shared-ui/components/common/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/shared-ui/components/common/card";
import Link from "next/link";

import { model } from "../../config";

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
          <Link href={`/real-estate/${model.plural}`}>
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
              {formatNumber(record.minPrincipal)} -{" "}
              {formatNumber(record.maxPrincipal)}
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{milestone.label}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {milestone.code}
                  </p>
                </div>
                <Badge variant="secondary">#{milestone.sequenceNumber}</Badge>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Anchor</p>
                  <p className="font-medium">{milestone.anchorType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pattern</p>
                  <p className="font-medium">{milestone.schedulePatternType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount mode</p>
                  <p className="font-medium">{milestone.amountMode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount value</p>
                  <p className="font-medium">
                    {formatNumber(milestone.amountValue)}
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
                      ? `${formatNumber(milestone.intervalValue)} ${milestone.intervalUnit} x ${formatNumber(milestone.intervalOccurrences)}`
                      : "None"}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">
                    {milestone.description?.trim()
                      ? milestone.description
                      : "No milestone description."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {record.templateConfig.feeRules.length === 0 && (
            <p className="text-sm text-muted-foreground">No fees attached.</p>
          )}
          {record.templateConfig.feeRules.map((feeRule) => (
            <Card className="border-dashed" key={feeRule.code}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{feeRule.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {feeRule.code}
                  </p>
                </div>
                <Badge variant="secondary">{feeRule.triggerTiming}</Badge>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Scope</p>
                  <p className="font-medium">{feeRule.chargeScope}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calculation</p>
                  <p className="font-medium">{feeRule.calculationType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base</p>
                  <p className="font-medium">{feeRule.calculationBase}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rate</p>
                  <p className="font-medium">
                    {formatNumber(feeRule.rateValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posting</p>
                  <p className="font-medium">{feeRule.postingBehavior}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Milestone</p>
                  <p className="font-medium">
                    {feeRule.milestoneCode ?? "None"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount range</p>
                  <p className="font-medium">
                    {formatNumber(feeRule.minAmount)} -{" "}
                    {formatNumber(feeRule.maxAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refundable</p>
                  <p className="font-medium">
                    {feeRule.isRefundable ? "Yes" : "No"}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">
                    {feeRule.description?.trim()
                      ? feeRule.description
                      : "No fee description."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
