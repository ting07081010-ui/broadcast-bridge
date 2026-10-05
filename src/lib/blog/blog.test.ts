/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";

import { BlockError, convertBlocks, pageToPost } from "./notion.ts";
import type { NotionBlock, NotionPage, NotionRichText } from "./notion.ts";
import {
  adjacentPosts,
  estimateReadingMinutes,
  isPublic,
  pickFeature,
  tableOfContents,
  toSummary,
  validatePost,
  weekDays,
} from "./posts.ts";
import { isoWeekKey, isoWeekday, taipeiDate, weekStart } from "./time.ts";
import type { Post } from "./types.ts";

const rt = (text: string, extra: Partial<NotionRichText> = {}): NotionRichText => ({
  type: "text",
  plain_text: text,
  href: null,
  ...extra,
});
const block = (id: string, type: string, data: object, children?: NotionBlock[]): NotionBlock => ({
  id,
  type,
  has_children: Boolean(children),
  ...(children ? { children } : {}),
  [type]: data,
});
const para = (id: string, text: string) => block(id, "paragraph", { rich_text: [rt(text)] });

const basePost: Post = {
  id: "p1",
  title: "測試",
  slug: "test-post",
  date: "2026-10-05",
  topic: "body",
  status: "Published",
  publishedAt: "2026-10-05T06:00:00+08:00",
  updatedAt: "2026-10-05T06:00:00+08:00",
  excerpt: "",
  blocks: [{ type: "paragraph", inlines: [{ text: "內容" }] }],
  source: "notion",
};
const NOW = new Date("2026-10-05T12:00:00+08:00");

test("台北日期：UTC 前一天深夜算台北的隔天", () => {
  assert.equal(taipeiDate("2026-10-04T16:30:00Z"), "2026-10-05");
  assert.equal(taipeiDate("2026-10-04T15:59:00Z"), "2026-10-04");
});

test("ISO 週：週一為起點，跨年用 ISO week-year", () => {
  assert.equal(isoWeekday("2026-10-05"), 1);
  assert.equal(isoWeekday("2026-10-11"), 7);
  assert.equal(weekStart("2026-10-11"), "2026-10-05");
  assert.equal(isoWeekKey("2026-10-05"), "2026-W41");
  // 2027-01-01 是週五，屬於 2026 年第 53 週
  assert.equal(isoWeekKey("2027-01-01"), "2026-W53");
  // 2024-12-30 是週一，屬於 2025 年第 1 週
  assert.equal(isoWeekKey("2024-12-30"), "2025-W01");
});

test("發布閘門：Draft、Review、排程未到、封存、校驗失敗都不公開", () => {
  assert.equal(isPublic(basePost, NOW), true);
  assert.equal(isPublic({ ...basePost, status: "Draft" }, NOW), false);
  assert.equal(isPublic({ ...basePost, status: "Review" }, NOW), false);
  assert.equal(isPublic({ ...basePost, publishedAt: "2026-10-05T12:00:01+08:00" }, NOW), false);
  assert.equal(isPublic({ ...basePost, archived: true }, NOW), false);
  assert.equal(isPublic({ ...basePost, slug: "Bad Slug" }, NOW), false);
  assert.equal(isPublic({ ...basePost, blocks: [] }, NOW), false);
});

test("校驗：slug 只允許小寫英數與連字號，空 slug 阻擋發布", () => {
  assert.deepEqual(validatePost(basePost), []);
  assert.equal(validatePost({ ...basePost, slug: "" }).length, 1);
  assert.equal(validatePost({ ...basePost, slug: "中文" }).length, 1);
  assert.equal(validatePost({ ...basePost, topic: "rest" as never }).length, 1);
});

test("精選：今天有稿才叫今日，否則是最新，不把舊文冒充今日", () => {
  const today = toSummary(basePost);
  const old = toSummary({ ...basePost, id: "p0", slug: "old", date: "2026-10-03" });
  assert.equal(pickFeature([today, old], NOW)?.kind, "today");
  assert.deepEqual(pickFeature([old], NOW), { kind: "latest", post: old });
  assert.equal(pickFeature([], NOW), null);
});

