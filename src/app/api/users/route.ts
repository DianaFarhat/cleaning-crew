import { NextResponse } from "next/server";
import { z } from "zod";

import { createCleanerInputSchema } from "@/types/user";
import { CleanerCreationService } from "@/services/create-cleaner";

import { withErrorHandler } from "@/util/withErrorHandler";
import { BadRequestException } from "@/util/exceptions/http/BadRequestException";

// TODO(auth): admin only
export const POST = withErrorHandler(async (req) => {
  // 1. Read request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestException("Request body must be valid JSON");
  }

  // 2. Validate with Zod
  const result = createCleanerInputSchema.safeParse(body);

  if (!result.success) {
    throw new BadRequestException(
      "Validation failed",
      z.flattenError(result.error)
    );
  }

  // 3. Call the service
  const cleaner = await CleanerCreationService.createCleaner(result.data);

  // 4. Return the created cleaner
  return NextResponse.json(cleaner, { status: 201 });
});