import { TOPIC_SLUGS } from "./types.ts";
import type { Block, Inline, ListBlock, Post, PostSummary } from "./types.ts";
import { addDays, taipeiDate, weekStart } from "./time.ts";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// 閱讀速度為固定的粗估值：中文每分鐘 400 字、英文每分鐘 200 詞。
const CJK_PER_MINUTE = 400;
const WORDS_PER_MINUTE = 200;

export function postPath(post: Pick<Post, "date" | "slug">): string {
  return `${post.date}-${post.slug}`;
}

/** 檢查一篇文章是否符合發布所需的最小契約，回傳問題清單（空陣列＝通過）。 */
export function validatePost(post: Post): string[] {
  const problems: string[] = [];
  if (!post.title.trim()) problems.push("缺少標題");
  if (!SLUG_PATTERN.test(post.slug)) problems.push(`slug 不合法：「${post.slug}」`);
  if (!DATE_PATTERN.test(post.date)) problems.push(`日期不合法：「${post.date}」`);
  if (!TOPIC_SLUGS.includes(post.topic)) problems.push(`主題不合法：「${post.topic}」`);
  if (Number.isNaN(new Date(post.publishedAt).getTime())) problems.push("PublishedAt 不是有效時間");
  if (post.blocks.length === 0) problems.push("正文是空的");
  return problems;
}

/**
 * 發布閘門：只有 Published、已到發布時間、未封存且通過校驗的文章才可公開。
 * Draft／Review／排程未到期一律擋下。
 */
export function isPublic(post: Post, now: Date): boolean {
  return (
    post.status === "Published" &&
    !post.archived &&
    new Date(post.publishedAt).getTime() <= now.getTime() &&
    validatePost(post).length === 0
  );
}

/** 依發布時間新到舊排序。 */
export function sortNewestFirst<T extends Pick<Post, "publishedAt">>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

function inlineText(inlines: Inline[]): string {
  return inlines.map((i) => i.text).join("");
}

function listText(list: ListBlock): string {
  return list.items
    .map((item) => inlineText(item.inlines) + (item.children ?? []).map(listText).join(""))
    .join("");
}

/** 取出正文的純文字（用於閱讀時間估算）。程式碼不計入。 */
export function plainText(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "heading":
        case "quote":
        case "scripture":
        case "callout":
          return inlineText(block.inlines);
        case "list":
          return listText(block);
        case "table":
          return block.rows.map((row) => row.map(inlineText).join("")).join("");
        case "image":
          return block.caption ?? "";
        default:
          return "";
      }
    })
    .join("\n");
}

/** 粗估閱讀分鐘數，最少 1 分鐘。顯示時要寫「約 X 分鐘」。 */
export function estimateReadingMinutes(blocks: Block[]): number {
  const text = plainText(blocks);
  const cjk = text.match(/[㐀-鿿]/g)?.length ?? 0;
  const words = text.match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return Math.max(1, Math.round(cjk / CJK_PER_MINUTE + words / WORDS_PER_MINUTE));
}

export function toSummary(post: Post): PostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    date: post.date,
    topic: post.topic,
    publishedAt: post.publishedAt,
    excerpt: post.excerpt,
    episode: post.episode,
    source: post.source,
    path: postPath(post),
    readingMinutes: estimateReadingMinutes(post.blocks),
  };
}

export type Feature = { kind: "today" | "latest"; post: PostSummary };

/**
 * 首頁精選：台北今天有已發布的文章才叫「今日一篇」，否則是「最新碎念」＋實際日期。
 * 不把舊文冒充今日。
 */
export function pickFeature(newestFirst: PostSummary[], now: Date): Feature | null {
  if (newestFirst.length === 0) return null;
  const today = taipeiDate(now);
  const todays = newestFirst.find((post) => post.date === today);
  return todays ? { kind: "today", post: todays } : { kind: "latest", post: newestFirst[0] };
}

export type WeekDay = { date: string; posts: PostSummary[] };

/** 本週一到週日，每天列出當天發布的所有文章（可能 0 篇或多篇）。 */
export function weekDays(posts: PostSummary[], now: Date): WeekDay[] {
  const monday = weekStart(taipeiDate(now));
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return { date, posts: posts.filter((post) => post.date === date) };
  });
}

/** 前後篇：依發布時間相鄰。newer＝較新的一篇，older＝較舊的一篇。 */
export function adjacentPosts(
  newestFirst: PostSummary[],
  path: string,
): { newer?: PostSummary; older?: PostSummary } {
  const index = newestFirst.findIndex((post) => post.path === path);
  if (index === -1) return {};
  return { newer: newestFirst[index - 1], older: newestFirst[index + 1] };
}

/** 文章內超過三個 H2 才顯示目錄。 */
export function tableOfContents(blocks: Block[]): { id: string; text: string }[] {
  const headings = blocks.flatMap((block) =>
    block.type === "heading" && block.level === 2
      ? [{ id: block.id, text: inlineText(block.inlines) }]
      : [],
  );
  return headings.length > 3 ? headings : [];
}

export type MonthGroup = { month: string; posts: PostSummary[] };

/** 封存頁：依台北日期的年月分組，維持新到舊的順序。 */
export function groupByMonth(newestFirst: PostSummary[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const post of newestFirst) {
    const month = post.date.slice(0, 7);
    const last = groups[groups.length - 1];
    if (last?.month === month) last.posts.push(post);
    else groups.push({ month, posts: [post] });
  }
  return groups;
}

/**
 * 週索引：該週週一到週日，每天列出真實已發布的文章（舊到新）。
 * 缺稿日是空陣列；不假設每週剛好六篇。
 */
export function weekIndex(posts: PostSummary[], monday: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return {
      date,
      posts: posts
        .filter((post) => post.date === date)
        .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()),
    };
  });
}
