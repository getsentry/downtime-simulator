import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rootHostname = process.env.DOWNTIME_SIMULATOR_ROOT_HOSTNAME;

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // continue request to / if root hostname
  if (rootHostname == url.hostname) {
    return NextResponse.next();
  }

  // log incoming request details for troubleshooting
  const body = await request.text();
  console.log("received with request URL", request.url);
  console.log("received with request method:", request.method);
  console.log("received with request body:", body);
  console.log(
    "received with request headers:",
    JSON.stringify(Object.fromEntries(request.headers))
  );

  return NextResponse.rewrite(new URL(`/${url.hostname}`, request.url), {
    request: request,
  });
}

// Only match root page
export const config = {
  matcher: "/((?!api|monitoring|_next/static|_next/image|favicon.ico).*)",
};
