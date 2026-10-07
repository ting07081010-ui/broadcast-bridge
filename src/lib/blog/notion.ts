// Notion → 部落格內容契約的轉換層（純函式，不做網路請求）。
// 抓取與分頁在 scripts/sync-blog.ts；這裡只負責「不靜默丟內容」的轉換與校驗。
// 狀態：尚未對真實 Notion 資料庫驗證，欄位名稱依規劃 9.2 的提案。

import { TOPIC_SLUGS } from "./types.ts";
import type { Block, Inline, ListBlock, ListItem, Post, PostStatus, TopicSlug } from "./types.ts";
import { taipeiDate } from "./time.ts";

export type NotionRichText = {
  type: string;
  plain_text: string;
  href: string | null;
  annotations?: { bold?: boolean; italic?: boolean; code?: boolean };
};

export type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  /** 由抓取端遞迴補上；has_children 為 true 卻沒有 children 代表抓取不完整。 */
  children?: NotionBlock[];
  [key: string]: unknown;
};

export type NotionPage = {
  id: string;
  archived?: boolean;
  in_trash?: boolean;
  last_edited_time: string;
  properties: Record<string, Record<string, unknown>>;
};

export type ResolvedImage = { src: string; width: number; height: number };

/** 遇到不允許自動公開的內容時丟出，帶 block ID 讓編輯者找得到。 */
export class BlockError extends Error {
  blockId: string;
  constructor(blockId: string, message: string) {
    super(`${message}（block ${blockId}）`);
    this.name = "BlockError";
    this.blockId = blockId;
  }
}

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:"];
// 網站自己會產生或不影響內容的區塊，可以安全略過。
const SKIPPED_TYPES = new Set(["table_of_contents", "breadcrumb"]);
const TOPIC_BY_NAME: Record<string, TopicSlug> = {
  身體: "body",
  心情: "mood",
  靈命: "spirit",
  家庭: "family",
  事業: "work",
  社會: "society",
};
const STATUSES: PostStatus[] = ["Draft", "Review", "Published"];
const SOURCE_DASH = /^[—–-]{1,2}\s*/;
const SCRIPTURE_ICON = "📖";

function safeHref(href: string | null, blockId: string): string | undefined {
  if (!href) return undefined;
  // Notion 內部頁面連結是相對路徑，不能公開
  if (href.startsWith("/")) throw new BlockError(blockId, "含有 Notion 內部頁面連結");
  let protocol: string;
  try {
    protocol = new URL(href).protocol;
  } catch {
    throw new BlockError(blockId, `連結格式不正確：${href}`);
  }
  if (!ALLOWED_PROTOCOLS.includes(protocol)) {
    throw new BlockError(blockId, `不允許的連結協定：${protocol}`);
  }
  return href;
}

export function richTextToInlines(richText: NotionRichText[], blockId: string): Inline[] {
  return richText.map((part) => {
    // mention（頁面、人員、日期等）只留顯示名稱，不做成 Notion 連結。
    if (part.type !== "text" && part.type !== "mention") {
      throw new BlockError(blockId, `行內含有不支援的內容（${part.type}）`);
    }
    const inline: Inline = { text: part.plain_text };
    if (part.annotations?.bold) inline.bold = true;
    if (part.annotations?.italic) inline.italic = true;
    if (part.annotations?.code) inline.code = true;
    if (part.type === "text") {
      const href = safeHref(part.href, blockId);
      if (href) inline.href = href;
    }
    return inline;
  });
}

function payload(block: NotionBlock): Record<string, unknown> {
  return (block[block.type] ?? {}) as Record<string, unknown>;
}

function inlinesOf(block: NotionBlock): Inline[] {
  return richTextToInlines((payload(block).rich_text ?? []) as NotionRichText[], block.id);
}

function childrenOf(block: NotionBlock): NotionBlock[] {
  if (block.has_children && !block.children) {
    throw new BlockError(block.id, "子區塊沒有抓取完整");
  }
  return block.children ?? [];
}

function plain(inlines: Inline[]): string {
  return inlines.map((i) => i.text).join("");
}

/** 把最後一行的「——來源」拆出來；沒有就回傳原文。 */
function splitSource(inlines: Inline[]): { body: Inline[]; source?: string } {
  const text = plain(inlines);
  const lastBreak = text.lastIndexOf("\n");
  const lastLine = text.slice(lastBreak + 1).trim();
  if (lastBreak === -1 || !SOURCE_DASH.test(lastLine)) return { body: inlines };
  // 依字元數把 inlines 切到最後一個換行之前
  const body: Inline[] = [];
  let remaining = lastBreak;
  for (const inline of inlines) {
    if (remaining <= 0) break;
    const piece = inline.text.slice(0, remaining);
    remaining -= piece.length;
    if (piece) body.push({ ...inline, text: piece });
  }
  return { body, source: lastLine.replace(SOURCE_DASH, "") };
}

