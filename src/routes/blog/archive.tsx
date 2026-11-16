import { paginateArchive } from "@/lib/blog/archive-search";
import { createFileRoute } from "@tanstack/react-router";
import ArchivePage from "@/components/blog/ArchivePage";
import { getArchivePage } from "@/lib/blog/posts.functions";
import { TOPIC_SLUGS, type TopicSlug } from "@/lib/blog/types";
import { PODCAST } from "@/lib/enian/constants";

const toTopic = (value: unknown): TopicSlug | undefined =>
  TOPIC_SLUGS.includes(value as TopicSlug) ? (value as TopicSlug) : undefined;

const toPage = (value: unknown): number | undefined => {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : 1;
  return Number.isSafeInteger(n) && n > 1 ? n : undefined;
};

const PAGE_URL = "https://emting.life/blog/archive";
const SEO_TITLE = `封存｜每日碎念｜${PODCAST.name}`;
const SEO_DESC = `《${PODCAST.name}》每日碎念的所有文章，依年月排列。`;
const OG_IMAGE = new URL(PODCAST.avatarUrl, "https://emting.life").href;

export const Route = createFileRoute("/blog/archive")({
  // 篩選放在 query，網址可分享、重新整理與返回都保留；不認得的值直接忽略
  validateSearch: (
    search: Record<string, unknown>,
  ): { topic?: TopicSlug; q?: string; page?: number } => ({
    // 明確回傳 undefined：只回傳 {} 的話，原始的 ?topic= 值會被保留下來
    topic: toTopic(search.topic),
    q: typeof search.q === "string" ? search.q.trim().slice(0, 100) || undefined : undefined,
    page: toPage(search.page),
  }),
  loader: () => getArchivePage(),
  head: ({ loaderData, match }) => {
    const indexable = loaderData?.groups.some((group) =>
      group.posts.some((post) => post.source !== "fixture"),
    );
    const canonicalPage = paginateArchive(loaderData?.groups ?? [], match.search.page ?? 1).page;
    return {
      meta: [
        { title: SEO_TITLE },
        { name: "description", content: SEO_DESC },
        { property: "og:title", content: SEO_TITLE },
        { property: "og:description", content: SEO_DESC },
        { property: "og:type", content: "website" },
        { property: "og:url", content: PAGE_URL },
        { property: "og:image", content: OG_IMAGE },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: SEO_TITLE },
        { name: "twitter:description", content: SEO_DESC },
        { name: "twitter:image", content: OG_IMAGE },
        ...(indexable ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      // 篩選後的結果是同一份內容的子集，canonical 一律指向未篩選的封存頁
      links: [
        {
          rel: "canonical",
          href:
            !match.search.topic && !match.search.q && canonicalPage > 1
              ? `${PAGE_URL}?page=${canonicalPage}`
              : PAGE_URL,
        },
      ],
    };
  },
  component: ArchiveRoute,
});

function ArchiveRoute() {
  const { topic, q, page } = Route.useSearch();
  return (
    <ArchivePage
      data={Route.useLoaderData()}
      topic={toTopic(topic)}
      query={q}
      requestedPage={page}
    />
  );
}
