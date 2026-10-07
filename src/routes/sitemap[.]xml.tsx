import { createFileRoute } from "@tanstack/react-router";
import { listSitemapPaths } from "@/lib/blog/posts.functions";

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
  // 只列通過發布閘門的真實文章與它們衍生的頁面；還沒有文章時部落格網址一個都不列
  const blogPaths = await listSitemapPaths();
  const entries = [
    urlEntry(`${SITE}/`, today, "weekly", "1.0"),
    urlEntry(`${SITE}/podcast-recommendations`, today, "monthly", "0.7"),
    ...blogPaths.map(({ path, updatedAt }) =>
      urlEntry(
        `${SITE}${path}`,
        updatedAt.split("T")[0],
        path.startsWith("/blog/posts/") ? "monthly" : "daily",
        path === "/blog" ? "0.8" : "0.6",
      ),
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
