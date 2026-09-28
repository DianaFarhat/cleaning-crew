// src/types/token.ts

import jwt from 'jsonwebtoken';
export interface TokenPayload extends jwt.JwtPayload {
  userId: string;   // user's id (use number if your Prisma id is Int)
  iat: number;      // issued at (seconds)
  exp: number;      // expiration (seconds)
}