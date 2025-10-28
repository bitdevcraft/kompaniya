"use client";

import type { OrganizationData, UserSignupData } from "@repo/shared";

import { Card } from "@repo/shared-ui/components/common/card";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth/client";

import { OrganizationStep } from "./organization-step";
import { ProgressIndicator } from "./progress-indicator";
import { UserSignupStep } from "./user-signup-step";

const useSignupWithPassword = () => {
  return useMutation({
    mutationFn: async (payload: {
      user: UserSignupData;
      organization: OrganizationData;
    }) => {
      const { data, error } = await authClient.signUp.email({
        email: payload.user.email,
        password: payload.user.password,
        name: [payload.user.lastName, payload.user.firstName].join(","),
        // @ts-expect-error never
        metadata: payload.organization,
      });

      if (error) throw new Error(error.message);

      const userData = data.user as typeof data.user & { role: string };
      return {
        email_address: userData.email,
        id: userData.id,
        name: userData.name,
        role: userData.role,
        is_email_address_verified: userData.emailVerified,
      };
    },
  });
};

export function OnboardingFlow() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserSignupData | null>(null);
  const [organizationData, setOrganizationData] =
    useState<OrganizationData | null>(null);

  const handleUserSignup = (data: UserSignupData) => {
    setUserData(data);
    setCurrentStep(2);
  };

  const signup = useSignupWithPassword();

  const handleOrganizationInfo = async (data: OrganizationData) => {
    setOrganizationData(data);

    signup.mutate(
      {
        user: userData!,
        organization: data!,
      },
      {
        onSuccess: () => {
          router.push("/auth/login");
        },
      },
    );
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <ProgressIndicator currentStep={currentStep} totalSteps={2} />

        <Card className="p-8">
          {currentStep === 1 && (
            <UserSignupStep
              defaultValues={userData || undefined}
              onNext={handleUserSignup}
            />
          )}
          {currentStep === 2 && (
            <OrganizationStep
              defaultValues={organizationData || undefined}
              onBack={handleBack}
              onNext={handleOrganizationInfo}
            />
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Step {currentStep} of 2
        </p>
      </div>
    </div>
  );
}
