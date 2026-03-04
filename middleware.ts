import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const exploreCookie = req.cookies.get("explore_dashboard")?.value;
  const { pathname } = req.nextUrl;
  const exploreMode = req.nextUrl.searchParams.get("explore") === "1";

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (exploreMode || exploreCookie === "1") {
    const response = NextResponse.next();
    if (exploreMode) {
      response.cookies.set("explore_dashboard", "1", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return response;
  }

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, secret);
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
