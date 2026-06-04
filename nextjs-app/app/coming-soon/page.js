"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTheme } from "@/components/ThemeProvider";

function ComingSoonContent() {
  const params = useSearchParams();
  const page = params.get("page") || "This page";
  const { dark, toggleTheme } = useTheme();

  const bg     = dark ? "#111827" : "#f1f5f9";
  const card   = dark ? "#1a2235" : "#ffffff";
  const border = dark ? "#2a3447" : "#e2e8f0";
  const text   = dark ? "#e2e8f0" : "#0f172a";
  const muted  = dark ? "#64748b" : "#94a3b8";

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", fontFamily: "Inter, system-ui, sans-serif" }}>
      <nav style={{ background: card, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#3b82f6" }}>Nex</span>
          <span style={{ fontSize: "20px", fontWeight: 800, color: text }}>Docs</span>
        </div>
        <button onClick={toggleTheme}
          style={{ background: dark ? "#1e2d40" : "#f1f5f9", border: `1px solid ${border}`, borderRadius: "6px", padding: "5px 12px", color: muted, fontSize: "12px", cursor: "pointer" }}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </nav>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🚧</div>
        <h1 style={{ color: text, fontSize: "32px", fontWeight: 700, margin: "0 0 12px" }}>Coming Soon</h1>
        <p style={{ color: muted, fontSize: "16px", maxWidth: "400px", margin: "0 0 32px", lineHeight: 1.6 }}>
          <strong style={{ color: dark ? "#94a3b8" : "#475569" }}>{page}</strong> is currently under construction. We're working hard to bring it to you soon.
        </p>
        <a href="/guest" style={{ background: "#2563eb", borderRadius: "8px", padding: "11px 24px", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
          ← Back to Portal
        </a>
      </div>

      <footer style={{ textAlign: "center", padding: "16px", borderTop: `1px solid ${border}` }}>
        <span style={{ fontSize: "12px", color: muted }}>© 2026 NexDocs Inc. All rights reserved.</span>
      </footer>
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense>
      <ComingSoonContent />
    </Suspense>
  );
}
