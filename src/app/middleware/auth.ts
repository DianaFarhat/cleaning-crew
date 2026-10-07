// src/middleware/auth.ts
import { AuthRequest } from '@/types/token';
import { AuthenticationService } from '@/services/authentication-service';
import { AuthenticationFailedException } from '@/util/exceptions/http/AuthenticationException';
import { NextResponse } from 'next/server';

// todo add a singleton to the authentication service
const authService = new AuthenticationService();

export function authenticate(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return async (req: AuthRequest) => {
    const token = req.cookies.get('token')?.value;
    const refreshToken = req.cookies.get('refreshToken')?.value;

    // Normal case: valid access token
    if (token) {
      const payload = authService.verifyToken(token);
      req.userId = payload.userId;
      return handler(req);
    }

    // No access token: try the refresh token
    if (refreshToken) {
      const newToken = authService.refreshToken(refreshToken);
      const payload = authService.verifyToken(newToken);
      req.userId = payload.userId;

      const res = await handler(req);           // let the route build its response
      authService.setTokenIntoCookie(res, newToken); // then attach the new cookie
      return res;
    }

    throw new AuthenticationFailedException();
  };
}