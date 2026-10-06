import { createFileRoute } from "@tanstack/react-router";
import { listSitemapPosts } from "@/lib/blog/posts.functions";

const SITE = "https://emting.life";

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function buildSitemap(): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  // 只列通過發布閘門的真實文章；還沒有文章時連 /blog 都不列
  const posts = await listSitemapPosts();
  const entries = [
    urlEntry(`${SITE}/`, today, "weekly", "1.0"),
    urlEntry(`${SITE}/podcast-recommendations`, today, "monthly", "0.7"),
    ...(posts.length > 0 ? [urlEntry(`${SITE}/blog`, today, "daily", "0.8")] : []),
    ...posts.map((post) =>
      urlEntry(`${SITE}/blog/posts/${post.path}`, post.updatedAt.split("T")[0], "monthly", "0.6"),
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(await buildSitemap(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
