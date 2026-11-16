/** 限制外部來源的連線與讀取時間，避免拖慢首頁。 */
export async function fetchFeed(
  url: string,
  timeoutMs = 5000,
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
