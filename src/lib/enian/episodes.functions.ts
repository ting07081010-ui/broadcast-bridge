import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { XMLParser } from "fast-xml-parser";
import { PODCAST } from "@/lib/enian/constants";
import {
  extractText,
  fetchFeed,
  parseDuration,
  parseEpisodeNumber,
  safeHttpUrl,
  stripHtml,
} from "./feed";

export type Episode = {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
  audioUrl?: string;
  durationSec?: number;
  episodeNumber?: number;
};

type ParsedEpisodeItem = {
  title?: unknown;
  description?: unknown;
  link?: unknown;
  pubDate?: unknown;
  guid?: unknown;
  enclosure?: unknown;
  "itunes:summary"?: unknown;
  "content:encoded"?: unknown;
  "itunes:duration"?: unknown;
  "itunes:episode"?: unknown;
};

const FALLBACK_EPISODES: Episode[] = [
  {
    id: "fallback-1",
    title: "EP001｜為什麼我開始碎念？",
    description: "從一個腦袋停不下來的 E 人，聊到為什麼自言自語也可以是一種整理世界的方法。",
    pubDate: "",
    link: "#tune-in",
    episodeNumber: 1,
  },
  {
    id: "fallback-2",
    title: "EP002｜資安其實離你很近",
    description: "密碼、詐騙、個資外洩，不只是工程師的事，而是每個家庭都該懂一點的生活常識。",
    pubDate: "",
    link: "#tune-in",
    episodeNumber: 2,
  },
  {
    id: "fallback-3",
    title: "EP003｜家庭、信仰與工作的拔河",
    description: "怎麼在多重身份之間找到自己的節奏？這集講我自己的調整方法。",
    pubDate: "",
    link: "#tune-in",
    episodeNumber: 3,
  },
  {
    id: "fallback-4",
    title: "EP004｜AI 時代的爸爸怎麼自處",
    description: "工具進化太快、孩子問題又比 AI 還難。聊聊宅爸的日常掙扎。",
    pubDate: "",
    link: "#tune-in",
    episodeNumber: 4,
  },
  {
    id: "fallback-5",
    title: "EP005｜被詐騙集團盯上的那一週",
    description: "真實案例分享，講講我家差點中招的那次經驗，與該怎麼防。",
    pubDate: "",
    link: "#tune-in",
    episodeNumber: 5,
  },
  {
    id: "fallback-6",
    title: "EP006｜週末碎念包：一週總結",
    description: "把一週的觀察與梗，輕鬆碎念給你聽。",
    pubDate: "",
    link: "#tune-in",
    episodeNumber: 6,
  },
];

const FETCH_TIMEOUT_MS = 4000;

function trySetCacheControl(value: string) {
  try {
    setResponseHeaders(new Headers({ "Cache-Control": value }));
  } catch {
    // 非標準請求或預渲染環境可能無 response context，略過標頭設定
  }
}

export const getEpisodes = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ episodes: Episode[]; source: "rss" | "fallback"; error?: string }> => {
    const url = PODCAST.rssFeedUrl;
    if (!url) {
      trySetCacheControl("no-store");
      return { episodes: FALLBACK_EPISODES, source: "fallback" };
    }

    try {
      const xml = await fetchFeed(url, FETCH_TIMEOUT_MS);
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const data = parser.parse(xml);
      const items = data?.rss?.channel?.item;
      if (!items) {
        trySetCacheControl("no-store");
        return { episodes: FALLBACK_EPISODES, source: "fallback", error: "no items" };
      }
      const list = Array.isArray(items) ? items : [items];
      if (list.length === 0) {
        trySetCacheControl("no-store");
        return { episodes: FALLBACK_EPISODES, source: "fallback", error: "no items" };
      }

      const episodes: Episode[] = list.slice(0, 8).map((item: ParsedEpisodeItem, idx: number) => {
        const audioUrl = safeHttpUrl(item.enclosure);
        const safeLink = safeHttpUrl(item.link);
        const rawDesc =
          extractText(item["itunes:summary"]) ||
          extractText(item.description) ||
          extractText(item["content:encoded"]);
        const guid = extractText(item.guid);
        return {
          id: guid || safeLink || `ep-${idx}`,
          title: extractText(item.title),
          description: stripHtml(rawDesc).slice(0, 160),
          pubDate: extractText(item.pubDate),
          link: safeLink ?? audioUrl ?? "#tune-in",
          audioUrl,
          durationSec: parseDuration(item["itunes:duration"]),
          episodeNumber: parseEpisodeNumber(item["itunes:episode"]),
        };
      });

      trySetCacheControl("public, max-age=300, s-maxage=300");
      return { episodes, source: "rss" };
    } catch (err) {
      console.error("RSS parse error:", err);
      trySetCacheControl("no-store");
      return {
        episodes: FALLBACK_EPISODES,
        source: "fallback",
        error: err instanceof Error ? err.message : "unknown",
      };
    }
  },
);
