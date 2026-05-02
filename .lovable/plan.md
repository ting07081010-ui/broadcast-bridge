## 目標

參考 portaly.cc 的卡片式跨平台聚合風格，把「YouTube 最新影片」與「Threads 連結」自然嵌進落地頁，但維持現有 neon studio / scanlines 視覺語言，不變成第三方 widget 風。

放置位置：`TuneIn`（選擇收聽平台）之後、`Faq` 之前。

---

## 一、YouTube 最新影片：用 Channel RSS（免 API key）

YouTube 為每個頻道提供公開 RSS：
`https://www.youtube.com/feeds/videos.xml?channel_id=UC59PKXHHazdIDsLn-9EJ6jQ`

每筆 entry 包含：videoId、title、published、author、thumbnail（透過 `media:group > media:thumbnail`），可在 server 端解析後回傳，不需 API key、不需 secret，符合 Worker SSR runtime。

### 1.1 新增 server function
`src/server/youtube.functions.ts`
- `createServerFn({ method: "GET" })` → `getYouTubeVideos()`
- 用既有的 `fast-xml-parser`（已安裝）解析 Atom XML
- 回傳前 6 部影片：`{ id, title, url, publishedAt, thumbnail }`
  - `url` = `https://www.youtube.com/watch?v={videoId}`
  - `thumbnail` 直接用 `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg`（穩定、不依賴 RSS thumbnail 大小）
- 失敗時回傳 `{ videos: [], source: "fallback" }`，元件層自動隱藏整個區塊（不顯示空殼）
- 加 5 分鐘 Cache-Control（`setResponseHeaders`）降低 Worker 負擔

### 1.2 在首頁 loader 同時取兩份資料
`src/routes/index.tsx`
- loader 改成 `Promise.all([getEpisodes(), getYouTubeVideos()])`，回傳合併物件
- `EnianLanding` props 增加 `videos`

### 1.3 新增 `<YouTubeLatest>` 區塊
`src/components/enian/EnianLanding.tsx`
- section id：`youtube`
- 標題：「YouTube 最新影片」，副標 `// LATEST_VIDEOS`，色系用 `--neon-amber`（避開已用的 cyan/magenta/lime）
- Grid：手機 1 欄 / 平板 2 欄 / 桌機 3 欄
- 每張卡片：16:9 縮圖（`aspect-video`，`object-cover`，`loading="lazy"`）+ 標題 + 發布日期 + hover 時 neon 邊框與「在 YouTube 觀看 ▶」CTA
- 區塊底部一顆「前往 YouTube 頻道」outline 按鈕，連到 `PLATFORMS.youtube.url`
- 若 `videos.length === 0` 整段不渲染

---

## 二、Threads 簡潔卡片連結

### 2.1 在 constants 補上 Threads
`src/lib/enian/constants.ts`
- `PlatformKey` 增加 `"threads"`
- `SOCIAL_LINKS`（新陣列，避免污染既有訂閱用 `PLATFORMS`）：
  - Threads：`https://www.threads.net/@emmanuel_love_sharing`
  - Instagram：沿用既有
  - Facebook：沿用既有
- 之後使用者要改 Threads URL 只需動這個常數

### 2.2 新增 `<SocialFollow>` 區塊
位置：YouTube 區塊下方，作為「跨平台互動」聚合
- 標題：「在社群追蹤主持人」，副標 `// SOCIAL_FOLLOW`
- 卡片做法仿 portaly：水平 row，左側圖標圓形 + 平台名 + 描述，右側 ExternalLink icon
- Threads 卡片：用內嵌 SVG（簡單 @ 字 logo）避免引入新依賴；hover 時邊框換成 `--neon-cyan`
- 每張卡片 `target="_blank"` + `rel="noreferrer"` + `data-event="click_social"` + `data-platform`

> 不採用 Threads 官方 oEmbed iframe 嵌入（需指定貼文 URL、樣式不易客製、會破壞 dark theme）。簡潔卡片就能達到 portaly 的視覺效果且維護成本最低。

---

## 三、技術備註（給工程細節參考）

```text
src/
├── server/
│   ├── episodes.functions.ts        (既有)
│   └── youtube.functions.ts         (新增)
├── components/enian/
│   └── EnianLanding.tsx             (加 YouTubeLatest + SocialFollow)
├── lib/enian/
│   └── constants.ts                 (加 threads + SOCIAL_LINKS)
└── routes/
    └── index.tsx                    (loader 並行抓 episodes + videos)
```

- YouTube RSS 已被 Cloudflare Worker 驗證可從 server 端 fetch（純 HTTP，無 CORS 問題、無 nodejs 原生模組依賴）
- 縮圖直接用 i.ytimg.com 的 `hqdefault.jpg`，避免把 RSS 中 base64/大圖塞進回傳
- 區塊都有 fallback：抓不到就不渲染，不破版

---

## 不會做（避免 scope creep）

- 不新增 YouTube Data API v3（不需 API key 即可達成需求）
- 不嵌入 Threads 官方 iframe（樣式衝突、需手動指定貼文）
- 不改現有 RSS 集數區、不動既有 SEO/sitemap/favicon 路由
- 不引入新的 npm 套件
