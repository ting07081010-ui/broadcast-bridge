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
