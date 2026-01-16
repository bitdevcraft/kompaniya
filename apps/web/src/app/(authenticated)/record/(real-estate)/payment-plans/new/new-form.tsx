"use client";

import { PaymentPlanInstanceForm } from "@/app/(authenticated)/record/(real-estate)/payment-plans/components/payment-plan-instance-form";

interface NewRecordFormProps {
  bookingId?: string;
  initialPrincipalAmount?: number;
  initialCurrency?: string;
  onFinish?: () => void;
}

export function NewRecordForm({
  bookingId,
  initialPrincipalAmount,
  initialCurrency,
  onFinish,
}: NewRecordFormProps) {
  return (
    <PaymentPlanInstanceForm
      bookingId={bookingId}
      initialCurrency={initialCurrency}
      initialPrincipalAmount={initialPrincipalAmount}
      onFinish={onFinish}
    />
  );
}
