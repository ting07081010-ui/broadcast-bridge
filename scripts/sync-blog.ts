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
 * - 單篇含未支援內容時阻擋該篇並印出 block ID，其他文章照常同步。
 * - 只把 Status＝Published 的文章寫進快照；排程未到的由網站端的發布閘門擋下。
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { BlockError, convertBlocks, pageToPost } from "../src/lib/blog/notion.ts";
import type { NotionBlock, NotionPage, ResolvedImage } from "../src/lib/blog/notion.ts";
import { validatePost } from "../src/lib/blog/posts.ts";
import type { BlogSnapshot, Post } from "../src/lib/blog/types.ts";

const NOTION_API = "https://api.notion.com/v1";
// 鎖定 API 版本，不跟著 Notion 預設值漂移
const NOTION_VERSION = "2022-06-28";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT_PATH = join(ROOT, "src/content/blog/snapshot.json");
const MEDIA_DIR = join(ROOT, "public/blog/media");
const IMAGE_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_BLOG_DATABASE_ID;

async function notion<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${NOTION_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Notion API ${res.status}：${path}`);
  return (await res.json()) as T;
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
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49) {
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
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { width, height };
  }
  if (tag === "VP8 ") {
    return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
  }
  if (tag === "VP8L") {
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

/**
 * Notion 託管的圖片網址會過期：在有效期內下載，存成以內容雜湊命名的網站公開資產。
 * 下載或解析失敗時不回傳，轉換層會因此阻擋該篇，而不是留一張壞圖。
 */
async function resolveImages(blocks: NotionBlock[]): Promise<Map<string, ResolvedImage>> {
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
        const res = url ? await fetch(url) : null;
        const type = res?.headers.get("content-type")?.split(";")[0] ?? "";
        const ext = IMAGE_TYPES[type] ?? (url ? extname(new URL(url).pathname) : "");
        if (res?.ok && Object.values(IMAGE_TYPES).includes(ext)) {
          const bytes = new Uint8Array(await res.arrayBuffer());
          const size = imageSize(bytes);
          if (size) {
            const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
            await mkdir(MEDIA_DIR, { recursive: true });
            await writeFile(join(MEDIA_DIR, `${hash}${ext}`), bytes);
            images.set(block.id, { src: `/blog/media/${hash}${ext}`, ...size });
          }
        }
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
      if (paths.has(path)) problems.push(`網址重複：${path}`);
      if (problems.length > 0) {
        blocked.push(`「${post.title || page.id}」：${problems.join("；")}`);
        continue;
      }
      paths.add(path);
      posts.push(post);
      for (const warning of warnings) console.warn(`提醒「${post.title}」：${warning}`);
    } catch (error) {
      // 只有內容問題可以跳過單篇；網路或權限錯誤要整批中止，保留舊快照
      if (!(error instanceof BlockError)) throw error;
      blocked.push(`頁面 ${page.id}：${error.message}`);
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
