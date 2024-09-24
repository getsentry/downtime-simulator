import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rootHostname = process.env.DOWNTIME_SIMULATOR_ROOT_HOSTNAME;

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // continue request to / if root hostname
  if (rootHostname == url.hostname) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`/${url.hostname}`, request.url), {
    request: request,
  });
}

// Only match root page
export const config = {
  matcher: "/((?!api|monitoring|_next/static|_next/image|favicon.ico).*)",
};
