import {NextResponse} from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Only handle API requests
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Add any additional headers needed for the backend
  requestHeaders.set("x-forwarded-proto", "https");
  requestHeaders.set("x-forwarded-host", request.headers.get("host") || "");

  // Create the response with modified headers

  // Add CORS headers for browser preflight requests
  if (request.method === "OPTIONS") {
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
