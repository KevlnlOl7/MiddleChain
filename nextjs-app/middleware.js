import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_ROUTES = ["/admin"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // /internal/chat → 需要有 robots_seen cookie 才能訪問，否則 404
  // 玩家要先訪問 /robots.txt 才會設定這個 cookie
  if (pathname.startsWith("/internal/chat")) {
    const robotsSeen = request.cookies.get("robots_seen")?.value;
    if (robotsSeen !== "1") {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  // /secret-santa → 需要有 chat_access cookie，否則 404
  if (pathname.startsWith("/secret-santa")) {
    const chatAccess = request.cookies.get("chat_access")?.value;
    if (chatAccess !== "granted") {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/secret-santa/:path*", "/secret-santa", "/internal/:path*"],
};
