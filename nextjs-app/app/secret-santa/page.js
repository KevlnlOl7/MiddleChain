"use client";
import { useTheme } from "@/components/ThemeProvider";

const MESSAGES = [
  { user: "powen",  avatar: "P", time: "2025-12-20 14:32", text: "Secret Santa 派對確定 12/23！🎄 大家記得把禮物帶來辦公室廚房，預算上限 $500 唷。對了系統有幾個 config 還沒改，等等我 push 一版" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 14:35", text: "收到收到！我已經想好禮物了，保證大家會愛 😈" },
  { user: "Zoe",    avatar: "Z", time: "2025-12-20 14:37", text: "請問 Secret Santa 是什麼？" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 14:38", text: "ZOE 你認真嗎 😂😂😂" },
  { user: "Kevin",  avatar: "K", time: "2025-12-20 14:40", text: "就是抽籤互送禮物啦... 這你也不知道？" },
  { user: "Zoe",    avatar: "Z", time: "2025-12-20 14:41", text: "哦哦那我抽到誰了？" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 14:41", text: "就叫 SECRET Santa 你懂嗎 😂" },
  { user: "Kevin",  avatar: "K", time: "2025-12-20 14:55", text: "請問可以帶食物嗎 lol，還是禮物一定要走採購系統？" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 14:57", text: "Kevin 你用採購系統買聖誕禮物是什麼概念 😂" },
  { user: "Kevin",  avatar: "K", time: "2025-12-20 14:58", text: "我就問一下嘛！！" },
  { user: "powen",  avatar: "P", time: "2025-12-20 15:01", text: "食物可以啊，但不算禮物。採購不用，直接帶來就好" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:02", text: "我帶活體生物可以嗎" },
  { user: "powen",  avatar: "P", time: "2025-12-20 15:02", text: "Ian 不行" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:03", text: "那我帶半活體呢" },
  { user: "powen",  avatar: "P", time: "2025-12-20 15:03", text: "Ian 不行" },
  { user: "Zoe",    avatar: "Z", time: "2025-12-20 15:04", text: "半活體是什麼" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:04", text: "Zoe 妳不要問 😇" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 15:06", text: "對了我抽到誰了怎麼還不能看 😤 seed 是固定的還是真隨機？" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:07", text: "老師你問 seed 要幹嘛 😨" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 15:08", text: "就好奇嘛，工程師本能" },
  { user: "powen",  avatar: "P", time: "2025-12-20 15:10", text: "seed 是我自己設的，不告訴你 😂" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 15:11", text: "所以 entropy 不高嘛。暴力解一下就出來了" },
  { user: "powen",  avatar: "P", time: "2025-12-20 15:12", text: "你要確欸？？" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:12", text: "老師你真的會去爆破嗎 😂😂 我要告訴我抽到的人" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 15:13", text: "Ian 閉嘴" },
  { user: "Zoe",    avatar: "Z", time: "2025-12-20 15:13", text: "爆破是什麼" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:14", text: "Zoe 妳真的不要問 😇" },
  { user: "alice",  avatar: "A", time: "2025-12-20 15:44", text: "哈哈哈 😂 對了大家，IT 昨天 rotate 了 font upload 的 API key，新的是 NxDocs-4dm1n-K3y-2026-f7a3c9e2，有在用的記得更新一下" },
  { user: "Kevin",  avatar: "K", time: "2025-12-20 15:46", text: "alice 你這樣貼出來沒問題嗎 lol" },
  { user: "alice",  avatar: "A", time: "2025-12-20 15:47", text: "這是內部頁面啦，沒事的 🙂" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:47", text: "老師老師快去記那個 key 😂" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 15:48", text: "Ian 你在幹嘛" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:48", text: "沒有沒有 😇" },
  { user: "Zoe",    avatar: "Z", time: "2025-12-20 15:49", text: "那個 key 是幹嘛用的" },
  { user: "alice",  avatar: "A", time: "2025-12-20 15:49", text: "上傳字體用的啦 Zoe，你不用管" },
  { user: "powen",  avatar: "P", time: "2025-12-20 15:50", text: "對了剛才 deploy 完了，DB backup 那邊設了新路徑，舊的 /backup/config 記得別去點，那個還沒清" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:51", text: "powen 你剛說了什麼路徑 👀" },
  { user: "powen",  avatar: "P", time: "2025-12-20 15:51", text: "Ian 你給我忘掉" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:52", text: "忘掉了忘掉了 😇" },
  { user: "Zoe",    avatar: "Z", time: "2025-12-20 15:52", text: "什麼 backup config" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 15:52", text: "ZOE 妳不要去點 😂" },
  { user: "alice",  avatar: "A", time: "2025-12-20 16:01", text: "欸等等，這個 secret-santa 頁面... 是 public 的嗎？" },
  { user: "powen",  avatar: "P", time: "2025-12-20 16:02", text: "alice... 這頁面在 internet 上喔 😅" },
  { user: "alice",  avatar: "A", time: "2025-12-20 16:02", text: "WAIT WHAT" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 16:03", text: "LMAOOOO alice 你剛剛把 key 貼給全世界看了 😂😂😂" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 16:03", text: "我就說嘛 💀" },
  { user: "Zoe",    avatar: "Z", time: "2025-12-20 16:04", text: "所以那個 key 現在大家都看得到了嗎" },
  { user: "Kevin",  avatar: "K", time: "2025-12-20 16:04", text: "ZOEEEEE 不要複習了 😭" },
  { user: "alice",  avatar: "A", time: "2025-12-20 16:05", text: "對不起對不起對不起 QQ" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 16:05", text: "alice 我去幫你通知 IT 😂 這個我很擅長" },
  { user: "powen",  avatar: "P", time: "2025-12-20 16:06", text: "Ian 你是認真要去通知還是要去搗亂" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 16:06", text: "都有 😇" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 16:07", text: "\"這是內部頁面啦，沒事的\" 🙂" },
  { user: "alice",  avatar: "A", time: "2025-12-20 16:08", text: "pyc 閉嘴 QQ 對不起大家...12/23 見啦 🎁" },
  { user: "powen",  avatar: "P", time: "2025-12-20 16:09", text: "沒事啦 alice，不過那個 /backup/config 的事也別說出去，那邊有些東西還沒處理完 😅" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 16:09", text: "powen 你剛在公開頻道說這個你知道嗎" },
  { user: "powen",  avatar: "P", time: "2025-12-20 16:09", text: "...。" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 16:10", text: "POWEN LMAOOO 你跟 alice 是一夥的 😂😂😂" },
  { user: "Zoe",    avatar: "Z", time: "2025-12-20 16:10", text: "所以 /backup/config 是什麼" },
  { user: "Kevin",  avatar: "K", time: "2025-12-20 16:11", text: "ZOE 你給我閉嘴 😭😭😭" },
  { user: "alice",  avatar: "A", time: "2025-12-20 16:11", text: "LMAOOO powen 我們一起去跟 IT 自首 QQ" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 16:12", text: "我陪你們去，我負責錄影 😂" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 16:12", text: "學著點" },
  { user: "Kevin",  avatar: "K", time: "2025-12-20 16:13", text: "好啦好啦 12/23 見！禮物我想好了" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 16:14", text: "Kevin 你禮物不要再帶書了，上次那本沒人看懂" },
  { user: "Kevin",  avatar: "K", time: "2025-12-20 16:14", text: "那本很好懂！" },
  { user: "pyc",    avatar: "Y", time: "2025-12-20 16:15", text: "是你們程度問題" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 16:15", text: "老師你跟 Kevin 一國的喔 😂" },
  { user: "Zoe",    avatar: "Z", time: "2025-12-20 16:16", text: "那本書是什麼書" },
  { user: "Ian",    avatar: "I", time: "2025-12-20 16:16", text: "Zoe 不重要 😂 12/23 見啦大家！🎄" },
];

function getAvatarStyle(name) {
  const palettes = [
    ["#1e3a5f","#60a5fa"],
    ["#1a2e1a","#4ade80"],
    ["#3b1a1a","#f87171"],
    ["#2d1a3b","#c084fc"],
    ["#1a2d2d","#34d399"],
    ["#3b2a1a","#fb923c"],
  ];
  return palettes[name.charCodeAt(0) % palettes.length];
}

export default function SecretSantaPage() {
  const { dark, toggleTheme } = useTheme();

  const bg     = dark ? "#111827" : "#f1f5f9";
  const card   = dark ? "#1a2235" : "#ffffff";
  const border = dark ? "#2a3447" : "#e2e8f0";
  const text   = dark ? "#e2e8f0" : "#0f172a";
  const muted  = dark ? "#64748b" : "#94a3b8";
  const subtle = dark ? "#94a3b8" : "#475569";
  const bubble = dark ? "#1e2d40" : "#f8fafc";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Inter, system-ui, sans-serif" }}>
      <nav style={{ background: card, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#3b82f6" }}>Nex</span>
          <span style={{ fontSize: "20px", fontWeight: 800, color: text }}>Docs</span>
          <span style={{ fontSize: "11px", background: dark ? "#4a1942" : "#fdf2f8", color: "#ec4899", border: "1px solid #ec489940", borderRadius: "4px", padding: "1px 6px", marginLeft: "6px" }}>🎄 Internal</span>
        </div>
        <button onClick={toggleTheme}
          style={{ background: dark ? "#1e2d40" : "#f1f5f9", border: `1px solid ${border}`, borderRadius: "6px", padding: "5px 12px", color: muted, fontSize: "12px", cursor: "pointer" }}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎅</div>
          <h1 style={{ color: text, fontSize: "24px", fontWeight: 700, margin: "0 0 6px" }}>NexDocs Secret Santa 2025</h1>
          <p style={{ color: muted, fontSize: "13px", margin: 0 }}>Internal team channel · 僅限內部人員</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {MESSAGES.map((msg, i) => {
            const [bgColor, fgColor] = getAvatarStyle(msg.user);
            return (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: bgColor, border: `1px solid ${fgColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: fgColor, flexShrink: 0 }}>
                  {msg.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: fgColor }}>{msg.user}</span>
                    <span style={{ fontSize: "11px", color: muted }}>{msg.time}</span>
                  </div>
                  <div style={{ background: bubble, border: `1px solid ${border}`, borderRadius: "0 8px 8px 8px", padding: "10px 14px", fontSize: "14px", color: subtle, lineHeight: 1.6, display: "inline-block", maxWidth: "100%", wordBreak: "break-all" }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <a href="/guest" style={{ color: muted, fontSize: "13px", textDecoration: "none" }}>← Back to Portal</a>
        </div>
      </div>
    </div>
  );
}
