
# 《E 人 I 碎念》Podcast 落地頁重構計畫（P0 + P1）

## 目標
把現有「酷炫世界觀展示頁」轉成「理解 → 共鳴 → 行動」的轉換型 Landing Page。保留 NEON BROADCAST STUDIO 視覺核心，但降低動畫干擾、強化文字可讀性與行動引導。

## 視覺方向
- 保留：FM 92.1 MHz 電台隱喻、霓虹色（青藍 / 粉紫 / 黃綠強調色）、等寬字 monospace 標籤、暗色背景。
- 降噪：減少全頁面雜訊動畫、降低背景閃爍/掃描線強度、提高正文行高與對比、CTA 改為高對比實心按鈕（非外框霓虹發光小字）。
- 響應式：手機優先；動畫在 `prefers-reduced-motion` 與小螢幕下自動降載。

## 新版資訊架構（IA）

```text
┌─ 1. Hero（首屏轉換）
│    - 節目名 + 一句定位
│    - 觀眾利益說明（3 句內）
│    - 主 CTA：立即訂閱 Podcast
│    - 次 CTA：先聽最新一集
│    - FM 92.1 MHz / TRANSMISSION ACTIVE 視覺保留為氛圍裝飾
│
├─ 2. 這個節目適合誰（自我辨識）
│    - 5 個 checklist 式條目
│
├─ 3. 內容主軸 4 模組
│    - InfoSec / Family / Faith / Social（重排自 CONTENT_MODULES）
│
├─ 4. 每週節目表（單元品牌化）
│    - TUE 生活亂入中 / THU 宅宅科技局 / SAT 週末碎念包 …
│
├─ 5. 第一次來先聽這 3 集
│    - 3 張精選 Episode Card
│
├─ 6. 最新集數（Episode Cards，自 RSS）
│    - 取代 Visual Archives 的 RECORDING_001~006
│
├─ 7. 關於主持人（HOST ANALYSIS 重排）
│
├─ 8. 500 聽眾共同任務（Mission 改寫）
│    - 從「創作者目標」改成「聽眾一起加入的廣播基地」
│
├─ 9. Tune In Now（平台入口）
│    - Spotify / Apple Podcasts / YouTube / Threads / IG
│    - 大按鈕 + 平台 logo + 平台名稱（先佔位連結 #）
│
└─ 10. 頁尾：回 Guild Hall、合作邀約信箱（簡版）
```

## 主要文案（採用 SOP 建議）

**Hero**
- 標題：E 人 I 碎念
- Tagline：一個有點宅、很愛講、但認真生活的 Podcast
- 副文：用輕鬆幽默的方式，聊科技、資安、家庭、信仰與社會觀察。週一到週六，每天一個新面向，陪你把生活中的小事，拆成值得思考的大事。
- 主 CTA：立即訂閱 Podcast
- 次 CTA：先聽最新一集

**這個節目適合誰**（草稿，可調）
- 想用輕鬆方式跟上科技與資安趨勢的人
- 在家庭、工作、信仰之間找平衡的爸媽
- 喜歡聽人把複雜事情講白話的通勤族
- 對基督信仰生活有共鳴或好奇的聽眾
- 想一邊大笑一邊被認真內容餵飽的宅宅

**500 共同任務**
> 這不是單純的訂閱數字，而是一個小型廣播基地：集結 500 位願意一起思考、一起笑、一起認真生活的聽眾。如果你也喜歡科技、信仰、家庭與生活觀察，歡迎調頻進來。

**Broadcast Schedule 單元名（建議，可由你定稿）**
| 日 | 單元名 | 主題 |
|---|---|---|
| MON | 職場開播日 | 職場 / 專業 |
| TUE | 生活亂入中 | 生活 / 家庭 |
| WED | 信仰對頻時間 | 信仰 / 心靈 |
| THU | 宅宅科技局 | 科技 / 宅文化 |
| FRI | 來賓亂入時段 | 訪談 |
| SAT | 週末碎念包 | 一週總結 |

## SEO

- `<title>`：E 人 I 碎念｜科技、信仰、家庭與生活觀察 Podcast
- `<meta description>`：採 SOP 版本
- og:title / og:description / og:type=website / og:image=主持人 avatar
- twitter:card=summary_large_image
- 結構化資料 JSON-LD：`PodcastSeries` schema（name、description、author、image、webFeed）
- H1 唯一：E 人 I 碎念；H2 對齊 SOP 建議的章節標題

## Episode Cards（從 Apple/Spotify RSS 自動抓取）

- 用 TanStack Server Function 在 SSR 時抓 RSS feed，解析最新 N 集（預設 6）
- 每集顯示：集數、標題、摘要（截斷）、發布日期、收聽連結（指向 RSS 內 enclosure 或 Apple/Spotify 連結）
- 加事件 hook（之後 P2 再接 GA4）：data-event="click_episode_card"
- 你需要提供：**RSS feed URL**（Apple Podcasts / Spotify / Firstory / SoundOn 任一皆可）
  - 若上線時尚未提供，先 fallback 為 SOP 範例 EP001/EP002 + 既有 gallery 圖片，待你給 URL 再切換

## 平台連結（先佔位）

按鈕齊備、`href="#"`、附 `aria-label` 與平台 logo（lucide-react / 簡單 SVG）：
- Spotify、Apple Podcasts、YouTube、Threads、Instagram（@emmanuel_love_sharing 已知）
- 之後給你連結就直接替換常數即可（集中於一個 `platforms.ts`）。

## 技術實作（給工程參考）

- 路由結構：
  - `src/routes/index.tsx` → 直接做為《E 人 I 碎念》落地頁（取代目前 placeholder）
  - `src/routes/api/episodes.ts` → 伺服端 RSS 抓取 + 解析 endpoint（或改成 route loader 直接 SSR 注入）
- 元件拆分：`src/components/enian/` 下 Hero / WhoFor / Topics / Schedule / FirstListen / Episodes / About / Mission / TuneIn / Footer
- 設計 token：在 `src/styles.css` 新增 `--neon-cyan / --neon-magenta / --neon-lime / --studio-bg / --studio-surface`，並提供 `prefers-reduced-motion` 降載
- RSS 解析：用輕量 `fast-xml-parser`（Worker 友善，純 JS）
- 圖片：暫沿用既有 `supergalen.com/assets/img/guild/e_nian/avatar.webp` 與 gallery 作為素材（hotlink 或之後改成本地）
- SEO：在 `index.tsx` 的 `head()` 與 root `head()` 設定，root 不放 og:image，避免覆蓋葉節點
- 不變更 routing 結構（單頁），不增加額外 page route — 此頁本身就是內容單頁

## 不在本次範圍（屬 P2，未來再做）
- FAQ / 投稿 / 合作專區
- 頂部導覽 / Breadcrumb
- 每集獨立 SEO 子頁
- GA4 / Plausible / Search Console 串接與事件追蹤
- 行動端 code splitting / 動畫深度降載分析
- `.html` 舊網址 redirect（屬母站 supergalen.com 設定，非本專案）

## 需要你提供（不阻擋開工，缺則用佔位）
1. Podcast RSS feed URL（最關鍵，影響 Episode Cards 是否真實）
2. Spotify / Apple Podcasts / YouTube 頻道實際連結（有就先放，無則 `#`）
3. Broadcast Schedule 6 個單元名是否採用上方建議，或你有自訂版本

開始實作後我會在 P1 完工時提示你補上 RSS / 平台連結，再做最後替換。
