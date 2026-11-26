import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { XMLParser } from "fast-xml-parser";
import { extractText, fetchFeed, safeYouTubeVideoId } from "./feed";

const CHANNEL_ID = "UC59PKXHHazdIDsLn-9EJ6jQ";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const FETCH_TIMEOUT_MS = 4000;

export type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  thumbnail: string;
};

type ParsedYouTubeEntry = {
  "yt:videoId"?: unknown;
  title?: unknown;
  published?: unknown;
};

function trySetCacheControl(value: string) {
  try {
    setResponseHeaders(new Headers({ "Cache-Control": value }));
  } catch {
    // 非標準請求或預渲染環境可能無 response context，略過標頭設定
  }
}

export const getYouTubeVideos = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ videos: YouTubeVideo[]; source: "rss" | "fallback"; error?: string }> => {
    try {
      const xml = await fetchFeed(FEED_URL, FETCH_TIMEOUT_MS);
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const data = parser.parse(xml);
      const entries = data?.feed?.entry;
      if (!entries) {
        trySetCacheControl("no-store");
        return { videos: [], source: "fallback", error: "no entries" };
      }
      const list = Array.isArray(entries) ? entries : [entries];

      const videos: YouTubeVideo[] = [];
      for (const entry of list as ParsedYouTubeEntry[]) {
        const videoId = safeYouTubeVideoId(entry["yt:videoId"]);
        if (!videoId) continue;
        videos.push({
          id: videoId,
          title: extractText(entry.title),
          url: `https://www.youtube.com/watch?v=${videoId}`,
          publishedAt: extractText(entry.published),
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        });
        if (videos.length >= 6) break;
      }

      trySetCacheControl("public, max-age=300, s-maxage=300");
      return { videos, source: "rss" };
    } catch (err) {
      console.error("YouTube RSS error:", err);
      trySetCacheControl("no-store");
      return {
        videos: [],
        source: "fallback",
        error: err instanceof Error ? err.message : "unknown",
      };
    }
  },
);
