import { NextResponse } from "next/server";

export function middleware(request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-petsphere-dashboard-preview", "true");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/admin/dashboard-preview",
};
