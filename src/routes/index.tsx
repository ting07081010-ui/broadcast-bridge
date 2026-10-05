import { createFileRoute } from "@tanstack/react-router";
import EnianLanding from "@/components/enian/EnianLanding";
import { getEpisodes } from "@/lib/enian/episodes.functions";
import { getYouTubeVideos } from "@/lib/enian/youtube.functions";
import { PODCAST, PLATFORMS } from "@/lib/enian/constants";

const SEO_TITLE = "E 人 I 碎念｜科技、信仰、家庭與生活觀察 Podcast";
const SEO_DESC =
  "《E 人 I 碎念》是一個結合科技宅文化、資安觀察、基督信仰、家庭生活與社會時事的輕鬆 Podcast。週一到週六，用專業中帶點詼諧的方式，陪你一起思考生活大小事。";
const SITE_URL = "https://emting.life/";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [episodes, youtube] = await Promise.all([
      getEpisodes(),
      getYouTubeVideos(),
    ]);
    return { ...episodes, videos: youtube.videos };
  },
  head: () => ({
    meta: [
      { title: SEO_TITLE },
      { name: "description", content: SEO_DESC },
      { property: "og:title", content: SEO_TITLE },
      { property: "og:description", content: SEO_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: new URL(PODCAST.avatarUrl, SITE_URL).href },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SEO_TITLE },
      { name: "twitter:description", content: SEO_DESC },
      { name: "twitter:image", content: new URL(PODCAST.avatarUrl, SITE_URL).href },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PodcastSeries",
          name: PODCAST.name,
          description: SEO_DESC,
          inLanguage: "zh-TW",
          url: SITE_URL,
          image: new URL(PODCAST.avatarUrl, SITE_URL).href,
          author: { "@type": "Person", name: PODCAST.hostName },
          sameAs: PLATFORMS.map((p) => p.url),
          ...(PODCAST.rssFeedUrl ? { webFeed: PODCAST.rssFeedUrl } : {}),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { episodes, source, videos } = Route.useLoaderData();
  return <EnianLanding episodes={episodes} source={source} videos={videos} />;
}
