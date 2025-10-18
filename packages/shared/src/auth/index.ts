import { z } from "zod";

export const SIGN_UP_METHODS = ["password", "google", "facebook"] as const;
// Declarations
export interface AuthUser {
  id: string;
  name: string;
  email_address: string;
  role: string;
  is_email_address_verified: boolean;
}

export type SignUpMethod = (typeof SIGN_UP_METHODS)[number];

type LoginResponse = AuthUser;
type SignUpResponse = AuthUser;

export const SignUpWithPasswordSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(8).max(255),
});
export type SignUpWithPasswordPayload = z.infer<
  typeof SignUpWithPasswordSchema
>;
export type SignUpWithPasswordResponse = SignUpResponse;

// Login with email and password
export const LoginWithEmailPasswordSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(255),
});
export type LoginWithEmailPasswordPayload = z.infer<
  typeof LoginWithEmailPasswordSchema
>;
export type LoginWithEmailPasswordResponse = LoginResponse;

// Login with username and password
export const LoginWithUsernamePasswordSchema = z.object({
  username: z.string(),
  password: z.string().min(8).max(255),
});
export type LoginWithUsernamePasswordPayload = z.infer<
  typeof LoginWithUsernamePasswordSchema
>;
export type LoginWithUsernamePasswordResponse = LoginResponse;

// Forgot password
export const ForgotPasswordSchema = z.object({
  email: z.email(),
});
export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordSchema>;
export type ForgotPasswordResponse = true;

// Reset password
export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(255),
  passwordAgain: z.string().min(8).max(255),
});
export type ResetPasswordPayload = z.infer<typeof ResetPasswordSchema>;
export type ResetPasswordResponse = boolean;

// Send verify email
export const SendVerifyEmailTokenSchema = z.object({
  email_address: z.string(),
});
export type SendVerifyEmailTokenPayload = z.infer<
  typeof SendVerifyEmailTokenSchema
>;
export type SendVerifyEmailTokenResponse = true;

// Verify email
export const VerifyEmailSchema = z.object({
  token: z.string(),
});
export type VerifyEmailPayload = z.infer<typeof VerifyEmailSchema>;
export type VerifyEmailResponse = boolean;

export const userSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const organizationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]),
  industry: z.string().min(1, "Please select an industry"),
  role: z.string().min(2, "Role must be at least 2 characters"),
});

export type OrganizationData = z.infer<typeof organizationSchema>;
export type UserSignupData = z.infer<typeof userSignupSchema>;
