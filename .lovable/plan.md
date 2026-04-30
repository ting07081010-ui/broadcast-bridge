
## 目標

完成重構 P2 階段，把網站從「可轉換 (Lv4)」推進到「可迭代 (Lv5)」：補齊導覽、FAQ、合作管道、GA4 事件追蹤、無障礙與效能細節。

## 範圍

### 1. 頂部 Sticky 導覽列（新元件）
- 桌機左側顯示節目名 / FM 頻率，右側顯示 anchor 連結：適合誰、節目單元、最新集數、訂閱、FAQ。
- 行動版收合為下拉。
- 半透明霓虹邊框，不蓋住 Hero 主視覺。
- 點擊 anchor → 平滑捲動（使用 CSS `scroll-behavior: smooth` + `scroll-margin-top` 補導覽列高度）。

### 2. FAQ 區塊（新增）
使用 shadcn `Accordion`，常見問題例：
- 多久更新一集？
- 在哪些平台可以聽？
- 想當來賓 / 投稿議題怎麼聯絡？
- 內容會涉及宗教嗎？會不會很硬？
- 為什麼叫「E 人 I 碎念」？

### 3. 合作 / 聯絡區塊（新增）
- 來賓邀約、品牌合作、聽眾回饋三個入口。
- 一個 mailto + 一個 IG 私訊 CTA。

### 4. GA4 事件追蹤
- 在 `__root.tsx` 注入 `dataLayer` 與一個輕量的 inline script：自動監聽 `[data-event]` 點擊並 push 到 `dataLayer`，事件名取自 `data-event`，附加屬性取所有 `data-*`。
- 預先在 Hero CTA、Episode Card、Platform Card、FAQ 加上 `data-event`（部分已存在）。
- 不強制塞入 GA4 ID（避免假資料），但保留 `gtag` 占位，使用者只需在 secrets/env 加 `VITE_GA4_ID` 即會啟用。

### 5. SEO / 結構化資料補強
- `__root.tsx` 把 `<html lang>` 改成 `zh-TW`。
- 在 index 路由加上 `canonical` 連結。
- `PodcastSeries` JSON-LD 加上 `url` 與 `sameAs`（Spotify / Apple / YouTube / FB / IG）。
- 每張集數卡加上 `itemScope itemType="https://schema.org/PodcastEpisode"` 微資料。

### 6. A11y / 效能 polish
- 加上 skip-link「跳到主要內容」。
- Hero 頭像 `fetchPriority="high"`；其他圖片 `loading="lazy"`、`decoding="async"`。
- 為純裝飾文字（如 `// AUDIENCE_MATCH`）加 `aria-hidden`。
- `prefers-reduced-motion` 已存在，補強 Hero 的 hover 動畫關閉。
- 預連線 `preconnect` 到 RSS / Spotify / Apple 網域以加速 platform CTA。

## 檔案異動

| 檔案 | 動作 |
|---|---|
| `src/lib/enian/constants.ts` | 新增 `FAQ`、`CONTACT` 常數 |
| `src/components/enian/TopNav.tsx` | 新增 sticky 導覽列 |
| `src/components/enian/Faq.tsx` | 新增 FAQ accordion |
| `src/components/enian/Contact.tsx` | 新增合作 / 聯絡區塊 |
| `src/components/enian/EnianLanding.tsx` | 串接 TopNav / Faq / Contact，補 anchor `id`、`scroll-margin-top`、`data-event` |
| `src/routes/__root.tsx` | `lang="zh-TW"`、注入 GA4 dataLayer + 自動事件追蹤 inline script、skip-link target |
| `src/routes/index.tsx` | 加 `canonical`、JSON-LD `sameAs` / `url` |
| `src/styles.css` | `html { scroll-behavior: smooth }`、`section[id] { scroll-margin-top: 4.5rem }` |

## 不做

- 不接 GA4 真實 measurement ID（等使用者提供）。
- 不為每集建立獨立路由（量小，留待節目穩定後再做）。
- 不改現有 RSS 解析或視覺風格，只補新區塊與細節。

## 風險 / 需確認

- FAQ 文案先用合理猜測，使用者可後續微調。
- 合作信箱目前用 `hi@supergalen.com`（Footer 已使用），如有專屬信箱再替換。

