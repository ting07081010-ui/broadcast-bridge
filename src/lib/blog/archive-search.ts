/** 以標題或摘要比對搜尋詞，不區分英文大小寫。 */
export function matchesArchiveSearch(
  post: { title: string; excerpt: string },
  query: string,
): boolean {
  const term = query.trim().toLocaleLowerCase();
  return (
    !term ||
    post.title.toLocaleLowerCase().includes(term) ||
    post.excerpt.toLocaleLowerCase().includes(term)
  );
}

/** 分頁後保留原有月份與文章順序。 */
export function paginateArchive<T>(
  groups: { month: string; posts: T[] }[],
  requestedPage: number,
  pageSize = 20,
) {
  const total = groups.reduce((count, group) => count + group.posts.length, 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(
    totalPages,
    Math.max(1, Number.isSafeInteger(requestedPage) ? requestedPage : 1),
  );
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  let offset = 0;
  const pageGroups = groups.flatMap((group) => {
    const from = Math.max(0, start - offset);
    const to = Math.min(group.posts.length, end - offset);
    offset += group.posts.length;
    return from < to ? [{ ...group, posts: group.posts.slice(from, to) }] : [];
  });
  return { groups: pageGroups, page, totalPages, total };
}

/** 驗證封存篩選使用的 YYYY-MM。 */
export function validArchiveMonth(value: unknown): string | undefined {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : undefined;
}
