
import { z } from "zod";
import { UserRole, CleanerStatus } from "@/app/generated/prisma/enums";

// ── User entity (excludes sensitive fields) ──

export const userSchema = z.object({
  userId: z.uuid(),
  username: z.string(),
  role: z.enum(UserRole),
  email: z.email(),
  emailVerified: z.boolean(),
  emailVerifiedAt: z.date().nullable(),
  phoneNumber: z.string().regex(
  /^(?:3\d{6}|(?:70|71|76|78|79|81)\d{6})$/,
  "Enter a valid Lebanese mobile number"
  ),
  profileImage: z.url().nullable(),
  cleanerStatus: z.enum(CleanerStatus).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ── Owner registration input ──

export const registerOwnerInputSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  phoneNumber: z.string().regex(
  /^(?:3\d{6}|(?:70|71|76|78|79|81)\d{6})$/,
  "Enter a valid Lebanese mobile number"
  ),
  password: z.string().min(8),
});

// ── Admin creates cleaner input ──

export const createCleanerInputSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  phoneNumber: z.string().regex(
  /^(?:3\d{6}|(?:70|71|76|78|79|81)\d{6})$/,
  "Enter a valid Lebanese mobile number"
  ),
  cleanerStatus: z.enum(CleanerStatus),
});

// ── Inferred TypeScript types ──

export type User = z.infer<typeof userSchema>;

export type SafeUser = User;

export type RegisterOwnerInput =
  z.infer<typeof registerOwnerInputSchema>;

export type CreateCleanerInput =
  z.infer<typeof createCleanerInputSchema>;
