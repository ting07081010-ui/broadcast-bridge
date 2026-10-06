import { createFileRoute, notFound } from "@tanstack/react-router";
import PostNotFound from "@/components/blog/PostNotFound";
import PostPage from "@/components/blog/PostPage";
import { getPostPage } from "@/lib/blog/posts.functions";
import { TOPICS } from "@/lib/blog/topics";
import { PODCAST } from "@/lib/enian/constants";

const SITE_URL = "https://emting.life";
const postUrl = (postId: string) => `${SITE_URL}/blog/posts/${postId}`;

export const Route = createFileRoute("/blog/posts/$postId")({
  loader: async ({ params }) => {
    const data = await getPostPage({ data: params.postId });
    // 不存在、草稿、排程未到的文章一律是真正的 404
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: `找不到這篇碎念｜${PODCAST.name}` },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { post } = loaderData;
    const url = postUrl(params.postId);
    const title = `${post.title}｜${PODCAST.name}`;
    const topic = TOPICS[post.topic];
    return {
      meta: [
        { title },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:modified_time", content: post.updatedAt },
        { property: "article:section", content: topic.name },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.excerpt },
        // 測試稿只存在於開發模式，仍明確標示不可收錄
        ...(post.source === "fixture" ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            inLanguage: "zh-TW",
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            articleSection: topic.name,
            mainEntityOfPage: url,
            author: { "@type": "Person", name: PODCAST.hostName },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: PODCAST.name, item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "每日碎念", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: PostRoute,
  notFoundComponent: PostNotFound,
});

function PostRoute() {
  const data = Route.useLoaderData();
  const { postId } = Route.useParams();
  return <PostPage data={data} canonicalUrl={postUrl(postId)} />;
}
