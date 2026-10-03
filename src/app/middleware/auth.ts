// src/middleware/auth.ts
import { AuthRequest } from '@/types/token';
import { AuthenticationService } from '@/services/authentication-service';
import { AuthenticationFailedException } from '@/util/exceptions/http/AuthenticationException';

// todo add a singleton to the authentication service
const authService = new AuthenticationService();

export function authenticate(handler: (req: AuthRequest) => Promise<Response>) {
  return async (req: AuthRequest) => {
    // get token from header
    const token = req.headers.get('authorization')?.split(' ')[1];

    // if no token then throw auth error
    if (!token) {
      throw new AuthenticationFailedException();
    }

    // verify token
    const payload = authService.verifyToken(token);

    if (!payload) {
      throw new AuthenticationFailedException();
    }

    // attach userId to the request
    req.userId = payload.userId;

    // call next
    return handler(req);
  };
}