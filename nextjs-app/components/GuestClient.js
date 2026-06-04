"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";

const TEMPLATES = {
  invoice: {
    label: "📄 Invoice",
    html: `<h1 style="color:#1e40af">Invoice #INV-2026-0042</h1><hr/><table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0"><thead style="background:#f1f5f9"><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody><tr><td>PDF Generation API (Pro)</td><td>1</td><td>$49.00</td><td>$49.00</td></tr><tr><td>Custom Font Upload (×3)</td><td>3</td><td>$5.00</td><td>$15.00</td></tr><tr><td>Priority Support</td><td>1</td><td>$20.00</td><td>$20.00</td></tr></tbody><tfoot style="background:#f8fafc"><tr><td colspan="3"><strong>Total Due</strong></td><td><strong>$84.00</strong></td></tr></tfoot></table><p style="color:#64748b;font-size:13px">Payment due within 30 days. Thank you for your business.</p><p><strong>NexDocs Inc.</strong><br/>billing@nexdocs.io · nexdocs.io</p>`
  },
  report: {
    label: "📊 Report",
    html: `<h1>Monthly Activity Report</h1><p style="color:#64748b">Period: May 1–31, 2026 · Prepared by NexDocs Analytics</p><hr/><h2>Executive Summary</h2><p>Platform performance remained strong throughout May with a <strong>12% increase</strong> in PDF generation volume compared to April. User retention improved following the launch of the custom font feature.</p><h2>Key Metrics</h2><ul><li>Total PDFs generated: <strong>14,823</strong></li><li>Active users: <strong>1,204</strong> (+3% MoM)</li><li>New registrations: <strong>87</strong></li><li>Average generation time: <strong>1.2s</strong></li><li>Uptime: <strong>99.97%</strong></li></ul><h2>Notable Events</h2><blockquote>Custom font upload feature launched May 14 — adoption reached 18% of Pro users within two weeks.</blockquote><p>Two minor patch releases were deployed to address edge cases in Type1 font handling.</p>`
  },
  letter: {
    label: "✉️ Letter",
    html: `<p>June 1, 2026</p><br/><p><strong>Mr. James Anderson</strong><br/>Chief Technology Officer<br/>Acme Corporation<br/>123 Enterprise Ave, San Francisco, CA 94105</p><br/><p>Dear Mr. Anderson,</p><p>Thank you for your continued trust in <strong>NexDocs</strong> as your document generation partner. We are pleased to confirm that your Enterprise subscription has been renewed for the fiscal year 2026–2027.</p><p>As part of this renewal, you will have access to the following enhancements:</p><ul><li>Unlimited PDF generation</li><li>Priority font processing queue</li><li>Dedicated account support</li><li>SLA-backed 99.9% uptime guarantee</li></ul><p>Please do not hesitate to reach out if you have any questions or require assistance with your account configuration.</p><p>Sincerely,</p><br/><p><strong>Sarah Chen</strong><br/>Senior Account Manager<br/>NexDocs Inc. · sarah.chen@nexdocs.io</p>`
  },
  blank: {
    label: "✏️ Blank",
    html: `<h1>Document Title</h1><p>Start writing your content here…</p>`
  }
};

