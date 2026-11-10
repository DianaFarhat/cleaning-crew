// src/app/api/users/[userId]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

import { updateUserProfileInputSchema } from "@/types/user";
import { getUser } from "@/services/user/get-user";
import { updateUserProfile } from "@/services/user/update-user-profile";

import { withErrorHandler, type RouteContext } from "@/util/withErrorHandler";
import { BadRequestException } from "@/util/exceptions/http/BadRequestException";

const paramsSchema = z.object({
  userId: z.uuid(), // non-UUID ids → 400 instead of a Prisma 500
});

// TODO(auth): admin → any user; others → own userId, or a cleaner assigned
// to one of their sessions (owner); 403 otherwise
export const GET = withErrorHandler(async (_req: Request, ctx: RouteContext) => {
  // 1. Read userId from the URL
  const params = paramsSchema.safeParse(await ctx.params);
  if (!params.success) {
    throw new BadRequestException("Invalid userId", z.flattenError(params.error));
  }

  // 2. Call the service
  const user = await getUser(params.data.userId);

  // 3. Return the user profile (safe user, no passwordHash)
  return NextResponse.json(user, { status: 200 });
});

// TODO(auth): caller must be this user (403 otherwise)
export const PATCH = withErrorHandler(async (req: Request, ctx: RouteContext) => {
  // 1. Read userId from the URL
  const params = paramsSchema.safeParse(await ctx.params);
  if (!params.success) {
    throw new BadRequestException("Invalid userId", z.flattenError(params.error));
  }

  // 2. Read request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestException("Request body must be valid JSON");
  }

  // 3. Validate with Zod (unknown fields like "role" are dropped)
  const result = updateUserProfileInputSchema.safeParse(body);
  if (!result.success) {
    throw new BadRequestException("Validation failed", z.flattenError(result.error));
  }

  // 4. Call the service
  const user = await updateUserProfile(params.data.userId, result.data);

  // 5. Return the updated user (safe user, no passwordHash)
  return NextResponse.json(user, { status: 200 });
});