test("本週七天：缺稿日是空陣列，一天多篇全部列出", () => {
  const a = toSummary(basePost);
  const b = toSummary({ ...basePost, id: "p2", slug: "second" });
  const days = weekDays([a, b], NOW);
  assert.equal(days.length, 7);
  assert.equal(days[0].date, "2026-10-05");
  assert.equal(days[0].posts.length, 2);
  assert.equal(days[1].posts.length, 0);
  assert.equal(days[6].date, "2026-10-11");
});

test("前後篇：第一篇與最後一篇只有一側", () => {
  const list = ["c", "b", "a"].map((slug, i) =>
    toSummary({ ...basePost, id: slug, slug, publishedAt: `2026-10-0${5 - i}T06:00:00+08:00` }),
  );
  assert.equal(adjacentPosts(list, list[0].path).newer, undefined);
  assert.equal(adjacentPosts(list, list[0].path).older?.slug, "b");
  assert.equal(adjacentPosts(list, list[2].path).older, undefined);
  assert.equal(adjacentPosts(list, list[1].path).newer?.slug, "c");
});

test("閱讀時間：最少 1 分鐘；目錄超過三個 H2 才出現", () => {
  assert.equal(estimateReadingMinutes(basePost.blocks), 1);
  const long = [{ type: "paragraph" as const, inlines: [{ text: "字".repeat(1200) }] }];
  assert.equal(estimateReadingMinutes(long), 3);
  const h2 = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      type: "heading" as const,
      level: 2 as const,
      id: `h-${i}`,
      inlines: [{ text: `標題 ${i}` }],
    }));
  assert.equal(tableOfContents(h2(3)).length, 0);
  assert.equal(tableOfContents(h2(4)).length, 4);
});

test("Notion 轉換：連續清單項合併，三層巢狀保留順序與編號類型", () => {
  const li = (id: string, text: string, children?: NotionBlock[]) =>
    block(id, "numbered_list_item", { rich_text: [rt(text)] }, children);
  const bullet = (id: string, text: string, children?: NotionBlock[]) =>
    block(id, "bulleted_list_item", { rich_text: [rt(text)] }, children);
  const { blocks } = convertBlocks(
    [li("1", "一", [bullet("1a", "一之一", [bullet("1a1", "第三層")])]), li("2", "二")],
    new Map(),
  );
  assert.equal(blocks.length, 1);
  const list = blocks[0];
  assert.ok(list.type === "list" && list.ordered);
  assert.equal(list.items.length, 2);
  assert.equal(list.items[0].children?.ordered, false);
  assert.equal(list.items[0].children?.items[0].children?.items[0].inlines[0].text, "第三層");
});

test("Notion 轉換：引文拆出來源；經文保留原文並要求出處", () => {
  const quote = block("q", "quote", { rich_text: [rt("慢一點，才聽得見。\n——某次錄音後的筆記")] });
  const scripture = block("s", "callout", {
    icon: { emoji: "📖" },
    rich_text: [rt("你們要休息，要知道我是神。\n——詩篇 46:10（和合本）")],
  });
  const { blocks } = convertBlocks([quote, scripture], new Map());
  assert.deepEqual(blocks[0], {
    type: "quote",
    inlines: [{ text: "慢一點，才聽得見。" }],
    source: "某次錄音後的筆記",
  });
  assert.deepEqual(blocks[1], {
    type: "scripture",
    inlines: [{ text: "你們要休息，要知道我是神。" }],
    reference: "詩篇 46:10",
    version: "和合本",
  });
  const noSource = block("s2", "callout", { icon: { emoji: "📖" }, rich_text: [rt("沒有出處")] });
  assert.throws(() => convertBlocks([noSource], new Map()), BlockError);
});

