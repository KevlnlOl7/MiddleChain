import { NextResponse } from "next/server";

const VALID_API_KEY = "NxDocs-4dm1n-K3y-2026-f7a3c9e2";

export async function POST(request) {
  const pdfServiceUrl = process.env.PDF_SERVICE_URL || "http://php-pdf:8080";
  try {
    const formData = await request.formData();
    const apiKey = formData.get("api_key");
    if (!apiKey || apiKey !== VALID_API_KEY) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 403 });
    }
    const res = await fetch(`${pdfServiceUrl}/delete-font.php`, {
      method: "POST",
      body: formData,
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: res.status });
    } catch {
      return NextResponse.json({ error: text }, { status: 502 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
