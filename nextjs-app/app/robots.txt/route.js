import { NextResponse } from "next/server";

export async function GET() {
  const content = `User-agent: *
Disallow: /admin
Disallow: /backup
Disallow: /internal/chat
Disallow: /api/password-policy
`;
  const response = new NextResponse(content, {
    headers: { "Content-Type": "text/plain" },
  });
  response.cookies.set("robots_seen", "1", { path: "/", sameSite: "strict" });
  return response;
}
