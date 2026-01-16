"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PaymentPlanTemplateBuilder } from "@/components/payment-plan-template-builder";
import { authClient } from "@/lib/auth/client";

import { modelEndpoint } from "../config";

export default function NewTemplatePage() {
  const router = useRouter();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleSave = async (
    config: import("@repo/domain/payment-plans").PaymentPlanTemplateConfig,
  ) => {
    try {
      const response = await fetch(`${modelEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          organizationId: activeOrganization?.id,
          name: "",
          code: "",
          defaultCurrency: "USD",
          templateConfig: config,
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create template");
      }

      toast.success("Payment plan template created successfully");
      router.push("../");
      router.refresh();
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create payment plan template");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="p-4">
      <PaymentPlanTemplateBuilder onCancel={handleCancel} onSave={handleSave} />
    </div>
  );
}
