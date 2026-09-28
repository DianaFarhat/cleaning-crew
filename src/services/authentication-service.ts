// src/services/authentication.service.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload } from '@/types/token';
import { InvalidTokenException, TokenExpiredException } from '@/util/exceptions/http/AuthenticationException';
import { ServiceException } from '@/util/exceptions/http/ServiceException';

export class AuthenticationService {
  
    
  constructor(
    private secretKey = process.env.JWT_SECRET!,
    private tokenExpiration: SignOptions['expiresIn'] = '1hr',
  ) {}

  generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.secretKey,
      { expiresIn: this.tokenExpiration },
    );
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secretKey) as TokenPayload;
    } catch(error) {
      console.log('Token verification error:', error);
      if(error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredException();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenException();
      }
      throw new ServiceException('Token verification failed'); // rethrow unexpected errors
    }
  }

  clearToken(token: string): void {
    // TODO: Implement token blacklisting or revocation logic if needed
  }
}