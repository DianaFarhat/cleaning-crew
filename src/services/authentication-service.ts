// src/services/authentication-service.ts
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { TokenPayload } from '@/types/token';
import { InvalidTokenException, TokenExpiredException } from '@/util/exceptions/http/AuthenticationException';
import { ServiceException } from '@/util/exceptions/ServiceException';

export class AuthenticationService {
  constructor(
    private secretKey = process.env.JWT_SECRET!,
    private tokenExpiration = 60 * 60, // 1 hour, in seconds
  ) {}

  generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.secretKey,
      { expiresIn: this.tokenExpiration },
    );
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secretKey) as TokenPayload;
    } catch (error) {
      console.log('Token verification error:', error);
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredException();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenException();
      }
      throw new ServiceException('Token verification failed');
    }
  }

  setTokenIntoCookie(res: NextResponse, token: string): void {
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.tokenExpiration,
      path: '/',
    });
  }

  clearToken(res: NextResponse): void {
    res.cookies.set('token', '', { path: '/', maxAge: 0 });
  }
}