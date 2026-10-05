import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Headphones } from "lucide-react";
import TopNav from "@/components/enian/TopNav";
import { FooterBar } from "@/components/enian/primitives";
import type { PostPage as PostPageData } from "@/lib/blog/posts.functions";
import { formatDate, weekdayLabel } from "@/lib/blog/time";
import type { PostSummary } from "@/lib/blog/types";
import { cn } from "@/lib/utils";
import PostBody from "./PostBody";
import ReaderTools, { READER_THEME_SCRIPT, useReaderTheme } from "./ReaderTools";
import ReadingProgress from "./ReadingProgress";
import { FixtureBadge, TopicMark, TopicTag } from "./TopicTag";

const QUIET_LINK =
  "inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-muted underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline";

function AdjacentLink({ post, direction }: { post: PostSummary; direction: "older" | "newer" }) {
  const isNewer = direction === "newer";
  return (
    <Link
      to="/blog/posts/$postId"
      params={{ postId: post.path }}
      className={cn("group flex flex-col gap-2 py-5", isNewer && "sm:items-end sm:text-right")}
    >
      <span className="flex items-center gap-2 text-sm text-ink-muted">
        {!isNewer && <ArrowLeft className="h-4 w-4" aria-hidden="true" />}
        {isNewer ? "下一篇" : "上一篇"}
        {isNewer && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </span>
      <span className="text-[17px] font-semibold leading-normal text-ink underline-offset-4 group-hover:underline">
        {post.title}
      </span>
      <TopicMark topic={post.topic} className="text-sm text-ink-muted" />
    </Link>
  );
}

export default function PostPage({
  data,
  canonicalUrl,
}: {
  data: PostPageData;
  canonicalUrl: string;
}) {
  const { post, summary, toc, newer, older } = data;
  const [theme, toggleTheme] = useReaderTheme();
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <TopNav />
      {/* 伺服器固定輸出 paper；下面的行內 script 會在首次繪製前套上已存的夜讀偏好 */}
      <main
        id="main"
        data-theme={theme}
        suppressHydrationWarning
        className="blog-reader min-h-screen"
      >
        <script dangerouslySetInnerHTML={{ __html: READER_THEME_SCRIPT }} />
        <ReadingProgress targetRef={bodyRef} />

        <article className="reading-col px-5 pb-16 pt-6 sm:pt-10 lg:pb-24">
          <Link to="/blog" className={cn(QUIET_LINK, "-ml-0.5")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            全部碎念
          </Link>

          <header className="mt-4 border-b border-paper-border pb-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
              <TopicTag topic={post.topic} />
              <time dateTime={post.date} className="tabular-nums">
                {formatDate(post.date)} {weekdayLabel(post.date)}
              </time>
              <span>約 {summary.readingMinutes} 分鐘</span>
              <FixtureBadge source={post.source} />
            </div>
            <h1 className="article-title mt-5 text-ink">{post.title}</h1>
            {post.excerpt && (
              <p className="mt-5 text-[17px] leading-[1.7] text-ink-muted md:text-lg md:leading-[1.7]">
                {post.excerpt}
              </p>
            )}
            <div className="mt-6">
              <ReaderTools theme={theme} onToggleTheme={toggleTheme} canonicalUrl={canonicalUrl}>
                {post.episode && (
                  <a
                    href={post.episode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-event="click_blog_episode"
                    data-location="post_header"
                    className={cn(QUIET_LINK, "px-3")}
                  >
                    <Headphones className="h-4 w-4" aria-hidden="true" />
                    聽這集
                  </a>
                )}
              </ReaderTools>
            </div>
          </header>

          {toc.length > 0 && (
            <details className="mt-6 rounded-xl bg-paper-surface">
              <summary className="flex min-h-12 cursor-pointer items-center px-5 text-[15px] font-medium text-ink">
                本文目錄（{toc.length} 節）
              </summary>
              <ol className="list-decimal pb-3 pl-10 pr-5 text-[15px] leading-normal marker:text-ink-muted">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex min-h-11 items-center text-ink-accent underline underline-offset-4"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <div ref={bodyRef} className="mt-8">
            <PostBody blocks={post.blocks} />
          </div>

          {/* 文末：相關集數 → 前後篇 → 訂閱，依層級排開；沒有資料的區塊直接不出現 */}
          <footer className="mt-14">
            {post.episode && (
              <a
                href={post.episode.url}
                target="_blank"
                rel="noopener noreferrer"
                data-event="click_blog_episode"
                data-location="post_footer"
                className="group flex items-center gap-4 rounded-xl border border-border bg-background p-5 text-foreground"
              >
                <Headphones className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-muted-foreground">
                    {post.episode.label ?? "相關集數"}
                  </span>
                  <span className="mt-0.5 block text-[17px] font-semibold underline-offset-4 group-hover:underline">
                    聽這集
                  </span>
                </span>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </a>
            )}

            {(older || newer) && (
              <nav
                aria-label="前後篇"
                className={cn(
                  "mt-10 grid gap-x-8 divide-y divide-paper-border border-y border-paper-border sm:divide-y-0",
                  older && newer && "sm:grid-cols-2",
                )}
              >
                {older && <AdjacentLink post={older} direction="older" />}
                {newer && <AdjacentLink post={newer} direction="newer" />}
              </nav>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="/#tune-in"
                data-event="click_blog_subscribe"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-reader-primary px-5 text-[15px] font-semibold text-reader-primary-text transition-[filter] duration-200 hover:brightness-110"
              >
                <Headphones className="h-4 w-4" aria-hidden="true" />
                選平台訂閱
              </a>
              <Link to="/blog" className={QUIET_LINK}>
                回到全部碎念
              </Link>
            </div>
          </footer>
        </article>
      </main>
      <footer className="bg-background">
        <FooterBar>
          <Link to="/blog" className="transition-colors duration-200 hover:text-foreground">
            每日碎念
          </Link>
        </FooterBar>
      </footer>
    </>
  );
}
