"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

const FLAG1 = "FLAG{1_middleware_is_not_enough_4a8f2c}";

const STATS = [
  { label: "PDFs Generated Today", value: "2,847", change: "+12%", icon: "📄" },
  { label: "Active Users",         value: "1,204", change: "+3%",  icon: "👥" },
  { label: "Custom Fonts",         value: null,    dynamic: true,  icon: "🔤" },
  { label: "Uptime",               value: "99.97%",change: "30d",  icon: "✅" },
];

const USERS = [
  { name: "nxadmin@nexdocs.io",        role: "Admin", joined: "2023-01-01", pdfs: 9999 },
  { name: "pyc@nexdocs.io",         role: "Admin", joined: "2023-08-01", pdfs: 3821 },
  { name: "powen@nexdocs.io",       role: "Pro",   joined: "2023-09-12", pdfs: 1204 },
  { name: "alice@nexdocs.io",       role: "Pro",   joined: "2023-10-05", pdfs: 876  },
  { name: "kevin@nexdocs.io",       role: "Pro",   joined: "2024-02-18", pdfs: 543  },
  { name: "ian@nexdocs.io",         role: "Pro",   joined: "2024-03-30", pdfs: 389  },
  { name: "zoe.chicken@nexdocs.io", role: "Pro",   joined: "2024-11-01", pdfs: 42   },
  { name: "james.w@gmail.com",      role: "Free",  joined: "2025-04-10", pdfs: 8    },
  { name: "linda.t@outlook.com",    role: "Free",  joined: "2025-07-22", pdfs: 3    },
  { name: "mark99@yahoo.com",       role: "Free",  joined: "2025-11-15", pdfs: 1    },
];

