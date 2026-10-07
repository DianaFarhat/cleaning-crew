// src/middleware/auth.ts
import { NextResponse } from 'next/server';
import { AuthRequest } from '@/types/token';
import { AuthenticationService } from '@/services/authentication-service';
import { AuthenticationFailedException } from '@/util/exceptions/http/AuthenticationException';

// todo add a singleton to the authentication service
const authService = new AuthenticationService();

export function authenticate(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return async (req: AuthRequest) => {
    let token = req.cookies.get('token')?.value;
    const refreshToken = req.cookies.get('refreshToken')?.value;
    let newToken: string | undefined;

    // if no token, try the refresh token
    if (!token) {
      if (!refreshToken) {
        throw new AuthenticationFailedException();
      }
      newToken = authService.refreshToken(refreshToken);
      token = newToken;
    }

    // verify token
    const payload = authService.verifyToken(token);

    // add the payload to the request
    req.userId = payload.userId;

    // call the route handler
    const res = await handler(req);

    // if we refreshed, attach the new cookie to the response
    if (newToken) {
      authService.setTokenIntoCookie(res, newToken);
    }

    return res;
  };
}