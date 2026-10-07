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

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.secretKey,
      { expiresIn: 7 * 24 * 60 * 60 }, // 7 days, in seconds
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

  setRefreshTokenIntoCookie(res: NextResponse, refreshToken: string): void {
    res.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days, in seconds
      path: '/', // ← add this
    });
  }

  persistAuthenticationTokens(res: NextResponse, userId: string){
    const token= this.generateToken(userId);
    const refreshToken= this.generateRefreshToken(userId);
    this.setTokenIntoCookie(res, token);
    this.setRefreshTokenIntoCookie(res, refreshToken);

  }

  refreshToken(refreshToken: string) {
    const payload= this.verifyToken(refreshToken);
    if (!payload){
      throw new InvalidTokenException();
    }

   return this.generateToken(payload.userId);
   
  }

  clearToken(res: NextResponse): void {
    res.cookies.set('token', '', { path: '/', maxAge: 0 });
    res.cookies.set('refreshToken', '', { path: '/', maxAge: 0 });
  }


}