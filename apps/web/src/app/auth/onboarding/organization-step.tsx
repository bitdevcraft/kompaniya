"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import { Input } from "@kompaniya/ui-common/components/input";
import { Label } from "@kompaniya/ui-common/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kompaniya/ui-common/components/select";
import { type OrganizationData, organizationSchema } from "@repo/shared";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";

interface OrganizationStepProps {
  onNext: (data: OrganizationData) => void;
  onBack: () => void;
  defaultValues?: Partial<OrganizationData>;
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Marketing",
  "Consulting",
  "Other",
];

export function OrganizationStep({
  onNext,
  onBack,
  defaultValues,
}: OrganizationStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationData>({
    resolver: zodResolver(organizationSchema),
    defaultValues,
  });

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onNext)}>
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          Tell us about your organization
        </h2>
        <p className="text-muted-foreground text-balance">
          Help us personalize your experience
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            placeholder="Acme Inc."
            {...register("companyName")}
            aria-invalid={errors.companyName ? "true" : "false"}
          />
          {errors.companyName && (
            <p className="text-sm text-destructive">
              {errors.companyName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">Company size</Label>
          <Controller
            control={control}
            name="companySize"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  aria-invalid={errors.companySize ? "true" : "false"}
                  id="companySize"
                >
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.companySize && (
            <p className="text-sm text-destructive">
              {errors.companySize.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Controller
            control={control}
            name="industry"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  aria-invalid={errors.industry ? "true" : "false"}
                  id="industry"
                >
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.industry && (
            <p className="text-sm text-destructive">
              {errors.industry.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Your role</Label>
          <Input
            id="role"
            placeholder="Product Manager"
            {...register("role")}
            aria-invalid={errors.role ? "true" : "false"}
          />
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          className="flex-1 bg-transparent"
          onClick={onBack}
          type="button"
          variant="outline"
        >
          Back
        </Button>
        <Button className="flex-1" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Completing..." : "Complete setup"}
        </Button>
      </div>
    </form>
  );
}
