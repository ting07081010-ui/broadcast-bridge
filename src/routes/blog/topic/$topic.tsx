import { createFileRoute, notFound } from "@tanstack/react-router";
import TopicPage from "@/components/blog/TopicPage";
import { getTopicPage } from "@/lib/blog/posts.functions";
import { TOPICS } from "@/lib/blog/topics";
import { PODCAST } from "@/lib/enian/constants";

const SITE_URL = "https://emting.life";

export const Route = createFileRoute("/blog/topic/$topic")({
  loader: async ({ params }) => {
    const data = await getTopicPage({ data: params.topic });
    // 只有六個主題有頁面，其他一律 404
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ name: "robots", content: "noindex" }] };
    const topic = TOPICS[loaderData.topic];
    const url = `${SITE_URL}/blog/topic/${loaderData.topic}`;
    const title = `${topic.name}｜每日碎念｜${PODCAST.name}`;
    const description = `《${PODCAST.name}》每日碎念的「${topic.name}」主題：${topic.spirit}。`;
    const indexable = loaderData.posts.some((post) => post.source !== "fixture");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
        // 沒有真實文章的主題頁不讓搜尋引擎收錄
        ...(indexable ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: TopicRoute,
});

function TopicRoute() {
  return <TopicPage data={Route.useLoaderData()} />;
}
