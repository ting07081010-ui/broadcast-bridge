import { createFileRoute } from "@tanstack/react-router";
import BlogHome from "@/components/blog/BlogHome";
import { getBlogIndex } from "@/lib/blog/posts.functions";

const SEO_TITLE = "每日碎念｜E 人 I 碎念";
const SEO_DESC =
  "《E 人 I 碎念》的文字版。週一到週六，一天一個主題，從身體、心情、靈命寫到家庭、事業、社會。";
const PAGE_URL = "https://emting.life/blog";

export const Route = createFileRoute("/blog/")({
  loader: () => getBlogIndex(),
  head: ({ loaderData }) => ({
    meta: [
      { title: SEO_TITLE },
      { name: "description", content: SEO_DESC },
      { property: "og:title", content: SEO_TITLE },
      { property: "og:description", content: SEO_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: SEO_TITLE },
      { name: "twitter:description", content: SEO_DESC },
      // 還沒有任何公開文章時不讓搜尋引擎收錄空頁
      ...(loaderData?.feature ? [] : [{ name: "robots", content: "noindex" }]),
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  return <BlogHome index={Route.useLoaderData()} />;
}
