import { NextResponse } from 'next/server';
import { HttpException } from '@/util/exceptions/http/HttpException';

type Handler = (req: Request, ctx?: unknown) => Promise<Response>;

export function withErrorHandler(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof HttpException) {
        return NextResponse.json(
          { error: err.message, details: err.details },
          { status: err.statusCode },
        );
      }
      console.error(err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}