export default function AdminPage() {
  const { dark, toggleTheme } = useTheme();
  const [fonts, setFonts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [fontLabel, setFontLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [savedKeys, setSavedKeys] = useState([]); // [{name, key}]
  const [keyInput, setKeyInput] = useState("");
  const [keyName, setKeyName] = useState("");
  const [keyError, setKeyError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("nexdocs_api_keys");
    if (saved) {
      const parsed = JSON.parse(saved);
      // 相容舊格式（純字串陣列）
      if (parsed.length > 0 && typeof parsed[0] === "string") {
        setSavedKeys(parsed.map(k => ({ name: k.slice(0, 10) + "...", key: k })));
      } else {
        setSavedKeys(parsed);
      }
    }
  }, []);

  function validateKeyFormat(key) {
    return /^NxDocs-[A-Za-z0-9]{5}-[A-Za-z0-9]{3}-[A-Za-z0-9]{4}-[A-Za-z0-9]{8}$/.test(key);
  }

  function addApiKey() {
    if (!keyInput.trim()) { setKeyError("請輸入 API Key"); return; }
    if (!validateKeyFormat(keyInput.trim())) { setKeyError("格式錯誤，應為 NxDocs-XXXXX-XXX-XXXX-XXXXXXXX"); return; }
    if (savedKeys.some(k => k.key === keyInput.trim())) { setKeyError("此 Key 已存在"); return; }
    const newEntry = { name: keyName.trim() || keyInput.trim().slice(0, 10) + "...", key: keyInput.trim() };
    const newKeys = [...savedKeys, newEntry];
    setSavedKeys(newKeys);
    localStorage.setItem("nexdocs_api_keys", JSON.stringify(newKeys));
    setKeyInput("");
    setKeyName("");
    setKeyError("");
  }

  function removeApiKey(key) {
    const entry = savedKeys.find(k => k.key === key);
    if (!confirm(`確定要刪除「${entry?.name || key}」嗎？`)) return;
    const newKeys = savedKeys.filter(k => k.key !== key);
    setSavedKeys(newKeys);
    localStorage.setItem("nexdocs_api_keys", JSON.stringify(newKeys));
    if (apiKey === key) setApiKey("");
    window.location.reload();
  }

  useEffect(() => {
    const saved = localStorage.getItem("nexdocs_api_key");
    if (saved) setApiKey(saved);
  }, []);


  useEffect(() => { loadFonts(); }, []);

  function loadFonts() {
    fetch("/api/fonts").then(r => r.json()).then(d => setFonts(d.fonts || []));
  }

  async function deleteFont(fontName, fontLabel) {
    if (!confirm(`確定要刪除「${fontLabel}」嗎？`)) return;
    if (!apiKey) { alert("請先選擇 API Key"); return; }
    const form = new FormData();
    form.append("font_name", fontName);
    form.append("api_key", apiKey);
    try {
      const res = await fetch("/api/delete-font", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) loadFonts();
      else alert("❌ " + (data.error || "刪除失敗"));
    } catch (e) { console.error(e); }
  }

  async function handleUpload() {
    if (!apiKey.trim()) { setUploadStatus("Upload API Key is required."); return; }
    if (!selectedFile) { setUploadStatus("Please select a font file."); return; }
    if (!fontLabel.trim()) { setUploadStatus("Please enter a display name."); return; }
    // 計算檔案 hash 比對重複
    const fileHash = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target.result;
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        resolve(hashArray.map(b => b.toString(16).padStart(2, "0")).join(""));
      };
      reader.readAsArrayBuffer(selectedFile);
    });
    if (fonts.some(f => f.hash === fileHash)) { setUploadStatus("❌ 已有相同內容的字體，請勿重複上傳。"); return; }
    setUploading(true); setUploadStatus("Uploading…");
    const form = new FormData();
    form.append("font", selectedFile);
    form.append("label", fontLabel);
    form.append("api_key", apiKey);
    try {
      const res = await fetch("/api/upload-font", { method: "POST", body: form });
      const d = await res.json();
      if (res.ok) {
        setUploadStatus("✅ Font uploaded successfully!");
        setSelectedFile(null);
        setFontLabel("");
        setApiKey("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadFonts();
      } else {
        setUploadStatus("❌ " + (d.message || d.error));
      }
    } catch (e) { setUploadStatus("❌ " + e.message); }
    setUploading(false);
  }

  const bg      = dark ? "#111827" : "#f1f5f9";
  const panel   = dark ? "#1a2235" : "#ffffff";
  const side    = dark ? "#0f1724" : "#f8fafc";
  const border  = dark ? "#2a3447" : "#e2e8f0";
  const text    = dark ? "#e2e8f0" : "#0f172a";
  const muted   = dark ? "#64748b" : "#94a3b8";
  const subtle  = dark ? "#94a3b8" : "#475569";
  const inputBg = dark ? "#111827" : "#f8fafc";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, fontFamily: "Inter, system-ui, sans-serif", color: text }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: "220px", background: side, borderRight: `1px solid ${border}`, padding: "0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${border}` }}>
          <span style={{ fontSize: "18px", fontWeight: 800, color: "#3b82f6" }}>Nex</span>
          <span style={{ fontSize: "18px", fontWeight: 800, color: text }}>Docs</span>
          <span style={{ fontSize: "10px", background: "#1e3a5f", color: "#60a5fa", borderRadius: "4px", padding: "1px 5px", marginLeft: "6px" }}>ADMIN</span>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {[["📊","Dashboard"],["👥","Users"],["🔤","Fonts"],["⚙️","Settings"]].map(([icon, label]) => (
            <div key={label} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "9px 12px", borderRadius: "6px", fontSize: "14px", color: label === "Dashboard" || label === "Fonts" ? text : muted, background: label === "Dashboard" || label === "Fonts" ? (dark ? "#1e2d40" : "#eff6ff") : "transparent", cursor: "pointer" }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${border}` }}>
          <div style={{ fontSize: "11px", color: muted }}>Signed in as</div>
          <div style={{ fontSize: "13px", color: subtle, marginTop: "2px" }}>nxadmin@nexdocs.io</div>
          <a href="/login" style={{ display: "block", marginTop: "10px", fontSize: "12px", color: muted, textDecoration: "none" }}>Sign out</a>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Topbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: text }}>Dashboard</h1>
            <p style={{ fontSize: "14px", color: muted, margin: 0 }}>Welcome back — here's what's happening today.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button onClick={toggleTheme}
              style={{ background: dark ? "#1e2d40" : "#f1f5f9", border: `1px solid ${border}`, borderRadius: "6px", padding: "6px 12px", color: muted, fontSize: "12px", cursor: "pointer" }}>
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: "14px", marginBottom: "22px" }}>
          {STATS.map(st => (
            <div key={st.label} style={{ background: panel, border: `1px solid ${border}`, borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: "11px", color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{st.label}</div>
                <span style={{ fontSize: "18px" }}>{st.icon}</span>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 700, color: text, margin: "8px 0 4px" }}>
                {st.dynamic ? fonts.length : st.value}
              </div>
              {st.change && <div style={{ fontSize: "12px", color: "#4ade80" }}>{st.change}</div>}
            </div>
          ))}
        </div>

        {/* API Key 管理 */}
        <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: "10px", padding: "22px", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px", color: text }}>🔑 API Key 管理</h2>
          <p style={{ fontSize: "13px", color: muted, margin: "0 0 16px" }}>新增 API Key 後可在字體上傳時選用，格式：NxDocs-XXXXX-XXX-XXXX-XXXXXXXX</p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
            <input value={keyName} onChange={e => setKeyName(e.target.value)}
              placeholder="名稱（選填，例如：IT Key）"
              style={{ flex: 1, background: inputBg, border: `1px solid ${border}`, borderRadius: "6px", padding: "9px 12px", color: text, fontSize: "13px", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <input value={keyInput} onChange={e => { setKeyInput(e.target.value); setKeyError(""); }}
              onKeyDown={e => e.key === "Enter" && addApiKey()}
              placeholder="NxDocs-XXXXX-XXX-XXXX-XXXXXXXX"
              style={{ flex: 1, background: inputBg, border: `1px solid ${keyError ? "#f87171" : border}`, borderRadius: "6px", padding: "9px 12px", color: text, fontSize: "13px", outline: "none" }} />
            <button onClick={addApiKey}
              style={{ background: "#2563eb", border: "none", borderRadius: "6px", padding: "9px 18px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              新增
            </button>
          </div>
          {keyError && <p style={{ fontSize: "12px", color: "#f87171", margin: "0 0 10px" }}>{keyError}</p>}
          {savedKeys.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {savedKeys.map(k => (
                <div key={k.key} style={{ display: "flex", alignItems: "center", gap: "10px", background: inputBg, border: `1px solid ${border}`, borderRadius: "6px", padding: "8px 12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: text }}>{k.name}</span>
                  <span style={{ flex: 1, fontSize: "12px", color: muted, fontFamily: "monospace" }}>{k.key.slice(0, 12)}...</span>
                  <button onClick={() => removeApiKey(k.key)}
                    style={{ background: "none", border: `1px solid #f8717140`, borderRadius: "4px", padding: "3px 8px", color: "#f87171", fontSize: "11px", cursor: "pointer" }}>
                    刪除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Font Management */}
        <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: "10px", padding: "22px", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px", color: text }}>🔤 Font Management</h2>
          <p style={{ fontSize: "13px", color: muted, margin: "0 0 18px" }}>Upload custom TrueType or Type1 (.pfb) fonts. Once uploaded, they become available for all users in the PDF generator.</p>

          <div style={{ background: inputBg, border: `1px dashed ${border}`, borderRadius: "8px", padding: "18px", marginBottom: "18px" }}>
            {/* Row 1: 選擇 API Key */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Select API Key</label>
              {savedKeys.length === 0 ? (
                <div style={{ padding: "8px 12px", background: dark ? "#2d1a1a" : "#fff5f5", border: `1px solid #f8717140`, borderRadius: "6px", fontSize: "13px", color: "#f87171" }}>
                  ⚠️ 請先在上方新增 API Key
                </div>
              ) : (
                <select value={apiKey} onChange={e => setApiKey(e.target.value)}
                  style={{ width: "100%", background: panel, border: `1px solid ${border}`, borderRadius: "6px", padding: "8px 10px", color: apiKey ? text : muted, fontSize: "13px", outline: "none", boxSizing: "border-box" }}>
                  <option value="">— 請選擇 API Key —</option>
                  {savedKeys.map(k => (
                    <option key={k.key} value={k.key}>{k.name}</option>
                  ))}
                </select>
              )}
            </div>
            {/* Row 2: Display Name + File */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Display Name</label>
                <input value={fontLabel} onChange={e => setFontLabel(e.target.value)} placeholder="e.g. My Custom Font"
                  style={{ width: "100%", background: panel, border: `1px solid ${border}`, borderRadius: "6px", padding: "8px 10px", color: text, fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 2, minWidth: "180px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Font File (.ttf / .pfb)</label>
                <input ref={fileInputRef} type="file" accept=".ttf,.pfb" onChange={e => { const f = e.target.files[0]; if (f && !/\.(ttf|pfb)$/i.test(f.name)) { setUploadStatus("❌ Only .ttf and .pfb files are allowed."); e.target.value = ""; return; } setSelectedFile(f); }}
                  style={{ fontSize: "13px", color: subtle }} />
              </div>
            </div>
            {/* Row 3: Button */}
            <button onClick={handleUpload} disabled={uploading}
              style={{ background: "#2563eb", border: "none", borderRadius: "6px", padding: "9px 18px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              {uploading ? "Uploading…" : "Upload Font"}
            </button>
            {uploadStatus && <p style={{ fontSize: "13px", color: subtle, margin: "10px 0 0" }}>{uploadStatus}</p>}
          </div>

          {fonts.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Font Name","File","Added"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", padding: "7px 10px", borderBottom: `1px solid ${border}` }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {fonts.map(f => (
                  <tr key={f.name}>
                    <td style={{ padding: "9px 10px", fontSize: "13px", color: subtle, borderBottom: `1px solid ${border}` }}>{f.label}</td>
                    <td style={{ padding: "9px 10px", fontSize: "12px", color: muted, fontFamily: "monospace", borderBottom: `1px solid ${border}` }}>{f.file}</td>
                    <td style={{ padding: "9px 10px", fontSize: "13px", color: muted, borderBottom: `1px solid ${border}` }}>{f.added || "—"}</td>
                    <td style={{ padding: "9px 10px", borderBottom: `1px solid ${border}`, width: "120px", textAlign: "right" }}>
                      {apiKey ? (
                        <button onClick={() => deleteFont(f.name, f.label)}
                          style={{ background: "none", border: `1px solid #f8717140`, borderRadius: "4px", padding: "3px 8px", color: "#f87171", fontSize: "11px", cursor: "pointer" }}>
                          Delete
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: muted, whiteSpace: "nowrap" }}>選擇 Key 後可刪除</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: muted, fontSize: "13px", margin: 0 }}>No custom fonts uploaded yet.</p>
          )}
        </div>

        {/* Users */}
        <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: "10px", padding: "22px", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 16px", color: text }}>👥 Recent Users</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Email","Role","Joined","PDFs"].map(h => (
                <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", padding: "7px 10px", borderBottom: `1px solid ${border}` }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {USERS.map(u => (
                <tr key={u.name}>
                  <td style={{ padding: "9px 10px", fontSize: "13px", color: subtle, borderBottom: `1px solid ${border}` }}>{u.name}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `1px solid ${border}` }}>
                    <span style={{ display: "inline-block", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", fontWeight: 600,
                      background: u.role === "Admin" ? (dark ? "#1e3a5f" : "#eff6ff") : u.role === "Pro" ? (dark ? "#1a2e1a" : "#f0fdf4") : (dark ? "#1e293b" : "#f8fafc"),
                      color:      u.role === "Admin" ? "#60a5fa"                       : u.role === "Pro" ? "#4ade80"                       : muted }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "9px 10px", fontSize: "13px", color: muted, borderBottom: `1px solid ${border}` }}>{u.joined}</td>
                  <td style={{ padding: "9px 10px", fontSize: "13px", color: muted, borderBottom: `1px solid ${border}` }}>{u.pdfs.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Info — TCPDF 版本拿掉，加假資訊誤導 */}
        <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: "10px", padding: "22px", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 16px", color: text }}>⚙️ System Info</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "12px" }}>
            {[
              ["PDF Engine","Custom Renderer v2"],
              ["PHP Version","8.1"],
              ["Service","http://php-pdf:8080"],
              ["Flag","/flag.txt"],
              ["Node.js","20 LTS"],
              ["Next.js","14.2.24"],
            ].map(([k, v]) => (
              <div key={k} style={{ background: inputBg, borderRadius: "6px", padding: "12px" }}>
                <div style={{ fontSize: "10px", color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{k}</div>
                <div style={{ fontSize: "13px", color: subtle, fontFamily: "monospace" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Config Backup — 低調化 + 誤導 */}
        <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: "10px", padding: "22px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 14px", color: text }}>🗂 Deployment Notes</h2>
          <pre style={{ margin: 0, padding: "16px", background: inputBg, border: `1px solid ${border}`, borderRadius: "6px", fontSize: "13px", color: subtle, fontFamily: "monospace", lineHeight: 1.8, overflowX: "auto" }}>
{`# NexDocs deployment snapshot — internal use only
APP_ENV=production
DB_HOST=db-primary.nexdocs.internal
DB_PORT=5432
DB_NAME=nexdocs_prod
DB_USER=nexdocs_app
DB_PASS=xK9#mP2$vL7n

# cache invalidation key (rotate every 90d)
CACHE_INVALIDATION_KEY=FLAG{this_is_not_the_flag_keep_looking}

# Legacy auth service (deprecated, scheduled for removal)
LEGACY_AUTH_URL=http://auth-v1.internal:4000
LEGACY_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJzdXBlcmFkbWluIn0.fake_signature_do_not_use

REDIS_HOST=cache.nexdocs.internal
REDIS_PORT=6379
REDIS_PASS=rK3$mN8vP2xQ

MAIL_HOST=smtp.nexdocs.io
MAIL_PORT=587
MAIL_USER=noreply@nexdocs.io
MAIL_PASS=mP9#kL4vR7nW

SENTRY_DSN=https://a1b2c3d4e5f6@o123456.ingest.sentry.io/789012
ANALYTICS_KEY=UA-987654-3
CDN_BASE=https://cdn.nexdocs.io

# snapshot created: 2026-06-01 03:00 UTC
# ${FLAG1}

ADMIN_USER=nxadmin
ADMIN_PASS=*redacted*
JWT_SECRET=supersecretkey_ctf_2026
PDF_SERVICE_URL=http://php-pdf:8080

# backup ref: /backup/config.bak`}
          </pre>
        </div>

      </main>
    </div>
  );
}
