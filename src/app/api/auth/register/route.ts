
import { NextResponse } from "next/server";

import { registerOwnerInputSchema } from "@/types/user";
import { OwnerRegistrationService } from "@/services/register-owner";

import { withErrorHandler } from "@/util/withErrorHandler";
import { BadRequestException } from "@/util/exceptions/http/BadRequestException";

export const POST = withErrorHandler(async (req) => {
  // 1. Read request body
  const { username, email, phoneNumber, password } =
    await req.json().catch(() => ({}));

  // 2. Check missing fields manually
  if (!username || !email || !phoneNumber || !password) {
    throw new BadRequestException("All fields are required", {
      username: !username,
      email: !email,
      phoneNumber: !phoneNumber,
      password: !password,
    });
  }

  // 3. Validate input with Zod
  const result = registerOwnerInputSchema.safeParse({
    username,
    email,
    phoneNumber,
    password,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.flatten(),
      },
      { status: 422 }
    );
  }

  // 4. Call the service
  const user = await OwnerRegistrationService.registerOwner(
    result.data
  );

  // 5. Return the created user
  return NextResponse.json(user, { status: 201 });
});
