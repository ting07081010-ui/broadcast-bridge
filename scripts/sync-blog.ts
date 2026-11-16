/// <reference types="node" />
/**
 * 從 Notion 唯讀擷取部落格文章，產生版本化內容快照與穩定的圖片資產。
 *
 * 用法（Node 22.18+，直接執行 TypeScript）：
 *   NOTION_TOKEN=... NOTION_BLOG_DATABASE_ID=... node scripts/sync-blog.ts
 *
 * 狀態：尚未對真實 Notion 資料庫執行過。欄位名稱依規劃 9.2 的提案
 * （Title／Slug／Topic／Status／PublishedAt／Excerpt／EpisodeURL）。
 *
 * 保護原則：
 * - 權杖只從環境變數讀取，不寫入任何檔案或 log。
 * - 任何一步失敗都不覆寫既有快照（不把空結果當成「文章全刪了」）。
 * - 單篇含未支援內容時阻擋該篇並印出標題、頁面 ID 與原因，其他文章照常同步。
 * - 只把 Status＝Published 的文章寫進快照；排程未到的由網站端的發布閘門擋下。
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { BlockError, convertBlocks, pageToPost } from "../src/lib/blog/notion.ts";
import type {
  NotionBlock,
  NotionPage,
  NotionRichText,
  ResolvedImage,
} from "../src/lib/blog/notion.ts";
import { fetchNotionJson } from "./notion-http.ts";
import { validatePost } from "../src/lib/blog/posts.ts";
import type { BlogSnapshot, Post } from "../src/lib/blog/types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT_PATH = join(ROOT, "src/content/blog/snapshot.json");
const MEDIA_DIR = join(ROOT, "public/blog/media");
const IMAGE_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** 給同步紀錄與內容 PR 用：有標題就同時寫標題與頁面 ID。 */
export function blockedPostLine(title: string, pageId: string, reason: string): string {
  const name = title.trim();
  return name ? `「${name}」（${pageId}）：${reason}` : `頁面 ${pageId}：${reason}`;
}

/** 保留已發布版本，同時讓同步工作明確標記內容需要修正。 */
export function retainBlockedPost(
  post: Pick<Post, "title"> | undefined,
  pageId: string,
  reason: string,
  posts: Post[],
  paths: Set<string>,
  blocked: string[],
  previous?: Post,
): void {
  blocked.push(blockedPostLine(post?.title ?? "", pageId, reason));
  if (previous) {
    paths.add(`${previous.date}-${previous.slug}`);
    posts.push(previous);
  }
}

/** 為仍在來源資料庫的舊文章保留網址，不受查詢順序影響。 */
export function reservePublishedPaths(previous: Post[], pageIds: string[]): Map<string, string> {
  const active = new Set(pageIds);
  const reserved = new Map<string, string>();
  for (const post of previous) {
    if (!active.has(post.id)) continue;
    const path = `${post.date}-${post.slug}`;
    const owner = reserved.get(path);
    if (owner && owner !== post.id) throw new Error(`既有快照網址重複：${path}`);
    reserved.set(path, post.id);
  }
  return reserved;
}

export function hasPathConflict(
  path: string,
  id: string,
  reserved: Map<string, string>,
  used: Set<string>,
): boolean {
  const owner = reserved.get(path);
  return used.has(path) || (owner !== undefined && owner !== id);
}

function pageTitle(page: NotionPage): string {
  const parts = (page.properties.Title?.title ?? []) as NotionRichText[];
  return parts
    .map((part) => part.plain_text)
    .join("")
    .trim();
}

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_BLOG_DATABASE_ID;

async function notion<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchNotionJson<T>(path, token!, init);
}

type Paginated<T> = { results: T[]; has_more: boolean; next_cursor: string | null };

