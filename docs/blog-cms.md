# 每日碎念（/blog）內容發布說明

> 狀態（2026-10-05）：頁面與內容契約已完成；**Notion 發布鏈尚未對真實資料庫驗證**。
> 規劃來源：Notion「emting.life 每日部落格｜頁面規劃與美感規格（2026-10-05）」。

## 內容怎麼進到網站

```
Notion 寫作／人工審核
  → scripts/sync-blog.ts（唯讀擷取 Published 文章、下載圖片）
  → src/content/blog/snapshot.json ＋ public/blog/media/*
  → build 時打包進伺服器端；請求時再過一次發布閘門
```

- Notion 是唯一的寫作來源。`snapshot.json` 是產生出來的快照，不要手改。
- 快照只存在伺服器端 bundle，不會進瀏覽器下載的 JS。
- 發布閘門（`src/lib/blog/posts.ts` 的 `isPublic`）：Published、已到 PublishedAt、未封存、校驗通過，四項都成立才公開。排程未到的文章在時間到之前回 404。

## 同步指令

```bash
NOTION_TOKEN=... NOTION_BLOG_DATABASE_ID=... node scripts/sync-blog.ts
```

- 需要 Node 22.18 以上（直接執行 TypeScript）。
- 權杖只放環境變數；不要寫進 `.env` 以外的檔案，也不要用 `VITE_` 開頭（會被打包進前端）。
- 任何網路或權限錯誤都會整批中止，既有快照不變。
- 單篇含未支援內容時只阻擋那一篇，並印出 block ID；結束碼為 2。

## Notion 資料庫欄位（提案，尚未建立）

| 欄位        | 型別           | 說明                                       |
| ----------- | -------------- | ------------------------------------------ |
| Title       | title          | 公開標題，純文字，不要埋換行               |
| Slug        | text           | 小寫英數與連字號；首次發布後網址凍結       |
| Topic       | select         | 身體／心情／靈命／家庭／事業／社會         |
| Status      | status         | Draft／Review／Published                   |
| PublishedAt | date（含時間） | 對外發布時間；網址日期取首次發布的台北日期 |
| Excerpt     | text           | 導讀；留空時用正文第一段                   |
| EpisodeURL  | url            | 相關集數連結；人工確認有關聯才填           |

## 正文支援的區塊

段落、H2／H3、粗體／斜體／行內程式碼、連結、項目與編號清單（可巢狀；同一項目底下可混用項目清單與編號清單）、引文、callout、圖片、表格、程式碼、分隔線。toggle 與分欄會展開成一般內容。頁面、人員與其他行內 mention 會轉成顯示名稱的純文字，不另建 Notion 連結。

寫作慣例（由轉換層解讀，待主持人確認）：

- **引文來源**：在引文最後一行寫 `——來源`。
- **經文**：用 📖 圖示的 callout，最後一行寫 `——書卷 章:節（版本）`。缺出處會阻擋發布，經文內容不會被改寫。
- 內文若用了 H1，會整體降一級並在同步時提醒。

不支援、會阻擋該篇的內容：子頁面、資料庫、embed、Notion 內部連結。清單項目底下只接受巢狀清單（項目與編號可混用），其他區塊仍會阻擋。

## 測試稿（fixtures）

`src/content/blog/fixtures/` 是打磨版面用的虛構內容，只在 `npm run dev` 時載入。
正式 build 不含測試稿，也不會出現在 sitemap。請勿從其他檔案靜態 import。

## 測試

```bash
node --test src/lib/blog/blog.test.ts
```
