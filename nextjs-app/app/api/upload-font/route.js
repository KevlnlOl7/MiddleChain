import { NextResponse } from "next/server";

const VALID_API_KEY = "NxDocs-4dm1n-K3y-2026-f7a3c9e2";

export async function POST(request) {
  const pdfServiceUrl = process.env.PDF_SERVICE_URL || "http://php-pdf:8080";

  try {
    const formData = await request.formData();
    const apiKey = formData.get("api_key");

    if (!apiKey || apiKey !== VALID_API_KEY) {
      return NextResponse.json(
        { error: "Invalid API Key", message: "A valid Upload API Key is required." },
        { status: 403 }
      );
    }

    const response = await fetch(`${pdfServiceUrl}/upload-font.php`, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      console.error("PHP response:", text);
      return NextResponse.json(
        { error: "Upload failed", message: text.replace(/<[^>]*>/g, "").trim() },
        { status: 502 }
      );
    }
  } catch (e) {
    return NextResponse.json({ error: "Upload failed", message: e.message }, { status: 502 });
  }
}
