//TODO: not used till now maybe delete file, was recommended by chatgpt to create a type for token payload, but not used in the code
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};