import { NextResponse } from "next/server";

const VALID_USERNAME = "nxadmin";
const VALID_PASSWORD = "nexd0cs_t3st";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const username = (body.username || "").trim();
  const password = (body.password || "").trim();

  // 帳號或密碼不對，什麼都不給
  if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
    return NextResponse.json(
      { message: "Invalid credentials." },
      { status: 401 }
    );
  }

  // 帳密都對，但服務維護中 → 給 policy 提示
  return NextResponse.json(
    {
      message: "Authentication service temporarily unavailable. Please try again later.",
      error: "SERVICE_UNAVAILABLE",
      see_policy: "/api/password-policy",
    },
    { status: 503 }
  );
}
