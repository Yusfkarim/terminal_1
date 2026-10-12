# ☠ ROOT Terminal — 24/7 Web Terminal & Remote IDE
> **تێرمیناڵی تەواوی سێرڤەر بە ڕووکاری گرافیکی و کارکردنی بەردەوام (24/7)**

تێرمیناڵێکی پێشکەوتووی کلاود و وێبە کە ڕێگەت پێدەدات فەرمانەکان و پرۆسەکان و سکریپتەکانت (Python, Bash, Node.js) لە باکگراوند کارپێبکەیت تەنانەت ئەگەر وێبگەڕ و کۆمپیوتەریش دابخەیت.

---

## 🌟 تایبەتمەندییە سەرەکییەکان (Features)

1. **تێرمیناڵی تەواو (Full Linux PTY Terminal)**:
   - کارپێکردنی ڕاستەقینەی `bash -i` لەگەڵ دەرئەنجامی ڕاستەوخۆ بە ڕەنگ و ستایلەکانی ANSI xterm-256color.
   - پشتگیری فرە-دانیشتن (Multi-Session): دەتوانیت چەندین دانیشتنی سەربەخۆ دروست بکەیت، ناویان بگۆڕیت یان بیسڕیتەوە.

2. **دەستکاریکەر و ڕاکێشەری فایل (Web File Editor & Runner)**:
   - دەستکاریکردنی ڕاستەوخۆی فایلەکانی پایتۆن و باش و دەق.
   - **دوگمەی ♾️ باکگراوند (24/7)**: فایلەکەت بە فەرمانی `nohup ... & disown` دەخاتە کار لە باکگراوند بەبێ ئەوەی کاتی داخستنی وێبگەڕ بوەستێت یان بکوژێتەوە.
   - لۆگەکان خۆکارانە لە پەڕگەی `.log` لە تەنیشت فایلەکە پاشەکەوت دەبن.

3. **سیستەمی مانەوە لە باکگراوند (Cloud Keep-Alive 24/7)**:
   - ناردنی ترپەی لێدان (Heartbeat) هەموو 25 چرکە جارێک بۆ ڕێگریکردن لە چوونی سێرڤەر بۆ دۆخی نووستن (Idle Sleep).
   - شێڵی پارێزراو لە ڕێگەی `trap "" HUP` و `shopt -u huponexit` تا هیچ پرۆسەیەک بە سیگناڵی داخستنی وێبگەڕ نەکەوێت.

4. **سیستەمی چوونەژوورەوەی سێ-قاتی (3-Way Secure Authentication)**:
   - کاردەکات لە ڕێگەی `X-Auth` Header، `?token=` لە Query Parameter، و کۆکی پارێزراوی `SameSite=None; Secure`.
   - ڕێگری دەکات لە بلۆکبوونی کۆکی لەناو چوارچێوەکانی Preview و iFrame.

5. **لینکی دەرەکیی جیهانی (Global Cloudflare Tunnel)**:
   - دروستکردنی تونێلی فەرمیی Cloudflare بە پرۆتۆکۆلی HTTP/2 و IPv4 (`--edge-ip-version 4`) کە ڕێگری دەکات لە هەڵەی 1033 و وەستانی تۆڕ.
   - کاردەکات لە هەموو وێبگەڕەکاندا لەسەر مۆبایل و کۆمپیوتەر بێ پێویستی بە ئەکاونتی گووگڵ.

---

## 🏗 بنەمای ئەندازیاری و کارکردنی پرۆژەکە (Architecture)

```
[ کڕیار / براوسەر ]
       │
       ▼
[ پۆرتی 3000: Node.js / Express Server (server.ts) ]
       ├── دابینکردنی سەروەتە جێگیرەکان (ui.html, icons)
       ├── چاودێری تونێلی Cloudflare (cloudflared)
       ├── ترپەی لێدانی زیندووهێشتنەوە (24/7 Keep-Alive)
       │
       ▼ (Proxy)
[ پۆرتی ناوخۆیی 7682: Python PTY Engine (app.py) ]
       ├── دروستکردنی پەیوەندی PTY لەگەڵ bash
       ├── بەڕێوەبردنی سێشنەکان و بافەری دەق
       └── فایلی سیستم لە /data/work
```

---

## 🚀 چۆنیەتی دامەزراندن و کارپێکردن (Installation & Quick Start)

### پێداویستییەکان:
- Linux / Ubuntu / Debian / Cloud Run / VPS
- Node.js 18+ و Python 3.9+

### ١. داگرتن و ئامادەکردن:
```bash
git clone <repo-url>
cd root-terminal
```

### ٢. کارپێکردن بە سکریپتی خۆکار:
```bash
chmod +x setup.sh
./setup.sh
```

یان بە شێوەی دەستی:
```bash
# دابەزاندنی cloudflared
curl -sSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# دابەزاندنی پەکیجەکان
npm install

# کارپێکردن
npm run dev
```

---

## 🔑 زانیاری چوونەژوورەوەی پێشوەختە (Default Credentials)

- **Username**: `yusf`
- **Password**: `12345678rk`

> دەتوانیت لە ڕێگەی گۆڕاوی ژینگەیی `TERM_USER` و `TERM_PASS` لەناو `.env` یان سێرڤەردا ناوی بەکارهێنەر و وشەی نهێنی بگۆڕیت.

---

## 🌐 ڕێکخستنی لینکی دەرەکی و دۆمەینی هەمیشەیی

### شێوازی ١: لینکی خۆڕایی Cloudflare Quick Tunnel
سێرڤەرەکە بە شێوەیەکی خۆکار لەکاتی دەستپێکردندا تونێلێکی خێرا دروست دەکات بە فەرمانی:
```bash
cloudflared tunnel --edge-ip-version 4 --protocol http2 --url http://127.0.0.1:3000 --no-autoupdate
```
ناونیشانە چالاکەکە دەتوانیت لە فایلی `/data/public_tunnel_url.txt` بدۆزیتەوە.

### شێوازی ٢: بەستنەوەی دۆمەینی هەمیشەیی بە تۆکن (Permanent Custom Domain)
ئەگەر دۆمەینێکت لە Cloudflare هەیە:
1. لە داشبۆردی Cloudflare بڕۆ بەشی **Zero Trust** -> **Networks** -> **Tunnels**.
2. تونێلێکی نوێ دروست بکە و تۆکنەکەی کۆپی بکە (`eyJhIjoi...`).
3. تۆکنەکە لە فایلی `/data/tunnel_token.txt` پاشەکەوت بکە یان وەک گۆڕاوی ژینگەیی `CLOUDFLARE_TOKEN` دابنێ.
4. تێرمیناڵەکەت هەمیشە لەسەر دۆمەینی فەرمیی خۆت (وەک `terminal.yourdomain.com`) دەبێت و هەرگیز ناگۆڕێت.
