import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { XMLParser } from "fast-xml-parser";

const CHANNEL_ID = "UC59PKXHHazdIDsLn-9EJ6jQ";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  thumbnail: string;
};

export const getYouTubeVideos = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ videos: YouTubeVideo[]; source: "rss" | "fallback"; error?: string }> => {
    try {
      setResponseHeaders(
        new Headers({ "Cache-Control": "public, max-age=300, s-maxage=300" }),
      );

      const res = await fetch(FEED_URL, {
        headers: { "User-Agent": "EnianPodcastSite/1.0" },
      });
      if (!res.ok) {
        return { videos: [], source: "fallback", error: `HTTP ${res.status}` };
      }
      const xml = await res.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const data = parser.parse(xml);
      const entries = data?.feed?.entry;
      if (!entries) return { videos: [], source: "fallback", error: "no entries" };
      const list = Array.isArray(entries) ? entries : [entries];

      const videos: YouTubeVideo[] = list.slice(0, 6).map((e: any) => {
        const videoId = String(e["yt:videoId"] ?? "");
        return {
          id: videoId,
          title: String(e.title ?? "").trim(),
          url: `https://www.youtube.com/watch?v=${videoId}`,
          publishedAt: String(e.published ?? ""),
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      }).filter((v) => v.id);

      return { videos, source: "rss" };
    } catch (err) {
      console.error("YouTube RSS error:", err);
      return {
        videos: [],
        source: "fallback",
        error: err instanceof Error ? err.message : "unknown",
      };
    }
  },
);
