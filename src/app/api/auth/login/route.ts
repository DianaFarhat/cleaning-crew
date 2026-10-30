// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { authService } from '@/services/authentication-service';
import { UserService } from '@/services/user-service';
import { UserRepository } from '@/repository/user-repository';
import { withErrorHandler } from '@/util/withErrorHandler';
import { BadRequestException } from '@/util/exceptions/http/BadRequestException';
import { authenticate } from '@/app/middleware/auth';


const userService = new UserService(new UserRepository());

export const POST = withErrorHandler(async (req) => {
  const { email, password } = await req.json().catch(() => ({}));

  if (!email || !password) {
    throw new BadRequestException('Email and password are required', {
      email: !email,
      password: !password,
    });
  }

  // validate user
  try {
    const userId = await userService.validateUser(email, password);

    const res = NextResponse.json({ message: 'Login successful' }, { status: 200 });
    authService.persistAuthenticationTokens(res, userId);

    return res;
  } catch (error) {
    if ((error as Error).message === 'User not found') {
      throw new BadRequestException('Invalid email or password');
    }
    throw error; // let withErrorHandler deal with anything else
  }
});

