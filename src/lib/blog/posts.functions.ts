import { createServerFn } from "@tanstack/react-start";
import snapshotJson from "@/content/blog/snapshot.json";
import {
  adjacentPosts,
  isPublic,
  pickFeature,
  postPath,
  sortNewestFirst,
  tableOfContents,
  toSummary,
  weekDays,
  type Feature,
  type WeekDay,
} from "./posts";
import { taipeiDate } from "./time";
import type { BlogSnapshot, Post, PostSummary } from "./types";

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

/** sitemap 用：只含真實已發布文章，測試稿即使在開發模式也排除。 */
export async function listSitemapPosts(): Promise<{ path: string; updatedAt: string }[]> {
  const posts = await loadPublicPosts(new Date());
  return posts
    .filter((post) => post.source !== "fixture")
    .map((post) => ({ path: postPath(post), updatedAt: post.updatedAt }));
}
