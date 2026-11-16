import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { BlogSnapshot } from "../src/lib/blog/types.ts";

/** Compare content, ignoring the sync timestamp which changes on every run. */
export function sameSnapshotPosts(a: BlogSnapshot, b: BlogSnapshot): boolean {
  return JSON.stringify(a.posts) === JSON.stringify(b.posts);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [first, second] = process.argv.slice(2);
  try {
    const a = JSON.parse(await readFile(first, "utf8")) as BlogSnapshot;
    const b = JSON.parse(await readFile(second, "utf8")) as BlogSnapshot;
    process.exitCode = sameSnapshotPosts(a, b) ? 0 : 1;
  } catch (error) {
    console.error(`Cannot compare snapshots: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 2;
  }
}
