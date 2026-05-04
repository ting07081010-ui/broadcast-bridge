import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { XMLParser } from "fast-xml-parser";
import { PODCAST } from "@/lib/enian/constants";

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

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseDuration(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return undefined;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  const parts = value.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return undefined;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return undefined;
}

function getEnclosureUrl(enclosure: unknown): string | undefined {
  if (Array.isArray(enclosure)) {
    const firstItem = enclosure[0];
    if (typeof firstItem === "object" && firstItem !== null) {
      const url = (firstItem as Record<string, unknown>)["@_url"];
      return typeof url === "string" && url ? url : undefined;
    }
    return undefined;
  }

  if (typeof enclosure === "object" && enclosure !== null) {
    const url = (enclosure as Record<string, unknown>)["@_url"];
    return typeof url === "string" && url ? url : undefined;
  }

  return undefined;
}

function getGuidValue(guid: unknown): string | undefined {
  if (typeof guid === "string" && guid) return guid;
  if (typeof guid === "object" && guid !== null) {
    const text = (guid as Record<string, unknown>)["#text"];
    return typeof text === "string" && text ? text : undefined;
  }
  return undefined;
}

export const getEpisodes = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ episodes: Episode[]; source: "rss" | "fallback"; error?: string }> => {
    const url = PODCAST.rssFeedUrl;
    if (!url) {
      return { episodes: FALLBACK_EPISODES, source: "fallback" };
    }

    try {
      setResponseHeaders(new Headers({ "Cache-Control": "public, max-age=300, s-maxage=300" }));

      const res = await fetch(url, {
        headers: { "User-Agent": "EnianPodcastSite/1.0" },
      });
      if (!res.ok) {
        console.error(`RSS fetch failed: ${res.status}`);
        return { episodes: FALLBACK_EPISODES, source: "fallback", error: `HTTP ${res.status}` };
      }

      const xml = await res.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });
      const data = parser.parse(xml);
      const items = data?.rss?.channel?.item;
      if (!items) {
        return { episodes: FALLBACK_EPISODES, source: "fallback", error: "no items" };
      }
      const list = Array.isArray(items) ? items : [items];

      const episodes: Episode[] = list.slice(0, 8).map((item: ParsedEpisodeItem, idx: number) => {
        const audioUrl = getEnclosureUrl(item.enclosure);
        const rawDesc = item["itunes:summary"] ?? item.description ?? item["content:encoded"] ?? "";
        return {
          id: getGuidValue(item.guid) ?? String(item.link ?? `ep-${idx}`),
          title: String(item.title ?? "").trim(),
          description: stripHtml(String(rawDesc)).slice(0, 160),
          pubDate: String(item.pubDate ?? ""),
          link: String(item.link ?? audioUrl ?? "#"),
          audioUrl,
          durationSec: parseDuration(item["itunes:duration"]),
          episodeNumber: item["itunes:episode"] ? Number(item["itunes:episode"]) : undefined,
        };
      });

      return { episodes, source: "rss" };
    } catch (err) {
      console.error("RSS parse error:", err);
      return {
        episodes: FALLBACK_EPISODES,
        source: "fallback",
        error: err instanceof Error ? err.message : "unknown",
      };
    }
  },
);
