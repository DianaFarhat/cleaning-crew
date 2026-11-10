import { z } from "zod";
import { UserRole, CleanerStatus } from "@/app/generated/prisma/enums";
import { lebanesePhoneInputSchema } from "@/lib/validation/phone";

// ── Shared input fields ──

export const emailInputSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

export const usernameInputSchema = z.string().trim().min(1).max(100);

// ── User entity (excludes sensitive fields) ──
// Output only: no max lengths here (validate data coming IN, not going OUT)

export const userSchema = z.object({
  userId: z.uuid(),
  username: z.string(),
  role: z.enum(UserRole),
  email: z.email(),
  emailVerified: z.boolean(),
  emailVerifiedAt: z.date().nullable(),
  phoneNumber: z.string(),
  profileImage: z.string().nullable(),
  cleanerStatus: z.enum(CleanerStatus).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ── Owner registration input ──

export const registerOwnerInputSchema = z.object({
  username: usernameInputSchema,
  email: emailInputSchema,
  phoneNumber: lebanesePhoneInputSchema,
  password: z.string().min(8).max(72),
});

// ── Admin creates cleaner input ──

export const createCleanerInputSchema = z.object({
  username: usernameInputSchema,
  email: emailInputSchema,
  phoneNumber: lebanesePhoneInputSchema,
  cleanerStatus: z.enum(CleanerStatus),
});

// ── Admin changes cleaner status ──

export const changeCleanerStatusInputSchema = z.object({
  cleanerStatus: z.enum(CleanerStatus),
});

// ── User edits their profile ──

export const updateUserProfileInputSchema = z.object({
  username: usernameInputSchema.optional(),
  phoneNumber: lebanesePhoneInputSchema.optional(),
  profileImage: z.url().max(2048).optional(),
});

// ── Inferred TypeScript types ──

export type User = z.infer<typeof userSchema>;

export type SafeUser = User;

export type RegisterOwnerInput = z.infer<typeof registerOwnerInputSchema>;

export type CreateCleanerInput = z.infer<typeof createCleanerInputSchema>;

export type ChangeCleanerStatusInput = z.infer<typeof changeCleanerStatusInputSchema>;

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileInputSchema>;