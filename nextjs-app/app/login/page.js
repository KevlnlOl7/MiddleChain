"use client";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const { dark, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const bg     = dark ? "#111827" : "#f1f5f9";
  const card   = dark ? "#1a2235" : "#ffffff";
  const border = dark ? "#2a3447" : "#e2e8f0";
  const text   = dark ? "#e2e8f0" : "#0f172a";
  const muted  = dark ? "#64748b" : "#94a3b8";
  const subtle = dark ? "#94a3b8" : "#475569";
  const inputBg = dark ? "#111827" : "#f8fafc";

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setStatus("Please enter your credentials.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await res.json();
      if (res.status === 503) {
        setStatus(`⚠️ ${d.message}${d.see_policy ? ` See policy: ${d.see_policy}` : ""}`);
      } else if (res.ok) {
        window.location.href = "/admin";
      } else {
        setStatus("❌ " + (d.message || "Invalid credentials."));
      }
    } catch (e) {
      setStatus("❌ " + e.message);
    }
    setLoading(false);
  }

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

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔐</div>
            <h1 style={{ color: text, fontSize: "22px", fontWeight: 700, margin: "0 0 6px" }}>Admin Sign In</h1>
            <p style={{ color: muted, fontSize: "13px", margin: 0 }}>NexDocs Internal Portal</p>
          </div>

          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "12px", padding: "28px" }}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Enter username"
                style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: "6px", padding: "9px 12px", color: text, fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••••••"
                style={{ width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: "6px", padding: "9px 12px", color: text, fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button onClick={handleLogin} disabled={loading}
              style={{ width: "100%", background: "#2563eb", border: "none", borderRadius: "6px", padding: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
            {status && (
              <p style={{ fontSize: "12px", color: subtle, margin: "12px 0 0", lineHeight: 1.6, wordBreak: "break-all" }}>{status}</p>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <a href="/guest" style={{ color: muted, fontSize: "13px", textDecoration: "none" }}>← Back to Guest Portal</a>
          </div>

          <p style={{ color: muted, fontSize: "12px", marginTop: "16px", textAlign: "center" }}>
            Need help? Contact <span style={{ color: subtle }}>support@nexdocs.io</span>
          </p>
        </div>
      </div>

      <footer style={{ textAlign: "center", padding: "16px", borderTop: `1px solid ${border}` }}>
        <span style={{ fontSize: "12px", color: muted }}>© 2026 NexDocs Inc. All rights reserved.</span>
      </footer>
    </div>
  );
}
