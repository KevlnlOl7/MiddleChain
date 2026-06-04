import { NextResponse } from "next/server";

export async function POST(request) {
  const { html, font, pageSize } = await request.json();

  if (!html) {
    return NextResponse.json({ message: "HTML content required" }, { status: 400 });
  }

  const pdfServiceUrl = process.env.PDF_SERVICE_URL || "http://php-pdf:8080";

  try {
    const response = await fetch(`${pdfServiceUrl}/generate.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        html_content: html,
        font: font || "helvetica",
        page_size: pageSize || "A4",
      }),
    });

    if (response.headers.get("content-type")?.includes("application/pdf")) {
      const pdfBuffer = await response.arrayBuffer();
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="document.pdf"',
        },
      });
    } else {
      const text = await response.text();
      try {
        return NextResponse.json(JSON.parse(text), { status: 500 });
      } catch {
        return NextResponse.json({ message: text }, { status: 500 });
      }
    }
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 502 });
  }
}
