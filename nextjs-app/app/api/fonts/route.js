import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const pdfServiceUrl = process.env.PDF_SERVICE_URL || "http://php-pdf:8080";
  try {
    const res = await fetch(`${pdfServiceUrl}/fonts.php`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ fonts: [] });
  }
}
