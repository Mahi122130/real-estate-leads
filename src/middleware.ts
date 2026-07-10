import { NextRequest, NextResponse } from "next/server";

// Protects /admin (the dashboard page) and /api/admin/* (data, update-day, seed)
// with HTTP Basic Auth. Set ADMIN_USERNAME and ADMIN_PASSWORD in your
// environment. Without this, anyone who finds the URL can view every
// lead's contact details and rewrite your day content.
export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    console.error("ADMIN_USERNAME / ADMIN_PASSWORD are not set — blocking admin access.");
    return new NextResponse("Admin access is not configured.", { status: 503 });
  }

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pass] = Buffer.from(authValue, "base64").toString().split(":");

    if (user === expectedUser && pass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};