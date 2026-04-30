import { createFileRoute } from "@tanstack/react-router";
import EnianLanding from "@/components/enian/EnianLanding";
import { getEpisodes } from "@/server/episodes.functions";
import { PODCAST } from "@/lib/enian/constants";

const SEO_TITLE = "E 人 I 碎念｜科技、信仰、家庭與生活觀察 Podcast";
const SEO_DESC =
  "《E 人 I 碎念》是一個結合科技宅文化、資安觀察、基督信仰、家庭生活與社會時事的輕鬆 Podcast。週一到週六，用專業中帶點詼諧的方式，陪你一起思考生活大小事。";

export const Route = createFileRoute("/")({
  loader: () => getEpisodes(),
  head: () => ({
    meta: [
      { title: SEO_TITLE },
      { name: "description", content: SEO_DESC },
      { property: "og:title", content: SEO_TITLE },
      { property: "og:description", content: SEO_DESC },
      { property: "og:type", content: "website" },
      { property: "og:image", content: PODCAST.avatarUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SEO_TITLE },
      { name: "twitter:description", content: SEO_DESC },
      { name: "twitter:image", content: PODCAST.avatarUrl },
      { name: "theme-color", content: "#1a0d2e" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PodcastSeries",
          name: PODCAST.name,
          description: SEO_DESC,
          inLanguage: "zh-TW",
          image: PODCAST.avatarUrl,
          author: { "@type": "Person", name: PODCAST.hostName },
          ...(PODCAST.rssFeedUrl ? { webFeed: PODCAST.rssFeedUrl } : {}),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { episodes, source } = Route.useLoaderData();
  return <EnianLanding episodes={episodes} source={source} />;
}
