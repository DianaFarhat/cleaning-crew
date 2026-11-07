// src/app/api/users/[userId]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

import { getUser } from "@/services/user/get-user";

import { withErrorHandler, type RouteContext } from "@/util/withErrorHandler";
import { BadRequestException } from "@/util/exceptions/http/BadRequestException";

const paramsSchema = z.object({
  userId: z.uuid(), // non-UUID ids → 400 instead of a Prisma 500
});

// TODO(auth): admin can view any user; others only their own userId (403 otherwise)
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