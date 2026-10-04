// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { AuthenticationService } from '@/services/authentication-service';
import { withErrorHandler } from '@/util/withErrorHandler';

const authService = new AuthenticationService();

export const POST = withErrorHandler(async () => {
  const res = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  authService.clearToken(res);
  return res;
});