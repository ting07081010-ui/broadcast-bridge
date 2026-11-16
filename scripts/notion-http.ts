const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

type Options = {
  fetcher?: typeof fetch;
  wait?: (ms: number) => Promise<void>;
  timeoutMs?: number;
  attempts?: number;
};

/** 同步只呼叫 Notion 唯讀端點；限流與暫時性錯誤以有限次數重試。 */
export async function fetchNotionJson<T = unknown>(
  path: string,
  token: string,
  init?: RequestInit,
  options: Options = {},
): Promise<T> {
  const fetcher = options.fetcher ?? fetch;
  const wait = options.wait ?? ((ms) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const attempts = options.attempts ?? 3;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
    let delay = 500 * 2 ** attempt;
    try {
      const response = await fetcher(`${NOTION_API}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      if (response.ok) return (await response.json()) as T;
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === attempts - 1)
        throw new Error(`Notion API ${response.status}：${path}`);
      const retryAfter = Number(response.headers.get("retry-after"));
      if (response.status === 429 && Number.isFinite(retryAfter) && retryAfter > 0) {
        if (retryAfter > 30) throw new Error(`Notion API 429：${path}（重試等待時間超過上限）`);
        delay = retryAfter * 1000;
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Notion API ")) throw error;
      if (attempt === attempts - 1) {
        throw new Error(
          controller.signal.aborted ? `Notion 請求逾時：${path}` : `Notion 請求失敗：${path}`,
        );
      }
    } finally {
      clearTimeout(timer);
    }
    await wait(delay);
  }
  throw new Error("Notion 請求未執行");
}
