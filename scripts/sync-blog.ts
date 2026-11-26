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
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  BlockError,
  convertBlocks,
  pageToPost,
  selectPublicBlocks,
} from "../src/lib/blog/notion.ts";
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
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const FETCH_TIMEOUT_MS = 15_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** 只允許公開的 http(s) 圖片網址，阻擋 localhost／內網／link-local 等 SSRF 目標。 */
export function isSafeImageUrl(rawUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return false;
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return false;
  }
  // IPv4 私網、迴圈、link-local 與 CGNAT 網段（WHATWG URL 會正規化八進位／十進位 IP）
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    ) {
      return false;
    }
  }
  // IPv6 迴圈、未指定、link-local（fe80::/10）、ULA（fc00::/7）與 IPv4 映射位址
  if (host.includes(":")) {
    if (
      host === "::" ||
      host === "::1" ||
      /^fe[89ab][0-9a-f]:/.test(host) ||
      /^f[cd][0-9a-f]{2}:/.test(host) ||
      host.startsWith("::ffff:")
    ) {
      return false;
    }
  }
  return true;
}

/** 從檔頭魔術位元組（Magic Bytes）判斷圖片副檔名，不依賴伺服器 Content-Type 或網址副檔名。 */
export function detectImageExt(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return ".png";
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return ".gif";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return ".jpg";
  }
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff === "RIFF" && webp === "WEBP") {
    return ".webp";
  }
  return null;
}

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
    const path = `${previous.date}-${previous.slug}`;
    if (!paths.has(path)) {
      paths.add(path);
      posts.push(previous);
    }
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

/** 分頁不完整或游標循環時中止整批，不能把截斷的內容當作完整結果。 */
export async function collectNotionPages<T>(
  fetchPage: (cursor: string | null) => Promise<Paginated<T>>,
): Promise<T[]> {
  const results: T[] = [];
  const seen = new Set<string>();
  let cursor: string | null = null;
  for (;;) {
    const page = await fetchPage(cursor);
    if (!page || !Array.isArray(page.results) || typeof page.has_more !== "boolean") {
      throw new Error("Notion 分頁回應格式不正確");
    }
    results.push(...page.results);
    if (!page.has_more) return results;
    const next = page.next_cursor;
    if (typeof next !== "string" || !next.trim() || seen.has(next)) {
      throw new Error("Notion 分頁游標缺失或重複");
    }
    seen.add(next);
    cursor = next;
  }
}

/** 走完所有分頁，不能只讀第一批。 */
async function queryAllPages(): Promise<NotionPage[]> {
  return collectNotionPages((cursor) => {
    const body: Record<string, unknown> = {
      page_size: 100,
      filter: { property: "Status", status: { equals: "Published" } },
    };
    if (cursor) body.start_cursor = cursor;
    return notion<Paginated<NotionPage>>(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  });
}

/** 遞迴取回所有子區塊（含分頁），避免長文被默默截斷。 */
async function fetchBlocks(blockId: string): Promise<NotionBlock[]> {
  const blocks = await collectNotionPages((cursor) => {
    const query = cursor
      ? `?page_size=100&start_cursor=${encodeURIComponent(cursor)}`
      : "?page_size=100";
    return notion<Paginated<NotionBlock>>(`/blocks/${blockId}/children${query}`);
  });
  for (const block of blocks) {
    if (block.has_children) block.children = await fetchBlocks(block.id);
  }
  return blocks;
}

/** 從檔頭讀出圖片尺寸（PNG／GIF／JPEG／WebP），用來預留版面比例。 */
export function imageSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 16) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes.length >= 24
  ) {
    const width = view.getUint32(16);
    const height = view.getUint32(20);
    return width > 0 && height > 0 ? { width, height } : null;
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    const width = view.getUint16(6, true);
    const height = view.getUint16(8, true);
    return width > 0 && height > 0 ? { width, height } : null;
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset < bytes.length) {
      while (offset < bytes.length && bytes[offset] !== 0xff) offset++;
      while (offset < bytes.length && bytes[offset] === 0xff) offset++;
      if (offset >= bytes.length) break;
      const marker = bytes[offset];
      offset++;
      // EOI(D9) 結束圖片，無須繼續掃描
      if (marker === 0xd9) break;
      // 獨立 marker 與 byte stuffing（0x00）不含長度欄位
      if (
        marker === 0x00 ||
        marker === 0xd8 ||
        marker === 0x01 ||
        (marker >= 0xd0 && marker <= 0xd7)
      ) {
        continue;
      }
      if (offset + 2 > bytes.length) break;
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      // SOF0–SOF15（不含 DHT=C4、JPG=C8、DAC=CC）帶有尺寸
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        if (length >= 7 && offset + 7 <= bytes.length) {
          const width = view.getUint16(offset + 5);
          const height = view.getUint16(offset + 3);
          return width > 0 && height > 0 ? { width, height } : null;
        }
        break;
      }
      offset += length;
    }
    return null;
  }
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff !== "RIFF" || webp !== "WEBP") return null;
  const tag = String.fromCharCode(...bytes.slice(12, 16));
  if (tag === "VP8X" && bytes.length >= 30) {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return width > 0 && height > 0 ? { width, height } : null;
  }
  if (tag === "VP8 " && bytes.length >= 30) {
    const width = view.getUint16(26, true) & 0x3fff;
    const height = view.getUint16(28, true) & 0x3fff;
    return width > 0 && height > 0 ? { width, height } : null;
  }
  if (tag === "VP8L" && bytes.length >= 25) {
    const bits = view.getUint32(21, true);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return width > 0 && height > 0 ? { width, height } : null;
  }
  return null;
}

