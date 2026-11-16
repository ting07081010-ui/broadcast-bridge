import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchFeed } from "./feed.ts";

test("外部來源逾時時中斷請求", async () => {
  const stalledFetch: typeof fetch = async (_input, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
    });
  await assert.rejects(fetchFeed("https://example.com", 20, stalledFetch));
});
