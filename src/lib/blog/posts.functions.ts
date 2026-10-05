import { createServerFn } from "@tanstack/react-start";
import snapshotJson from "@/content/blog/snapshot.json";
import {
  adjacentPosts,
  groupByMonth,
  isPublic,
  pickFeature,
  postPath,
  sortNewestFirst,
  tableOfContents,
  toSummary,
  weekDays,
  weekIndex,
  type Feature,
  type MonthGroup,
  type WeekDay,
} from "./posts";
import { addDays, isoWeekKey, taipeiDate, weekKeyToMonday, weekStart } from "./time";
import { TOPIC_SLUGS } from "./types";
import type { BlogSnapshot, Post, PostSummary, TopicSlug } from "./types";

const LATEST_LIMIT = 10;
const snapshot = snapshotJson as unknown as BlogSnapshot;

/**
 * 所有通過發布閘門的文章，新到舊。
 * 測試稿只在開發模式以動態 import 載入，正式 build 會把這段整個移除。
 */
async function loadPublicPosts(now: Date): Promise<Post[]> {
  const posts: Post[] = [...snapshot.posts];
  if (import.meta.env.DEV) {
    const { FIXTURE_POSTS } = await import("@/content/blog/fixtures");
    posts.push(...FIXTURE_POSTS);
  }
  return sortNewestFirst(posts.filter((post) => isPublic(post, now)));
}

export type BlogIndex = {
  today: string;
  /** 本週的 ISO 週碼，用來連到週索引。 */
  weekKey: string;
  feature: Feature | null;
  week: WeekDay[];
  latest: PostSummary[];
};

export const getBlogIndex = createServerFn({ method: "GET" }).handler(
  async (): Promise<BlogIndex> => {
    const now = new Date();
    const summaries = (await loadPublicPosts(now)).map(toSummary);
    const feature = pickFeature(summaries, now);
    return {
      today: taipeiDate(now),
      weekKey: isoWeekKey(taipeiDate(now)),
      feature,
      week: weekDays(summaries, now),
      // 已在精選出現的那一篇不重複列出
      latest: summaries.filter((post) => post.id !== feature?.post.id).slice(0, LATEST_LIMIT),
    };
  },
);

export type PostPage = {
  post: Post;
  summary: PostSummary;
  toc: { id: string; text: string }[];
  newer?: PostSummary;
  older?: PostSummary;
};

export const getPostPage = createServerFn({ method: "GET" })
  .inputValidator((path: string) => path)
  .handler(async ({ data: path }): Promise<PostPage | null> => {
    const posts = await loadPublicPosts(new Date());
    const post = posts.find((candidate) => postPath(candidate) === path);
    if (!post) return null;
    return {
      post,
      summary: toSummary(post),
      toc: tableOfContents(post.blocks),
      ...adjacentPosts(posts.map(toSummary), path),
    };
  });

export type TopicPage = { topic: TopicSlug; posts: PostSummary[] };

export const getTopicPage = createServerFn({ method: "GET" })
  .inputValidator((topic: string) => topic)
  .handler(async ({ data: topic }): Promise<TopicPage | null> => {
    // 只有六個主題有頁面；rest 是週索引的標記，不是第七個主題
    if (!TOPIC_SLUGS.includes(topic as TopicSlug)) return null;
    const posts = await loadPublicPosts(new Date());
    return {
      topic: topic as TopicSlug,
      posts: posts.filter((post) => post.topic === topic).map(toSummary),
    };
  });

export type ArchivePage = { groups: MonthGroup[] };

export const getArchivePage = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArchivePage> => {
    const posts = await loadPublicPosts(new Date());
    return { groups: groupByMonth(posts.map(toSummary)) };
  },
);

export type WeekPage = {
  weekKey: string;
  monday: string;
  days: WeekDay[];
  isCurrentWeek: boolean;
  /** 有更早的文章才提供上一週連結，避免無限往前的空頁。 */
  previousKey: string | null;
  /** 不提供未來週的連結。 */
  nextKey: string | null;
};

export const getWeekPage = createServerFn({ method: "GET" })
  .inputValidator((weekKey: string) => weekKey)
  .handler(async ({ data: weekKey }): Promise<WeekPage | null> => {
    const monday = weekKeyToMonday(weekKey);
    if (!monday) return null;
    const now = new Date();
    const currentMonday = weekStart(taipeiDate(now));
    // 未來的週還不存在
    if (monday > currentMonday) return null;
    const summaries = (await loadPublicPosts(now)).map(toSummary);
    return {
      weekKey,
      monday,
      days: weekIndex(summaries, monday),
      isCurrentWeek: monday === currentMonday,
      previousKey: summaries.some((post) => post.date < monday)
        ? isoWeekKey(addDays(monday, -7))
        : null,
      nextKey: monday < currentMonday ? isoWeekKey(addDays(monday, 7)) : null,
    };
  });

/**
 * sitemap 用：只含真實已發布文章衍生的網址，測試稿即使在開發模式也排除。
 * 沒有文章的主題頁與週索引不列入。
 */
export async function listSitemapPaths(): Promise<{ path: string; updatedAt: string }[]> {
  const posts = (await loadPublicPosts(new Date())).filter((post) => post.source !== "fixture");
  if (posts.length === 0) return [];
  const latest = posts[0].updatedAt;
  const newestBy = (key: (post: Post) => string) => {
    const seen = new Map<string, string>();
    for (const post of posts) if (!seen.has(key(post))) seen.set(key(post), post.updatedAt);
    return [...seen];
  };
  return [
    { path: "/blog", updatedAt: latest },
    { path: "/blog/archive", updatedAt: latest },
    ...newestBy((post) => post.topic).map(([topic, updatedAt]) => ({
      path: `/blog/topic/${topic}`,
      updatedAt,
    })),
    ...newestBy((post) => isoWeekKey(post.date)).map(([week, updatedAt]) => ({
      path: `/blog/week/${week}`,
      updatedAt,
    })),
    ...posts.map((post) => ({ path: `/blog/posts/${postPath(post)}`, updatedAt: post.updatedAt })),
  ];
}
