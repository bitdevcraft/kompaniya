"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import { Input } from "@kompaniya/ui-common/components/input";
import { Label } from "@kompaniya/ui-common/components/label";
import { type UserSignupData, userSignupSchema } from "@repo/shared";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface UserSignupStepProps {
  onNext: (data: UserSignupData) => void;
  defaultValues?: Partial<UserSignupData>;
}

export function UserSignupStep({ onNext, defaultValues }: UserSignupStepProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserSignupData>({
    resolver: zodResolver(userSignupSchema),
    defaultValues,
  });

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onNext)}>
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          Create your account
        </h2>
        <p className="text-muted-foreground text-balance">
          Enter your details to get started
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="Jane"
              {...register("firstName")}
              aria-invalid={errors.firstName ? "true" : "false"}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...register("lastName")}
              aria-invalid={errors.lastName ? "true" : "false"}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            placeholder="jane@company.com"
            type="email"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              placeholder="Create a strong password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Continue"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By continuing, you agree to our{" "}
        <a className="underline hover:text-foreground" href="#">
          Terms of Service
        </a>{" "}
        and{" "}
        <a className="underline hover:text-foreground" href="#">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}
