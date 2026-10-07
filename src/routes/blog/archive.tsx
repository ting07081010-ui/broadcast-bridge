import { createFileRoute } from "@tanstack/react-router";
import ArchivePage from "@/components/blog/ArchivePage";
import { getArchivePage } from "@/lib/blog/posts.functions";
import { TOPIC_SLUGS, type TopicSlug } from "@/lib/blog/types";
import { PODCAST } from "@/lib/enian/constants";

const toTopic = (value: unknown): TopicSlug | undefined =>
  TOPIC_SLUGS.includes(value as TopicSlug) ? (value as TopicSlug) : undefined;

const PAGE_URL = "https://emting.life/blog/archive";
const SEO_TITLE = `封存｜每日碎念｜${PODCAST.name}`;
const SEO_DESC = `《${PODCAST.name}》每日碎念的所有文章，依年月排列。`;

export const Route = createFileRoute("/blog/archive")({
  // 篩選放在 query，網址可分享、重新整理與返回都保留；不認得的值直接忽略
  validateSearch: (search: Record<string, unknown>): { topic?: TopicSlug } => ({
    // 明確回傳 undefined：只回傳 {} 的話，原始的 ?topic= 值會被保留下來
    topic: toTopic(search.topic),
  }),
  loader: () => getArchivePage(),
  head: ({ loaderData }) => {
    const indexable = loaderData?.groups.some((group) =>
      group.posts.some((post) => post.source !== "fixture"),
    );
    return {
      meta: [
        { title: SEO_TITLE },
        { name: "description", content: SEO_DESC },
        { property: "og:title", content: SEO_TITLE },
        { property: "og:description", content: SEO_DESC },
        { property: "og:type", content: "website" },
        { property: "og:url", content: PAGE_URL },
        { name: "twitter:card", content: "summary" },
        ...(indexable ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      // 篩選後的結果是同一份內容的子集，canonical 一律指向未篩選的封存頁
      links: [{ rel: "canonical", href: PAGE_URL }],
    };
  },
  component: ArchiveRoute,
});

function ArchiveRoute() {
  const { topic } = Route.useSearch();
  return <ArchivePage data={Route.useLoaderData()} topic={toTopic(topic)} />;
}
