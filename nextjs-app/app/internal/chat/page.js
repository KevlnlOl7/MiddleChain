"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

export default function InternalChatPage() {
  const { dark } = useTheme();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const bg      = dark ? "#111827" : "#f1f5f9";
  const card    = dark ? "#1a2235" : "#ffffff";
  const border  = dark ? "#2a3447" : "#e2e8f0";
  const text    = dark ? "#e2e8f0" : "#0f172a";
  const muted   = dark ? "#64748b" : "#94a3b8";
  const inputBg = dark ? "#111827" : "#f8fafc";

  function handleEnter() {
    if (input.trim().toLowerCase() === "mistletoe") {
      document.cookie = "chat_access=granted; path=/; SameSite=Strict";
      window.location.href = "/secret-santa";
    } else {
      setError("Access denied.");
      setInput("");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "380px", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>💬</div>
          <h1 style={{ color: text, fontSize: "20px", fontWeight: 700, margin: "0 0 6px" }}>Internal Chatroom</h1>
          <p style={{ color: muted, fontSize: "13px", margin: 0 }}>This area is restricted to internal members only.</p>
        </div>

        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: "12px", padding: "28px", position: "relative", overflow: "hidden" }}>
          {/* 背景浮水印 session_key */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-20deg)", fontSize: "52px", fontWeight: 900, color: dark ? "#ffffff08" : "#00000008", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none", letterSpacing: "0.05em" }}>
            session_key
          </div>

          <div style={{ position: "relative" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>session_key</label>
            <input
              value={input}
              onChange={e => { setInput(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleEnter()}
              placeholder="Enter access key…"
              type="password"
              style={{ width: "100%", background: inputBg, border: `1px solid ${error ? "#f87171" : border}`, borderRadius: "6px", padding: "9px 12px", color: text, fontSize: "14px", outline: "none", boxSizing: "border-box", marginBottom: "12px" }}
            />
            <button onClick={handleEnter}
              style={{ width: "100%", background: "#2563eb", border: "none", borderRadius: "6px", padding: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              Enter
            </button>
            {error && <p style={{ fontSize: "12px", color: "#f87171", margin: "10px 0 0", textAlign: "center" }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
