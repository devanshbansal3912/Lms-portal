import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Pass-through middleware for student 3 learning routes
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}
