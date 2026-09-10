import { createFileRoute } from "@tanstack/react-router";
import PodcastRecommendations from "@/components/enian/PodcastRecommendations";

const SEO_TITLE = "Podcast 推薦｜科技、信仰、家庭類中文節目策展｜E 人 I 碎念";
const SEO_DESC =
  "主持人 Emmanuel 私藏 Podcast 推薦清單：科技資安、家庭教養、基督信仰、社會觀察四大類，每則附原創短評，幫你找到下一個值得訂閱的中文 Podcast。";
const SITE_URL = "https://emting.life";
const PAGE_PATH = "/podcast-recommendations";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

export const Route = createFileRoute(PAGE_PATH)({
  head: () => ({
    meta: [
      { title: SEO_TITLE },
      { name: "description", content: SEO_DESC },
      { property: "og:title", content: SEO_TITLE },
      { property: "og:description", content: SEO_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: PAGE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SEO_TITLE },
      { name: "twitter:description", content: SEO_DESC },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Podcast 推薦",
          description: SEO_DESC,
          url: PAGE_URL,
          inLanguage: "zh-TW",
          isPartOf: {
            "@type": "WebSite",
            name: "E 人 I 碎念",
            url: SITE_URL,
          },
        }),
      },
    ],
  }),
  component: PodcastRecommendationsPage,
});

function PodcastRecommendationsPage() {
  return <PodcastRecommendations />;
}
