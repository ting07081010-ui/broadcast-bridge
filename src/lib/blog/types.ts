// 部落格內容契約：Notion 快照與測試稿（fixtures）都必須符合這份型別。
// 這個資料夾的純邏輯模組彼此以相對路徑＋.ts 副檔名引用，讓 `node --test` 可以直接執行。

export const TOPIC_SLUGS = ["body", "mood", "spirit", "family", "work", "society"] as const;
export type TopicSlug = (typeof TOPIC_SLUGS)[number];

export type PostStatus = "Draft" | "Review" | "Published";

/** 行內文字片段。href 只允許 http(s)／mailto，由轉換層把關。 */
export type Inline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  href?: string;
};

/** 清單項目裡依出現順序接上的內容：巢狀清單、段落、引文或程式碼。 */
export type ListChild = Extract<Block, { type: "list" | "paragraph" | "quote" | "code" }>;

export type ListItem = {
  inlines: Inline[];
  /** 巢狀內容，依出現順序。項目與編號清單可混用，也可穿插段落、引文、程式碼。 */
  children?: ListChild[];
};

export type ListBlock = { type: "list"; ordered: boolean; items: ListItem[] };

export type Block =
  | { type: "paragraph"; inlines: Inline[] }
  | { type: "heading"; level: 2 | 3; id: string; inlines: Inline[] }
  | ListBlock
  | { type: "quote"; inlines: Inline[]; source?: string }
  | { type: "scripture"; inlines: Inline[]; reference: string; version?: string }
  | { type: "callout"; inlines: Inline[] }
  | { type: "image"; src: string; alt: string; caption?: string; width: number; height: number }
  | { type: "table"; caption?: string; hasHeader: boolean; rows: Inline[][][] }
  | { type: "code"; code: string; language?: string; caption?: string }
  | { type: "divider" };

export type EpisodeLink = {
  url: string;
  /** 例如「EP038」；只有人工確認的關聯才填，沒有就不顯示。 */
  label?: string;
};

export type Post = {
  id: string;
  title: string;
  /** 小寫 ASCII、數字、連字號；首次發布後凍結。 */
  slug: string;
  /** 首次發布的台北日期 YYYY-MM-DD；與 slug 組成網址，之後不隨修稿變動。 */
  date: string;
  topic: TopicSlug;
  status: PostStatus;
  /** ISO 8601；對外發布時間與排程門檻。 */
  publishedAt: string;
  /** ISO 8601；最後修改時間。 */
  updatedAt: string;
  excerpt: string;
  episode?: EpisodeLink;
  blocks: Block[];
  /** fixture 只在開發模式載入，永遠不進 sitemap／feed／正式 bundle。 */
  source: "notion" | "fixture";
  archived?: boolean;
};

/** 列表用的精簡資料（不含正文）。 */
export type PostSummary = Pick<
  Post,
  "id" | "title" | "slug" | "date" | "topic" | "publishedAt" | "excerpt" | "episode" | "source"
> & { path: string; readingMinutes: number };

export type BlogSnapshot = {
  /** 最後一次成功同步的時間；null 表示尚未同步過。 */
  syncedAt: string | null;
  posts: Post[];
};
