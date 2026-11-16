/** 依各組的最近修改時間建立 sitemap 更新時間。 */
export function latestUpdatesBy<T extends { updatedAt: string }>(
  posts: T[],
  key: (post: T) => string,
): [string, string][] {
  const latest = new Map<string, string>();
  for (const post of posts) {
    const group = key(post);
    const current = latest.get(group);
    if (!current || Date.parse(post.updatedAt) > Date.parse(current)) {
      latest.set(group, post.updatedAt);
    }
  }
  return [...latest];
}
