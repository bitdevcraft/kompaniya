"use client";

import type {
  PaymentPlanTemplateConfig,
  PaymentPlanTemplateFormData,
} from "@repo/domain/payment-plans";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PaymentPlanTemplateBuilder } from "@/app/(authenticated)/record/(real-estate)/payment-plan-templates/components/payment-plan-template-builder";
import { authClient } from "@/lib/auth/client";

import { modelEndpoint } from "../config";

export default function NewTemplatePage() {
  const router = useRouter();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleSave = async ({
    config,
    template,
  }: {
    config: PaymentPlanTemplateConfig;
    template: PaymentPlanTemplateFormData;
  }) => {
    try {
      const response = await fetch(`${modelEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          organizationId: activeOrganization?.id,
          name: template.name,
          code: template.code,
          description: template.description,
          defaultCurrency: template.defaultCurrency,
          subjectType: template.subjectType,
          minPrincipal: template.minPrincipal,
          maxPrincipal: template.maxPrincipal,
          templateConfig: config,
          isActive: template.isActive,
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