test("Notion 轉換：不支援的區塊、內部連結、危險協定、未抓完的子區塊都阻擋並帶 block ID", () => {
  const cases: NotionBlock[] = [
    block("embed-1", "embed", { url: "https://example.com" }),
    block("child-1", "child_page", { title: "子頁" }),
    block("link-1", "paragraph", { rich_text: [rt("內部", { href: "/abc123" })] }),
    block("js-1", "paragraph", { rich_text: [rt("壞", { href: "javascript:alert(1)" })] }),
    block("mention-1", "paragraph", { rich_text: [rt("@某人", { type: "mention" })] }),
    { id: "partial-1", type: "toggle", has_children: true, toggle: { rich_text: [rt("展開")] } },
  ];
  for (const bad of cases) {
    assert.throws(
      () => convertBlocks([bad], new Map()),
      (err: unknown) => err instanceof BlockError && err.blockId === bad.id,
      bad.id,
    );
  }
});

test("Notion 轉換：H1 整體降級並留記錄；toggle 與分欄內容展開不丟失；圖片要有已擷取資產", () => {
  const h1 = block("aaaaaaaa-1111", "heading_1", { rich_text: [rt("大標")] });
  const h2 = block("bbbbbbbb-2222", "heading_2", { rich_text: [rt("中標")] });
  const toggle = block("t", "toggle", { rich_text: [rt("點開")] }, [para("t1", "藏在裡面的字")]);
  const columns = block("c", "column_list", {}, [
    block("c1", "column", {}, [para("c1p", "左欄")]),
    block("c2", "column", {}, [para("c2p", "右欄")]),
  ]);
  const { blocks, warnings } = convertBlocks([h1, h2, toggle, columns], new Map());
  assert.equal(warnings.length, 1);
  assert.deepEqual(
    blocks.map((b) => (b.type === "heading" ? `h${b.level}` : b.type)),
    ["h2", "h3", "paragraph", "paragraph", "paragraph", "paragraph"],
  );
  assert.equal(blocks[0].type === "heading" && blocks[0].id, "h-aaaaaaaa11");

  const image = block("img", "image", { caption: [rt("圖說")] });
  assert.throws(() => convertBlocks([image], new Map()), BlockError);
  const ok = convertBlocks(
    [image],
    new Map([["img", { src: "/blog/media/x.png", width: 8, height: 4 }]]),
  );
  assert.deepEqual(ok.blocks[0], {
    type: "image",
    src: "/blog/media/x.png",
    width: 8,
    height: 4,
    alt: "圖說",
    caption: "圖說",
  });
});

test("Notion 頁面：中文主題對應 slug；已發布文章的網址凍結；摘要缺值用首段", () => {
  const page: NotionPage = {
    id: "page-1",
    last_edited_time: "2026-10-06T01:00:00.000Z",
    properties: {
      Title: { title: [rt("睡眠與節奏")] },
      Slug: { rich_text: [rt("new-slug")] },
      Topic: { select: { name: "身體" } },
      Status: { status: { name: "Published" } },
      PublishedAt: { date: { start: "2026-10-04T23:30:00+08:00" } },
      Excerpt: { rich_text: [] },
      EpisodeURL: { url: null },
    },
  };
  const blocks = convertBlocks([para("p", "第一段文字。")], new Map()).blocks;
  const fresh = pageToPost(page, blocks);
  assert.equal(fresh.topic, "body");
  assert.equal(fresh.date, "2026-10-04");
  assert.equal(fresh.slug, "new-slug");
  assert.equal(fresh.excerpt, "第一段文字。");
  assert.equal(fresh.episode, undefined);

  const previous: Post = { ...fresh, slug: "old-slug", date: "2026-10-01" };
  const frozen = pageToPost(page, blocks, previous);
  assert.equal(frozen.slug, "old-slug");
  assert.equal(frozen.date, "2026-10-01");

  const trashed = pageToPost({ ...page, in_trash: true }, blocks);
  assert.equal(isPublic(trashed, new Date("2026-10-06T12:00:00+08:00")), false);
});
