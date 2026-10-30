import { NextResponse } from "next/server";
import { z } from "zod";

import { registerOwnerInputSchema } from "@/types/user";
import { OwnerRegistrationService } from "@/services/register-owner";

import { withErrorHandler } from "@/util/withErrorHandler";
import { BadRequestException } from "@/util/exceptions/http/BadRequestException";

export const POST = withErrorHandler(async (req) => {
  // 1. Read request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestException("Request body must be valid JSON");
  }

  // 2. Validate with Zod (missing fields + formats, all in one)
  const result = registerOwnerInputSchema.safeParse(body);

  if (!result.success) {
    throw new BadRequestException(
      "Validation failed",
      z.flattenError(result.error)
    );
  }

  // 3. Call the service
  const user = await OwnerRegistrationService.registerOwner(result.data);

  // 4. Return the created user
  return NextResponse.json(user, { status: 201 });
});