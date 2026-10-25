import { z } from "zod";
import { UserRole, CleanerStatus } from "@/app/generated/prisma/enums";
import { lebanesePhoneInputSchema } from "@/lib/validation/phone"; // 🆕 1

// ── Shared input fields ──

export const emailInputSchema = z.string().trim().toLowerCase().pipe(z.email()); // 🆕 2

// ── User entity (excludes sensitive fields) ──

export const userSchema = z.object({
  userId: z.uuid(),
  username: z.string(),
  role: z.enum(UserRole),
  email: z.email(),
  emailVerified: z.boolean(),
  emailVerifiedAt: z.date().nullable(),
  phoneNumber: z.string(), // 🆕 3
  profileImage: z.url().nullable(),
  cleanerStatus: z.enum(CleanerStatus).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ── Owner registration input ──

export const registerOwnerInputSchema = z.object({
  username: z.string().trim().min(1), // 🆕 4
  email: emailInputSchema,            // 🆕 2
  phoneNumber: lebanesePhoneInputSchema, // 🆕 1
  password: z.string().min(8),
});

// ── Admin creates cleaner input ──

export const createCleanerInputSchema = z.object({
  username: z.string().trim().min(1), // 🆕 4
  email: emailInputSchema,            // 🆕 2
  phoneNumber: lebanesePhoneInputSchema, // 🆕 1
  cleanerStatus: z.enum(CleanerStatus),
});

// ── Inferred TypeScript types ──

export type User = z.infer<typeof userSchema>;

export type SafeUser = User;

export type RegisterOwnerInput =
  z.infer<typeof registerOwnerInputSchema>;

export type CreateCleanerInput =
  z.infer<typeof createCleanerInputSchema>;