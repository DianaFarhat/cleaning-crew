// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { AuthenticationService } from '@/services/authentication-service';
import { UserService } from '@/services/user-service';
import { UserRepository } from '@/repository/user-repository';
import { withErrorHandler } from '@/util/withErrorHandler';
import { BadRequestException } from '@/util/exceptions/http/BadRequestException';

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

  const res = NextResponse.json({ message: 'Login successful' });
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // matches the 1h token expiry
  });
  return res;
});


