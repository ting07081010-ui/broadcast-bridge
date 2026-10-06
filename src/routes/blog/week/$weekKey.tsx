import { createFileRoute, notFound } from "@tanstack/react-router";
import WeekPage from "@/components/blog/WeekPage";
import { getWeekPage } from "@/lib/blog/posts.functions";
import { formatDate, formatWeekKey } from "@/lib/blog/time";
import { PODCAST } from "@/lib/enian/constants";

const SITE_URL = "https://emting.life";

export const Route = createFileRoute("/blog/week/$weekKey")({
  loader: async ({ params }) => {
    const data = await getWeekPage({ data: params.weekKey });
    // 週碼格式錯誤、不存在的週、未來的週都是 404
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ name: "robots", content: "noindex" }] };
    const { weekKey, days } = loaderData;
    const url = `${SITE_URL}/blog/week/${weekKey}`;
    const label = formatWeekKey(weekKey);
    const title = `一週回顧・${label}｜每日碎念｜${PODCAST.name}`;
    const description = `《${PODCAST.name}》每日碎念 ${formatDate(days[0].date)}–${formatDate(days[6].date).slice(5)} 這一週發布的文章索引。`;
    const posts = days.flatMap((day) => day.posts).filter((post) => post.source !== "fixture");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
        // 整週沒有真實文章就不收錄
        ...(posts.length > 0 ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts:
        posts.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "CollectionPage",
                  name: `一週回顧・${label}`,
                  description,
                  url,
                  inLanguage: "zh-TW",
                  hasPart: posts.map((post) => ({
                    "@type": "BlogPosting",
                    headline: post.title,
                    url: `${SITE_URL}/blog/posts/${post.path}`,
                    datePublished: post.publishedAt,
                  })),
                }),
              },
            ]
          : [],
    };
  },
  component: WeekRoute,
});

function WeekRoute() {
  return <WeekPage data={Route.useLoaderData()} />;
}