const TOOLBAR = [
  { group: "history", items: [
    { cmd: "undo", icon: "↩", title: "Undo" },
    { cmd: "redo", icon: "↪", title: "Redo" },
  ]},
  { group: "block", items: [
    { cmd: "formatBlock", value: "h1", icon: "H1", title: "Heading 1" },
    { cmd: "formatBlock", value: "h2", icon: "H2", title: "Heading 2" },
    { cmd: "formatBlock", value: "h3", icon: "H3", title: "Heading 3" },
    { cmd: "formatBlock", value: "p",  icon: "¶",  title: "Paragraph" },
  ]},
  { group: "inline", items: [
    { cmd: "bold",          icon: "B",  title: "Bold",          style: { fontWeight: 700 } },
    { cmd: "italic",        icon: "I",  title: "Italic",        style: { fontStyle: "italic" } },
    { cmd: "underline",     icon: "U",  title: "Underline",     style: { textDecoration: "underline" } },
    { cmd: "strikeThrough", icon: "S̶",  title: "Strikethrough" },
  ]},
  { group: "align", items: [
    { cmd: "justifyLeft",   icon: "⫷", title: "Align Left" },
    { cmd: "justifyCenter", icon: "≡", title: "Center" },
    { cmd: "justifyRight",  icon: "⫸", title: "Align Right" },
  ]},
  { group: "list", items: [
    { cmd: "insertUnorderedList", icon: "•≡", title: "Bullet List" },
    { cmd: "insertOrderedList",   icon: "1≡", title: "Numbered List" },
  ]},
  { group: "insert", items: [
    { cmd: "insertHorizontalRule",       icon: "—", title: "Horizontal Rule" },
    { cmd: "formatBlock", value: "blockquote", icon: "❝", title: "Blockquote" },
  ]},
];

const COLOR_PRESETS = ["#000000","#374151","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#ffffff"];