function isListItem(type: string): boolean {
  return type === "bulleted_list_item" || type === "numbered_list_item";
}

/** 連續的同種類清單各成一段；項目與編號可混用，依出現順序接在同一項目下。 */
function nestedLists(children: NotionBlock[]): ListBlock[] {
  const lists: ListBlock[] = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!isListItem(child.type)) {
      throw new BlockError(child.id, `清單項目底下含有不支援的區塊（${child.type}）`);
    }
    const run = [child];
    while (children[i + 1]?.type === child.type) run.push(children[++i]);
    lists.push(toList(run, child.type === "numbered_list_item"));
  }
  return lists;
}

function toList(items: NotionBlock[], ordered: boolean): ListBlock {
  return {
    type: "list",
    ordered,
    items: items.map((item): ListItem => {
      const listItem: ListItem = { inlines: inlinesOf(item) };
      const nested = nestedLists(childrenOf(item));
      if (nested.length > 0) listItem.children = nested;
      return listItem;
    }),
  };
}

export type ConvertResult = { blocks: Block[]; warnings: string[] };

/**
 * 把 Notion 區塊樹轉成內容契約。
 *
 * Args:
 *   notionBlocks: 頁面最上層的區塊（已遞迴附上 children）。
 *   images: 已下載成網站穩定資產的圖片，以 block ID 對應。
 *
 * Raises:
 *   BlockError: 遇到不支援或不允許自動公開的區塊；整篇應阻擋發布。
 */
export function convertBlocks(
  notionBlocks: NotionBlock[],
  images: Map<string, ResolvedImage>,
): ConvertResult {
  const warnings: string[] = [];
  // 文章頁已有自己的 H1；內文若用了 heading_1，整體降一級並留下記錄。
  const hasH1 = flatten(notionBlocks).some((b) => b.type === "heading_1");
  if (hasH1) warnings.push("內文使用了 H1，已整體降一級（H1→H2、H2→H3）");
  const blocks = convertList(notionBlocks, images, hasH1);
  return { blocks, warnings };
}

function flatten(blocks: NotionBlock[]): NotionBlock[] {
  return blocks.flatMap((b) => [b, ...flatten(b.children ?? [])]);
}