/** 走完所有分頁，不能只讀第一批。 */
async function queryAllPages(): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | null = null;
  do {
    const body: Record<string, unknown> = {
      page_size: 100,
      filter: { property: "Status", status: { equals: "Published" } },
    };
    if (cursor) body.start_cursor = cursor;
    const page: Paginated<NotionPage> = await notion(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    pages.push(...page.results);
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  return pages;
}

/** 遞迴取回所有子區塊（含分頁），避免長文被默默截斷。 */
async function fetchBlocks(blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | null = null;
  do {
    const query = cursor ? `?page_size=100&start_cursor=${cursor}` : "?page_size=100";
    const page: Paginated<NotionBlock> = await notion(`/blocks/${blockId}/children${query}`);
    blocks.push(...page.results);
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  for (const block of blocks) {
    if (block.has_children) block.children = await fetchBlocks(block.id);
  }
  return blocks;
}

/** 從檔頭讀出圖片尺寸（PNG／GIF／JPEG／WebP），用來預留版面比例。 */
export function imageSize(bytes: Uint8Array): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes[0] === 0x89 && bytes[1] === 0x50) {
    if (bytes.length < 24) return null;
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49) {
    if (bytes.length < 10) return null;
    return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      const marker = bytes[offset + 1];
      const length = view.getUint16(offset + 2);
      // SOF0–SOF15（不含 DHT／JPG／DAC）帶有尺寸
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: view.getUint16(offset + 7), height: view.getUint16(offset + 5) };
      }
      offset += 2 + length;
    }
    return null;
  }
  const tag = String.fromCharCode(...bytes.slice(12, 16));
  if (tag === "VP8X") {
    if (bytes.length < 30) return null;
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { width, height };
  }
  if (tag === "VP8 ") {
    if (bytes.length < 30) return null;
    return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
  }
  if (tag === "VP8L") {
    if (bytes.length < 25) return null;
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

/**
 * Notion 託管的圖片網址會過期：在有效期內下載，存成以內容雜湊命名的網站公開資產。
 * HTTP、格式或尺寸問題會阻擋該篇並回報區塊 ID；網路例外仍中止整批。
 */
export async function resolveImages(blocks: NotionBlock[]): Promise<Map<string, ResolvedImage>> {
  const images = new Map<string, ResolvedImage>();
  const walk = async (list: NotionBlock[]): Promise<void> => {
    for (const block of list) {
      if (block.type === "image") {
        const data = block.image as {
          type: string;
          file?: { url: string };
          external?: { url: string };
        };
        const url = data.type === "file" ? data.file?.url : data.external?.url;
        if (!url) throw new BlockError(block.id, "圖片缺少來源網址");
        const res = await fetch(url);
        if (!res.ok) throw new BlockError(block.id, `圖片下載失敗（HTTP ${res.status}）`);
        const type = res.headers.get("content-type")?.split(";")[0] ?? "";
        const ext = IMAGE_TYPES[type] ?? extname(new URL(url).pathname).toLowerCase();
        if (!Object.values(IMAGE_TYPES).includes(ext)) {
          throw new BlockError(block.id, "圖片格式不支援，請使用 PNG、JPEG、WebP 或 GIF");
        }
        const bytes = new Uint8Array(await res.arrayBuffer());
        const size = imageSize(bytes);
        if (!size || !size.width || !size.height) {
          throw new BlockError(block.id, "圖片損壞或無法讀取尺寸");
        }
        const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
        await mkdir(MEDIA_DIR, { recursive: true });
        await writeFile(join(MEDIA_DIR, `${hash}${ext}`), bytes);
        images.set(block.id, { src: `/blog/media/${hash}${ext}`, ...size });
      }
      if (block.children) await walk(block.children);
    }
  };
  await walk(blocks);
  return images;
}

async function main(): Promise<void> {
  if (!token || !databaseId) {
    throw new Error("請設定環境變數 NOTION_TOKEN 與 NOTION_BLOG_DATABASE_ID");
  }
  const previous = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8")) as BlogSnapshot;
  const previousById = new Map(previous.posts.map((post) => [post.id, post]));

  const pages = await queryAllPages();
  // Notion 回傳 0 篇但既有快照有文章：多半是權限或篩選出錯，中止而不覆寫
  if (pages.length === 0 && previous.posts.length > 0) {
    throw new Error(
      `Notion 回傳 0 篇文章，但既有快照有 ${previous.posts.length} 篇；為避免誤刪，中止同步`,
    );
  }
  const reservedPaths = reservePublishedPaths(
    previous.posts,
    pages.map((page) => page.id),
  );
  const posts: Post[] = [];
  const blocked: string[] = [];
  const paths = new Set<string>();

  for (const page of pages) {
    try {
      const notionBlocks = await fetchBlocks(page.id);
      const images = await resolveImages(notionBlocks);
      const { blocks, warnings } = convertBlocks(notionBlocks, images);
      const post = pageToPost(page, blocks, previousById.get(page.id));
      const problems = validatePost(post);
      const path = `${post.date}-${post.slug}`;
      if (hasPathConflict(path, post.id, reservedPaths, paths)) problems.push(`網址重複：${path}`);
      if (problems.length > 0) {
        retainBlockedPost(
          { title: post.title || pageTitle(page) },
          page.id,
          problems.join("；"),
          posts,
          paths,
          blocked,
          previousById.get(page.id),
        );
        continue;
      }
      paths.add(path);
      posts.push(post);
      for (const warning of warnings) console.warn(`提醒「${post.title}」：${warning}`);
    } catch (error) {
      // 只有內容問題可以跳過單篇；網路或權限錯誤要整批中止，保留舊快照
      if (!(error instanceof BlockError)) throw error;
      // 內容有問題時保留舊版本，並使工作流程回報阻擋。
      retainBlockedPost(
        { title: pageTitle(page) },
        page.id,
        error.message,
        posts,
        paths,
        blocked,
        previousById.get(page.id),
      );
    }
  }

  // 撤稿／封存：這次沒有回傳的文章不會留在新快照裡
  const removed = previous.posts.filter((old) => !posts.some((post) => post.id === old.id));
  const snapshot: BlogSnapshot = { syncedAt: new Date().toISOString(), posts };
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(
    `同步完成：${posts.length} 篇寫入快照，${removed.length} 篇移除，${blocked.length} 篇被阻擋`,
  );
  for (const line of blocked) console.error(`阻擋 ${line}`);
  if (blocked.length > 0) process.exitCode = 2;
}

// 被測試檔 import 時不執行
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(`同步失敗，既有快照未變更：${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  });
}