/** 串流讀取回應位元組，超過上限即中止以避免大檔撐爆記憶體。 */
async function readBodyWithLimit(res: Response, limit: number): Promise<Uint8Array | null> {
  const contentLength = res.headers.get("content-length");
  if (contentLength !== null && Number(contentLength) > limit) {
    await res.body?.cancel();
    return null;
  }
  if (!res.body) {
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf.byteLength <= limit ? buf : null;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

/** 下載圖片時阻擋不安全網址並限制連線／讀取時間，錯誤不輸出可能含簽章的來源網址。 */
export async function downloadImage(
  url: string,
  blockId: string,
  options: { timeoutMs?: number; fetcher?: typeof fetch } = {},
): Promise<{ bytes: Uint8Array; type: string; ext: string }> {
  if (!isSafeImageUrl(url)) {
    throw new BlockError(blockId, "圖片網址不安全或格式錯誤");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? FETCH_TIMEOUT_MS);
  try {
    const response = await (options.fetcher ?? fetch)(url, { signal: controller.signal });
    if (!response.ok) throw new BlockError(blockId, `圖片下載失敗（HTTP ${response.status}）`);
    const bytes = await readBodyWithLimit(response, MAX_IMAGE_BYTES);
    if (!bytes) {
      throw new BlockError(blockId, `圖片超過大小上限（上限 ${MAX_IMAGE_BYTES} bytes）`);
    }
    const type = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
    const rawExt = extname(new URL(url).pathname).toLowerCase();
    const normExt = rawExt === ".jpeg" ? ".jpg" : rawExt;
    const ext =
      detectImageExt(bytes) ??
      IMAGE_TYPES[type] ??
      (Object.values(IMAGE_TYPES).includes(normExt) ? normExt : "");
    if (!ext) {
      throw new BlockError(blockId, "圖片格式不支援，請使用 PNG、JPEG、WebP 或 GIF");
    }
    return { bytes, type, ext };
  } catch (error) {
    if (error instanceof BlockError) throw error;
    throw new Error(
      controller.signal.aborted
        ? `圖片下載逾時（block ${blockId}）`
        : `圖片下載網路錯誤（block ${blockId}）`,
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Notion 託管的圖片網址會過期：在有效期內下載，存成以內容雜湊命名的網站公開資產。
 * HTTP、SSRF、格式、大小或尺寸問題會阻擋該篇並回報區塊 ID；網路例外仍中止整批。
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
        const { bytes, ext } = await downloadImage(url, block.id);
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

/**
 * 判斷一篇文章是否可直接沿用既有快照（頁面未修改、未封存、狀態為 Published、校驗通過且所有本地圖片皆存在）。
 * 讓日常排程只針對新增或有編輯過的文章呼叫 Notion 區塊 API 與下載圖片。
 */
export async function canReusePrevious(
  page: NotionPage,
  previous: Post | undefined,
  mediaExists: (src: string) => Promise<boolean>,
): Promise<boolean> {
  if (!previous) return false;
  if (page.archived || page.in_trash) return false;
  if (previous.status !== "Published") return false;
  if (previous.updatedAt !== page.last_edited_time) return false;
  if (validatePost(previous).length > 0) return false;
  for (const block of previous.blocks) {
    if (block.type === "image" && !(await mediaExists(block.src))) {
      return false;
    }
  }
  return true;
}

async function localMediaExists(src: string): Promise<boolean> {
  try {
    await access(join(ROOT, "public", src));
    return true;
  } catch {
    return false;
  }
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
  const forceFull = process.argv.includes("--full");
  let reusedCount = 0;

  for (const page of pages) {
    const existing = previousById.get(page.id);
    try {
      if (!forceFull && (await canReusePrevious(page, existing, localMediaExists)) && existing) {
        const cachedPath = `${existing.date}-${existing.slug}`;
        if (!hasPathConflict(cachedPath, existing.id, reservedPaths, paths)) {
          paths.add(cachedPath);
          posts.push(existing);
          reusedCount++;
          continue;
        }
      }
      const notionBlocks = selectPublicBlocks(await fetchBlocks(page.id));
      const images = await resolveImages(notionBlocks);
      const { blocks, warnings } = convertBlocks(notionBlocks, images);
      const post = pageToPost(page, blocks, existing);
      const problems = validatePost(post);
      const path = `${post.date}-${post.slug}`;
      if (hasPathConflict(path, post.id, reservedPaths, paths)) {
        problems.push(`網址重複：${path}`);
      }
      if (problems.length > 0) {
        retainBlockedPost(
          { title: post.title || pageTitle(page) },
          page.id,
          problems.join("；"),
          posts,
          paths,
          blocked,
          existing,
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
        existing,
      );
    }
  }

  // 撤稿／封存：這次沒有回傳的文章不會留在新快照裡
  const removed = previous.posts.filter((old) => !posts.some((post) => post.id === old.id));
  const snapshot: BlogSnapshot = { syncedAt: new Date().toISOString(), posts };
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(
    `同步完成：${posts.length} 篇寫入快照（${reusedCount} 篇沿用快取），${removed.length} 篇移除，${blocked.length} 篇被阻擋`,
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
