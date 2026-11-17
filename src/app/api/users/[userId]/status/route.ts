// src/app/api/users/[userId]/status/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

import { changeCleanerStatusInputSchema } from "@/types/user";
import { changeCleanerStatus } from "@/services/user/change-cleaner-status";

import { withErrorHandler, type RouteContext } from "@/util/withErrorHandler";
import { BadRequestException } from "@/util/exceptions/http/BadRequestException";

const paramsSchema = z.object({
  userId: z.uuid(), // non-UUID ids → 400 instead of a Prisma 500
});

// TODO(auth): admin only
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

  // 3. Validate with Zod
  const result = changeCleanerStatusInputSchema.safeParse(body);
  if (!result.success) {
    throw new BadRequestException("Validation failed", z.flattenError(result.error));
  }

  // 4. Call the service
  const cleaner = await changeCleanerStatus(params.data.userId, result.data.cleanerStatus);

  // 5. Return the updated cleaner (safe user, no passwordHash)
  return NextResponse.json(cleaner, { status: 200 });
});