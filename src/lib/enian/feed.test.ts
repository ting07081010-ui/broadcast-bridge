/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";

import { serializeJsonLd } from "../seo.ts";
import {
  extractText,
  fetchFeed,
  parseDuration,
  parseEpisodeNumber,
  safeHttpUrl,
  safeYouTubeVideoId,
  stripHtml,
} from "./feed.ts";

test("外部來源逾時時中斷請求", async () => {
  const stalledFetch: typeof fetch = async (_input, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
    });
  await assert.rejects(fetchFeed("https://example.com", 20, stalledFetch));
});

test("外部來源回傳非 2xx 狀態時拋出 HTTP 錯誤", async () => {
  const errorFetch: typeof fetch = async () => new Response(null, { status: 503 });
  await assert.rejects(fetchFeed("https://example.com", 100, errorFetch), /HTTP 503/);
});

test("serializeJsonLd escapes script close tags and Unicode line separators", () => {
  const payload = {
    title: 'Hello </script><script>alert("xss")</script>',
    lineSep: "a\u2028b\u2029c",
  };
  const out = serializeJsonLd(payload);
  assert.equal(out.includes("<"), false);
  assert.equal(out.includes("\u2028"), false);
  assert.equal(out.includes("\u2029"), false);
  assert.match(out, /\\u003c\/script>/);
  assert.match(out, /\\u2028/);
  assert.match(out, /\\u2029/);
  assert.deepEqual(JSON.parse(out), payload);
});

test("extractText handles primitives, arrays, and XML attribute objects", () => {
  assert.equal(extractText("  EP001  "), "EP001");
  assert.equal(extractText(42), "42");
  assert.equal(extractText(NaN), "");
  assert.equal(extractText({ "#text": " 標題文字 ", "@_type": "text" }), "標題文字");
  assert.equal(extractText({ "@_type": "text" }), "");
  assert.equal(extractText([{ "#text": "First" }, "Second"]), "First");
  assert.equal(extractText(null), "");
});

test("safeHttpUrl allows only http/https and blocks dangerous protocols", () => {
  assert.equal(safeHttpUrl("https://emting.life/ep/1"), "https://emting.life/ep/1");
  assert.equal(safeHttpUrl("http://example.com/feed.xml"), "http://example.com/feed.xml");
  assert.equal(
    safeHttpUrl({ "@_href": "https://emting.life/atom", "@_rel": "alternate" }),
    "https://emting.life/atom",
  );
  assert.equal(safeHttpUrl("javascript:alert(1)"), undefined);
  assert.equal(safeHttpUrl("data:text/html,<script>alert(1)</script>"), undefined);
  assert.equal(safeHttpUrl("vbscript:msgbox(1)"), undefined);
  assert.equal(safeHttpUrl("/relative/path"), undefined);
  assert.equal(safeHttpUrl({ "@_type": "text" }), undefined);
});

test("parseEpisodeNumber rejects NaN, zero, negative, and non-numeric strings", () => {
  assert.equal(parseEpisodeNumber("12"), 12);
  assert.equal(parseEpisodeNumber({ "#text": "007" }), 7);
  assert.equal(parseEpisodeNumber(5), 5);
  assert.equal(parseEpisodeNumber("0"), undefined);
  assert.equal(parseEpisodeNumber("-3"), undefined);
  assert.equal(parseEpisodeNumber("abc"), undefined);
  assert.equal(parseEpisodeNumber(""), undefined);
});

test("parseDuration handles seconds, MM:SS, HH:MM:SS, and invalid inputs", () => {
  assert.equal(parseDuration(120), 120);
  assert.equal(parseDuration("90"), 90);
  assert.equal(parseDuration("12:34"), 754);
  assert.equal(parseDuration({ "#text": "01:02:03" }), 3723);
  assert.equal(parseDuration("12:xx"), undefined);
  assert.equal(parseDuration("1:2:3:4"), undefined);
});

test("stripHtml removes tags and decodes common entities including apostrophes", () => {
  const input = "<p>It&#39;s &apos;E 人&apos; &amp; &quot;I 碎念&quot;&nbsp;&lt;podcast&gt;</p>";
  assert.equal(stripHtml(input), "It's 'E 人' & \"I 碎念\" <podcast>");
});

test("safeYouTubeVideoId validates 11-char YouTube IDs", () => {
  assert.equal(safeYouTubeVideoId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(safeYouTubeVideoId({ "#text": "abc_123-XYZ" }), "abc_123-XYZ");
  assert.equal(safeYouTubeVideoId("too-short"), undefined);
  assert.equal(safeYouTubeVideoId("invalid/id!1"), undefined);
  assert.equal(safeYouTubeVideoId("../../etc/passwd"), undefined);
});
