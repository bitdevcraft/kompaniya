/**
 * Fee Breakdown Popover Component
 *
 * Shows detailed fee breakdown for a specific schedule item.
 */

"use client";

import type { ScheduleItem, TemplateFeeRule } from "@repo/database/schema";

import { Button } from "@kompaniya/ui-common/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kompaniya/ui-common/components/popover";
import { Info } from "lucide-react";

export interface FeeBreakdownPopoverProps {
  item: ScheduleItem;
  fees: TemplateFeeRule[];
  currency: string;
}

export function FeeBreakdownPopover({
  item,
  fees,
  currency,
}: FeeBreakdownPopoverProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Calculate individual fee amounts
  const getFeeAmount = (fee: (typeof fees)[0]) => {
    if (fee.calculationType === "fixed") {
      return fee.rateValue;
    }
    if (fee.calculationType === "percentage_of_principal") {
      return item.principalDue * (fee.rateValue / 100);
    }
    if (fee.calculationType === "percentage_of_installment") {
      return item.amountDue * (fee.rateValue / 100);
    }
    return 0;
  };

  const feeBreakdown = fees.map((fee) => ({
    ...fee,
    amount: getFeeAmount(fee),
  }));

  const calculatedTotal = feeBreakdown.reduce(
    (sum, fee) => sum + fee.amount,
    0,
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-5 w-5" size="icon" variant="ghost">
          <Info className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm">Fee Breakdown</h4>
            <p className="text-xs text-muted-foreground">
              Fees applied to this payment
            </p>
          </div>

          <div className="space-y-2">
            {feeBreakdown.map((fee) => (
              <div
                className="flex items-start justify-between text-sm"
                key={fee.code}
              >
                <div className="flex-1">
                  <div className="font-medium">{fee.name}</div>
                  {fee.description && (
                    <div className="text-xs text-muted-foreground">
                      {fee.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {fee.calculationType === "fixed"
                      ? "Fixed amount"
                      : `${fee.rateValue}% of ${fee.calculationType.replace("percentage_of_", "").replace("_", " ")}`}
                  </div>
                </div>
                <div className="font-medium">{formatCurrency(fee.amount)}</div>
              </div>
            ))}
          </div>

          {Math.abs(calculatedTotal - item.feesDue) > 0.01 && (
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Difference: {formatCurrency(item.feesDue - calculatedTotal)}
            </div>
          )}

          <div className="pt-2 border-t flex justify-between text-sm font-medium">
            <span>Total Fees</span>
            <span>{formatCurrency(item.feesDue)}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
