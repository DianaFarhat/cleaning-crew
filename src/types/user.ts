// types/user.ts
import { z } from "zod";
import { UserRole, CleanerStatus } from "@/app/generated/prisma/enums";

// ── Full entity — shape of a User as it's safe to hold and pass around
// your app layers. passwordHash and passwordChangedAt are deliberately
// NOT here — they never leave the repository layer. See user-repository.ts
// for where the raw Prisma row (which does have both) gets parsed down
// into this shape.
export const userSchema = z.object({
  userId: z.uuid(),
  username: z.string(),
  role: z.enum(UserRole),
  email: z.email(),
  emailVerified: z.boolean(),
  emailVerifiedAt: z.date().nullable(),
  phoneNumber: z.string(),
  profileImage: z.url().nullable(),
  cleanerStatus: z.enum(CleanerStatus).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

// Alias for clarity at call sites where "this has been stripped of
// sensitive fields" is the point being made — currently identical to
// User, since userSchema already excludes everything sensitive.
export type SafeUser = User;

// ── Input schema for POST /users (admin creates a cleaner) ──
export const createCleanerInputSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  phoneNumber: z.string().min(1),
  cleanerStatus: z.enum(CleanerStatus),
});

export type CreateCleanerInput = z.infer<typeof createCleanerInputSchema>;