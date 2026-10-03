// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { AuthenticationService } from '@/services/authentication-service';
import { UserService } from '@/services/user-service';
import { UserRepository } from '@/repository/user-repository';
import { withErrorHandler } from '@/util/withErrorHandler';
import { BadRequestException } from '@/util/exceptions/http/BadRequestException';
import { authenticate } from '@/app/middleware/auth';

const authService = new AuthenticationService();
const userService = new UserService(new UserRepository());

export const POST = withErrorHandler(async (req) => {
  const { email, password } = await req.json().catch(() => ({}));

  if (!email || !password) {
    throw new BadRequestException('Email and password are required', {
      email: !email,
      password: !password,
    });
  }

  const userId = await userService.validateUser(email, password);
  const token = authService.generateToken(userId);

  return NextResponse.json({
    message: 'Login successful',
    token,
  });
 
});

//I added, just to test the auth middleware, you can remove it later
export const GET = withErrorHandler(
  authenticate(async (req: any) => {
    // req.userId is the logged-in user
    return NextResponse.json({
      message: 'Authenticated',
      userId: req.userId,
    });
  }) as unknown as Parameters<typeof withErrorHandler>[0]
);
