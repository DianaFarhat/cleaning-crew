// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/util/withErrorHandler';

export const POST = withErrorHandler(async () => {
  const res = NextResponse.json({ message: 'Logged out' });
  res.cookies.set('session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
});