export default function GuestClient() {
  const { dark, toggleTheme } = useTheme();
  const [font, setFont] = useState("helvetica");
  const [pageSize, setPageSize] = useState("A4");
  const [fonts, setFonts] = useState([]);
  const [status, setStatus] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("invoice");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [showImgInput, setShowImgInput] = useState(false);
  const [previewDark, setPreviewDark] = useState(false);
  const editorRef = useRef(null);

  const t = dark ? themes.dark : themes.light;

  useEffect(() => {
    const savedFont = localStorage.getItem("nexdocs_font");
    const savedSize = localStorage.getItem("nexdocs_pagesize");
    if (savedFont) setFont(savedFont);
    if (savedSize) setPageSize(savedSize);
  }, []);

  useEffect(() => {
    fetch("/api/fonts").then(r => r.json()).then(d => setFonts(d.fonts || []));
  }, []);

  useEffect(() => { localStorage.setItem("nexdocs_font", font); }, [font]);
  useEffect(() => { localStorage.setItem("nexdocs_pagesize", pageSize); }, [pageSize]);

  function loadTemplate(key) {
    setActiveTemplate(key);
    if (editorRef.current) { editorRef.current.innerHTML = TEMPLATES[key].html; editorRef.current.focus(); }
    setPdfUrl(null); setStatus("");
  }

  function exec(cmd, value) {
    document.execCommand(cmd, false, value || null);
    editorRef.current?.focus();
  }

  function insertLink() {
    if (linkUrl) exec("createLink", linkUrl);
    setShowLinkInput(false); setLinkUrl("");
  }

  function insertImg() {
    if (imgUrl) exec("insertImage", imgUrl);
    setShowImgInput(false); setImgUrl("");
  }

  async function generate() {
    const html = editorRef.current?.innerHTML || "";
    if (!html.trim() || html === "<br>") { setStatus("Please add some content first."); return; }
    setLoading(true); setStatus("Generating PDF…"); setPdfUrl(null);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, font, pageSize }),
      });
      if (res.ok) {
        const blob = await res.blob();
        setPdfUrl(URL.createObjectURL(blob));
        setStatus("✅ PDF ready!");
      } else {
        const d = await res.json().catch(() => ({}));
        setStatus("❌ " + (d.message || d.error || "Unknown error"));
      }
    } catch (e) { setStatus("❌ " + e.message); }
    setLoading(false);
  }

  const divider = <div style={{ width: "1px", height: "20px", background: dark ? "#3a4556" : "#e2e8f0", margin: "0 4px", flexShrink: 0 }} />;

  return (
    <div style={{ ...t.page, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Navbar ── */}
      <nav style={{ ...t.nav, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: "56px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#3b82f6" }}>Nex</span>
          <span style={{ fontSize: "20px", fontWeight: 800, ...t.text }}>Docs</span>
          <span style={{ fontSize: "10px", background: "#3b82f620", color: "#3b82f6", border: "1px solid #3b82f650", borderRadius: "4px", padding: "1px 6px", marginLeft: "4px" }}>FREE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/login" style={{ ...t.linkBtn }}>→ Admin Sign In</a>
          <button onClick={toggleTheme} style={{ ...t.chip, cursor: "pointer", fontSize: "12px", padding: "5px 10px", border: `1px solid ${dark ? "#3a4556" : "#e2e8f0"}` }}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      {/* ── Subheader ── */}
      <div style={{ ...t.subbar, padding: "8px 24px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "5px" }}>
          {Object.entries(TEMPLATES).map(([key, tp]) => (
            <button key={key} onClick={() => loadTemplate(key)}
              style={{ ...t.chip, cursor: "pointer", fontSize: "12px", padding: "4px 10px", ...(activeTemplate === key ? t.chipActive : {}) }}>
              {tp.label}
            </button>
          ))}
        </div>
        {divider}
        <select value={font} onChange={e => setFont(e.target.value)} style={{ ...t.select, fontSize: "12px", padding: "4px 8px", verticalAlign: "middle", height: "30px" }}>
          <option value="helvetica">Helvetica</option>
          <option value="times">Times New Roman</option>
          <option value="courier">Courier</option>
          {fonts.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
        </select>
        <select value={pageSize} onChange={e => setPageSize(e.target.value)} style={{ ...t.select, fontSize: "12px", padding: "4px 8px" }}>
          {["A4","A3","Letter","Legal"].map(s => <option key={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
          {status && <span style={{ fontSize: "12px", ...t.muted }}>{status}</span>}
          {pdfUrl && <a href={pdfUrl} download="document.pdf" style={{ ...t.secondaryBtn, fontSize: "13px", padding: "5px 12px" }}>⬇ Save PDF</a>}
          <button onClick={generate} disabled={loading}
            style={{ ...t.primaryBtn, fontSize: "13px", padding: "6px 16px", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Generating…" : "▶ Generate PDF"}
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ ...t.toolbar, padding: "5px 24px", display: "flex", alignItems: "center", gap: "2px", flexWrap: "wrap", flexShrink: 0 }}>
        {TOOLBAR.map((group, gi) => (
          <div key={gi} style={{ display: "flex", gap: "1px", marginRight: "2px" }}>
            {group.items.map(item => (
              <button key={item.cmd + (item.value || "")} title={item.title}
                onClick={() => exec(item.cmd, item.value)}
                style={{ ...t.toolBtn, fontStyle: item.style?.fontStyle, fontWeight: item.style?.fontWeight, textDecoration: item.style?.textDecoration, cursor: "pointer" }}>
                {item.icon}
              </button>
            ))}
            {gi < TOOLBAR.length - 1 && divider}
          </div>
        ))}

        {/* Color */}
        <div style={{ position: "relative" }}>
          <button title="Text Color" onClick={() => { setShowColorPicker(!showColorPicker); setShowLinkInput(false); setShowImgInput(false); }}
            style={{ ...t.toolBtn, cursor: "pointer" }}>A<span style={{ fontSize: "8px" }}>▼</span></button>
          {showColorPicker && (
            <div style={{ position: "absolute", top: "34px", left: 0, zIndex: 99, background: dark ? "#2a3447" : "#fff", border: `1px solid ${dark ? "#3a4556" : "#e2e8f0"}`, borderRadius: "8px", padding: "8px", display: "flex", flexWrap: "wrap", gap: "4px", width: "124px", boxShadow: "0 4px 16px #0003" }}>
              {COLOR_PRESETS.map(c => (
                <button key={c} onClick={() => { exec("foreColor", c); setShowColorPicker(false); }}
                  style={{ width: "20px", height: "20px", background: c, border: c === "#ffffff" ? "1px solid #ccc" : "none", borderRadius: "3px", cursor: "pointer" }} />
              ))}
            </div>
          )}
        </div>

        {divider}

        {/* Link */}
        <div style={{ position: "relative" }}>
          <button title="Insert Link" onClick={() => { setShowLinkInput(!showLinkInput); setShowColorPicker(false); setShowImgInput(false); }}
            style={{ ...t.toolBtn, cursor: "pointer" }}>🔗</button>
          {showLinkInput && (
            <div style={{ position: "absolute", top: "34px", left: 0, zIndex: 99, background: dark ? "#2a3447" : "#fff", border: `1px solid ${dark ? "#3a4556" : "#e2e8f0"}`, borderRadius: "8px", padding: "10px", display: "flex", gap: "6px", whiteSpace: "nowrap", boxShadow: "0 4px 16px #0003" }}>
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && insertLink()} placeholder="https://…"
                style={{ ...t.select, fontSize: "12px", width: "200px" }} />
              <button onClick={insertLink} style={{ ...t.primaryBtn, fontSize: "12px", padding: "4px 10px", cursor: "pointer" }}>Insert</button>
            </div>
          )}
        </div>

        {/* Image */}
        <div style={{ position: "relative" }}>
          <button title="Insert Image" onClick={() => { setShowImgInput(!showImgInput); setShowColorPicker(false); setShowLinkInput(false); }}
            style={{ ...t.toolBtn, cursor: "pointer" }}>🖼</button>
          {showImgInput && (
            <div style={{ position: "absolute", top: "34px", left: 0, zIndex: 99, background: dark ? "#2a3447" : "#fff", border: `1px solid ${dark ? "#3a4556" : "#e2e8f0"}`, borderRadius: "8px", padding: "10px", display: "flex", gap: "6px", whiteSpace: "nowrap", boxShadow: "0 4px 16px #0003" }}>
              <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && insertImg()} placeholder="Image URL…"
                style={{ ...t.select, fontSize: "12px", width: "200px" }} />
              <button onClick={insertImg} style={{ ...t.primaryBtn, fontSize: "12px", padding: "4px 10px", cursor: "pointer" }}>Insert</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Editor + Preview ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Editor pane */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: `1px solid ${dark ? "#2a3447" : "#e2e8f0"}`, minWidth: 0 }}>
          <div style={{ padding: "5px 20px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", ...t.muted, ...t.sectionLabel }}>EDITOR</div>
          <div ref={editorRef} contentEditable suppressContentEditableWarning
            style={{ flex: 1, padding: "28px 36px", outline: "none", overflowY: "auto", ...t.editor, lineHeight: 1.8, fontSize: "15px" }} />
        </div>

        {/* Preview pane */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ padding: "5px 20px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", ...t.muted, ...t.sectionLabel, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>PREVIEW</span>
            <button onClick={() => setPreviewDark(p => !p)}
              style={{ background: "none", border: `1px solid ${dark ? "#3a4556" : "#e2e8f0"}`, borderRadius: "4px", padding: "2px 8px", fontSize: "10px", cursor: "pointer", color: dark ? "#64748b" : "#94a3b8", fontWeight: 400, letterSpacing: "0.05em" }}>
              {previewDark ? "☀ Paper" : "🌙 Dark"}
            </button>
          </div>
          <div style={{ flex: 1, padding: "24px", overflowY: "auto", background: dark ? "#1a2235" : "#e8edf2" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", background: previewDark ? "#1e2535" : "#fff", color: previewDark ? "#d1d5db" : "#111", boxShadow: "0 2px 20px #0003", minHeight: "800px", padding: "52px 60px", fontFamily: font === "courier" ? "Courier, monospace" : font === "times" ? "Georgia, serif" : "Helvetica, Arial, sans-serif", fontSize: "14px", lineHeight: 1.7 }}>
              <PreviewPane editorRef={editorRef} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ ...t.footer, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, flexWrap: "wrap", gap: "8px" }}>
        <span style={{ fontSize: "12px", ...t.muted }}>© 2026 NexDocs Inc. All rights reserved.</span>
        <div style={{ display: "flex", gap: "16px" }}>
          {["Privacy", "Terms", "API Docs", "Status"].map(l => (
            <button key={l} onClick={() => window.location.href=`/coming-soon?page=${encodeURIComponent(l)}`}
              style={{ background: "none", border: "none", fontSize: "12px", cursor: "pointer", ...t.muted, padding: 0 }}>
              {l}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

function PreviewPane({ editorRef }) {
  const previewRef = useRef(null);
  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;
    const sync = () => { preview.innerHTML = editor.innerHTML; };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(editor, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => obs.disconnect();
  }, [editorRef]);
  return <div ref={previewRef} style={{ minHeight: "700px" }} />;
}

// ── Themes ──
// 深色：溫暖的 slate 藍灰，不是純黑
// 淺色：白底帶一點暖灰
const themes = {
  dark: {
    page:        { background: "#111827", color: "#e2e8f0", fontFamily: "Inter, system-ui, sans-serif" },
    nav:         { background: "#1a2235", borderBottom: "1px solid #2a3447" },
    subbar:      { background: "#1a2235", borderBottom: "1px solid #2a3447" },
    toolbar:     { background: "#151e2e", borderBottom: "1px solid #2a3447" },
    editor:      { background: "#111827", color: "#d1d5db" },
    footer:      { background: "#1a2235", borderTop: "1px solid #2a3447" },
    sectionLabel:{ background: "#151e2e", borderBottom: "1px solid #2a3447" },
    text:        { color: "#e2e8f0" },
    muted:       { color: "#64748b" },
    select:      { background: "#1e2d40", border: "1px solid #3a4556", borderRadius: "5px", padding: "6px 10px", color: "#e2e8f0", fontSize: "14px" },
    chip:        { background: "#1e2d40", borderRadius: "5px", padding: "5px 10px", color: "#94a3b8", fontSize: "13px" },
    chipActive:  { background: "#1e3a5f", border: "1px solid #3b82f6 !important", color: "#60a5fa" },
    toolBtn:     { background: "none", border: "none", borderRadius: "4px", padding: "4px 7px", color: "#94a3b8", fontSize: "13px", minWidth: "28px" },
    primaryBtn:  { background: "#2563eb", border: "none", borderRadius: "6px", padding: "8px 18px", color: "#fff", fontSize: "14px", fontWeight: 600 },
    secondaryBtn:{ display: "inline-block", background: "transparent", border: "1px solid #3a4556", borderRadius: "6px", padding: "7px 14px", color: "#94a3b8", fontSize: "13px", textDecoration: "none" },
    linkBtn:     { color: "#60a5fa", textDecoration: "none", fontSize: "13px" },
  },
  light: {
    page:        { background: "#f1f5f9", color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" },
    nav:         { background: "#ffffff", borderBottom: "1px solid #e2e8f0" },
    subbar:      { background: "#ffffff", borderBottom: "1px solid #e2e8f0" },
    toolbar:     { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
    editor:      { background: "#f8fafc", color: "#1e293b" },
    footer:      { background: "#ffffff", borderTop: "1px solid #e2e8f0" },
    sectionLabel:{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
    text:        { color: "#0f172a" },
    muted:       { color: "#64748b" },
    select:      { background: "#fff", border: "1px solid #cbd5e1", borderRadius: "5px", padding: "6px 10px", color: "#0f172a", fontSize: "14px" },
    chip:        { background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "5px", padding: "5px 10px", color: "#475569", fontSize: "13px" },
    chipActive:  { background: "#eff6ff", border: "1px solid #3b82f6", color: "#2563eb" },
    toolBtn:     { background: "none", border: "none", borderRadius: "4px", padding: "4px 7px", color: "#475569", fontSize: "13px", minWidth: "28px" },
    primaryBtn:  { background: "#2563eb", border: "none", borderRadius: "6px", padding: "8px 18px", color: "#fff", fontSize: "14px", fontWeight: 600 },
    secondaryBtn:{ display: "inline-block", background: "transparent", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "7px 14px", color: "#475569", fontSize: "13px", textDecoration: "none" },
    linkBtn:     { color: "#2563eb", textDecoration: "none", fontSize: "13px" },
  },
};
