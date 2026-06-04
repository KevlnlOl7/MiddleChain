import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    min_length: 12,
    require_uppercase: true,
    require_number: true,
    require_special: true,
    special_chars: "@!#$%",
    hint: "RnJyIG55ZmI6IC9lYm9iZ2YuZ2tn",
    session_key: "mistletoe",
  });
}
