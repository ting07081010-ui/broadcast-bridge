const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

/** 限制外部來源的連線與讀取時間，避免拖慢首頁。 */
export async function fetchFeed(
  url: string,
  timeoutMs = 4000,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(url, {
      headers: { "User-Agent": "EnianPodcastSite/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 從 `fast-xml-parser` 解析後的節點安全擷取純文字。
 * 避免含屬性的 XML 標籤在轉字串時變成 `"[object Object]"`。
 */
export function extractText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (Array.isArray(value)) return value.length > 0 ? extractText(value[0]) : "";
  if (typeof value === "object" && value !== null) {
    const text = (value as Record<string, unknown>)["#text"];
    if (typeof text === "string" || typeof text === "number") {
      return extractText(text);
    }
  }
  return "";
}

/**
 * 驗證並規範外部連結，僅允許 `http:` 與 `https:` 協定。
 * 可處理純字串或 Atom `<link href="..." />` 類型的屬性物件。
 */
export function safeHttpUrl(value: unknown): string | undefined {
  let raw = extractText(value);
  if (!raw && typeof value === "object" && value !== null) {
    const record = Array.isArray(value) ? value[0] : value;
    if (typeof record === "object" && record !== null) {
      const attr =
        (record as Record<string, unknown>)["@_href"] ??
        (record as Record<string, unknown>)["@_url"];
      raw = extractText(attr);
    }
  }
  if (!raw) return undefined;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/** 解析正整數／正數集數編號，過濾 `NaN`、0 與負數。 */
export function parseEpisodeNumber(value: unknown): number | undefined {
  const raw = extractText(value);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** 解析 `itunes:duration`（秒數或 `HH:MM:SS` / `MM:SS`）。 */
export function parseDuration(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  }
  const raw = extractText(value);
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  const segments = raw.split(":");
  if (segments.length !== 2 && segments.length !== 3) return undefined;
  if (!segments.every((s) => /^\d+$/.test(s))) return undefined;
  const parts = segments.map((s) => parseInt(s, 10));
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

/** 移除 HTML 標籤並解碼常見實體。 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos|#39);/g, (entity) => HTML_ENTITY_MAP[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

/** 驗證 YouTube Video ID（僅允許標準 11 碼英數與 `-_`）。 */
export function safeYouTubeVideoId(value: unknown): string | undefined {
  const id = extractText(value);
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : undefined;
}
