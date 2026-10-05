import type { YouTubeVideo } from "./youtube.functions";

/** 移除標題中的 #hashtag，供顯示、alt 與去重比對使用。 */
export function stripHashtags(title: string): string {
  return title.replace(/\s*#[^\s#]+/g, "").trim();
}

/**
 * 同一集在頻道上常有兩支影片（標題僅差在 hashtag），video ID 不同，
 * 所以必須用「去除 hashtag 後的標題」比對，不能用 ID。
 *
 * TODO(host): 同題雙影片保留哪支待人工決定。伺服端無法判定縮圖是否正常，
 * 目前採規劃 0.6 的預設值：保留帶 hashtag 的版本，顯示時去掉 hashtag。
 *
 * Args:
 *   videos: 依發布時間新到舊排列的影片。
 *   limit: 最多回傳幾支。
 *
 * Returns:
 *   每集一支、維持原順序的影片清單。
 */
export function dedupeVideos(videos: YouTubeVideo[], limit = 3): YouTubeVideo[] {
  const byTitle = new Map<string, YouTubeVideo>();
  for (const video of videos) {
    const key = stripHashtags(video.title);
    const kept = byTitle.get(key);
    const hasHashtag = video.title.includes("#");
    if (!kept || (hasHashtag && !kept.title.includes("#"))) {
      byTitle.set(key, video);
    }
  }
  return [...byTitle.values()].slice(0, limit);
}
