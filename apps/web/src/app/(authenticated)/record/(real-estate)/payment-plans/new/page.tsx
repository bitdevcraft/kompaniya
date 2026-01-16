"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { PaymentPlanInstanceForm } from "@/components/payment-plan-instance-form";

export default function NewPaymentPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId") || undefined;
  const initialPrincipalAmount = searchParams.get("principalAmount")
    ? Number(searchParams.get("principalAmount"))
    : undefined;
  const initialCurrency = searchParams.get("currency") || undefined;

  const handleFinish = () => {
    router.push("../");
    router.refresh();
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Payment Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentPlanInstanceForm
            bookingId={bookingId}
            initialCurrency={initialCurrency}
            initialPrincipalAmount={initialPrincipalAmount}
            onFinish={handleFinish}
          />
        </CardContent>
      </Card>
    </div>
  );
}