function convertList(
  notionBlocks: NotionBlock[],
  images: Map<string, ResolvedImage>,
  shiftHeadings: boolean,
): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < notionBlocks.length; i++) {
    const block = notionBlocks[i];
    const data = payload(block);
    switch (block.type) {
      case "paragraph": {
        const inlines = inlinesOf(block);
        if (plain(inlines).trim()) out.push({ type: "paragraph", inlines });
        break;
      }
      case "heading_1":
      case "heading_2":
      case "heading_3": {
        const notionLevel = Number(block.type.slice(-1));
        const level = Math.min(3, Math.max(2, shiftHeadings ? notionLevel + 1 : notionLevel));
        out.push({
          type: "heading",
          level: level as 2 | 3,
          // 用 block ID 當錨點：改標題文字也不會斷鏈
          id: `h-${block.id.replaceAll("-", "").slice(0, 10)}`,
          inlines: inlinesOf(block),
        });
        break;
      }
      case "bulleted_list_item":
      case "numbered_list_item": {
        const run = [block];
        while (notionBlocks[i + 1]?.type === block.type) run.push(notionBlocks[++i]);
        out.push(toList(run, block.type === "numbered_list_item"));
        break;
      }
      case "quote": {
        const { body, source } = splitSource(inlinesOf(block));
        out.push({ type: "quote", inlines: body, ...(source ? { source } : {}) });
        break;
      }
      case "callout": {
        const icon = (data.icon as { emoji?: string } | null)?.emoji;
        const inlines = inlinesOf(block);
        if (icon !== SCRIPTURE_ICON) {
          out.push({ type: "callout", inlines });
          break;
        }
        // 經文：必須在最後一行標「——書卷 章:節（版本）」，內文一字不改
        const { body, source } = splitSource(inlines);
        if (!source)
          throw new BlockError(block.id, "經文缺少出處（最後一行請寫「——書卷 章:節（版本）」）");
        const match = source.match(/^(.*?)(?:[（(]([^）)]+)[）)])?$/);
        const reference = (match?.[1] ?? source).trim();
        const version = match?.[2]?.trim();
        out.push({ type: "scripture", inlines: body, reference, ...(version ? { version } : {}) });
        break;
      }
      case "image": {
        const resolved = images.get(block.id);
        if (!resolved) throw new BlockError(block.id, "圖片沒有成功擷取成網站資產");
        const caption = plain(
          richTextToInlines((data.caption ?? []) as NotionRichText[], block.id),
        ).trim();
        // Notion 沒有獨立的 alt 欄位，以圖說當替代文字
        out.push({ type: "image", ...resolved, alt: caption, ...(caption ? { caption } : {}) });
        break;
      }
      case "table": {
        const rows = childrenOf(block).map((row) =>
          ((payload(row).cells ?? []) as NotionRichText[][]).map((cell) =>
            richTextToInlines(cell, row.id),
          ),
        );
        out.push({ type: "table", hasHeader: Boolean(data.has_column_header), rows });
        break;
      }
      case "code": {
        const code = ((data.rich_text ?? []) as NotionRichText[]).map((t) => t.plain_text).join("");
        const caption = ((data.caption ?? []) as NotionRichText[])
          .map((t) => t.plain_text)
          .join("")
          .trim();
        const language = typeof data.language === "string" ? data.language : undefined;
        out.push({
          type: "code",
          code,
          ...(language ? { language } : {}),
          ...(caption ? { caption } : {}),
        });
        break;
      }
      case "divider":
        out.push({ type: "divider" });
        break;
      case "toggle": {
        // toggle 的內容預設可讀：標題當一段粗體，內容照順序展開
        const summary = inlinesOf(block).map((inline) => ({ ...inline, bold: true }));
        if (plain(summary).trim()) out.push({ type: "paragraph", inlines: summary });
        out.push(...convertList(childrenOf(block), images, shiftHeadings));
        break;
      }
      case "column_list":
      case "column":
        // 複雜分欄展平並維持順序
        out.push(...convertList(childrenOf(block), images, shiftHeadings));
        break;
      default:
        if (SKIPPED_TYPES.has(block.type)) break;
        throw new BlockError(block.id, `不支援的區塊類型：${block.type}`);
    }
  }
  return out;
}

function propText(prop: Record<string, unknown> | undefined): string {
  const parts = (prop?.title ?? prop?.rich_text ?? []) as NotionRichText[];
  return parts
    .map((t) => t.plain_text)
    .join("")
    .trim();
}

/**
 * 把 Notion 頁面屬性＋已轉換的正文組成 Post。
 * 只組資料，不判斷能不能公開；公開與否由 isPublic() 決定。
 *
 * Args:
 *   page: Notion 頁面物件。
 *   blocks: convertBlocks() 的結果。
 *   previous: 上一份快照裡同一篇文章；有的話沿用它的 slug 與日期（網址首次發布後凍結）。
 */
export function pageToPost(page: NotionPage, blocks: Block[], previous?: Post): Post {
  const props = page.properties;
  const topicName = (props.Topic?.select as { name?: string } | null)?.name ?? "";
  const topic = TOPIC_BY_NAME[topicName] ?? (topicName as TopicSlug);
  const statusName = (props.Status?.status as { name?: string } | null)?.name ?? "Draft";
  const status = STATUSES.includes(statusName as PostStatus) ? (statusName as PostStatus) : "Draft";
  const publishedAt = (props.PublishedAt?.date as { start?: string } | null)?.start ?? "";
  const episodeUrl = (props.EpisodeURL?.url as string | null) ?? null;
  const firstParagraph = blocks.find((b) => b.type === "paragraph");
  const excerpt =
    propText(props.Excerpt) ||
    (firstParagraph?.type === "paragraph" ? plain(firstParagraph.inlines) : "");

  const wasPublished = previous?.status === "Published";
  return {
    id: page.id,
    title: propText(props.Title),
    slug: wasPublished ? previous.slug : propText(props.Slug),
    date: wasPublished ? previous.date : publishedAt ? taipeiDate(publishedAt) : "",
    topic: TOPIC_SLUGS.includes(topic) ? topic : (topicName as TopicSlug),
    status,
    publishedAt,
    updatedAt: page.last_edited_time,
    excerpt,
    ...(episodeUrl && safeHref(episodeUrl, page.id) ? { episode: { url: episodeUrl } } : {}),
    blocks,
    source: "notion",
    ...(page.archived || page.in_trash ? { archived: true } : {}),
  };
}
