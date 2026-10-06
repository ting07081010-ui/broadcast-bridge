import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/enian/primitives";
import type { BlogIndex } from "@/lib/blog/posts.functions";
import type { Feature, WeekDay } from "@/lib/blog/posts";
import { formatDate } from "@/lib/blog/time";
import { TOPICS, WEEK_ORDER } from "@/lib/blog/topics";
import { TOPIC_SLUGS, type PostSummary } from "@/lib/blog/types";
import { BTN_PRIMARY, BTN_SECONDARY, TEXT_LINK } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";
import BlogShell, { EmptyState } from "./BlogShell";
import { PostDate, PostRows } from "./PostList";
import { FixtureBadge, TopicIcon, TopicTag } from "./TopicTag";

const SECTION_TITLE = "text-xl font-semibold text-foreground";
const QUIET_LINK =
  "inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline";

function FeatureSection({ feature }: { feature: Feature }) {
  const { post, kind } = feature;
  return (
    <section
      aria-labelledby="feature-title"
      className="rounded-xl border border-border bg-surface p-6 lg:p-8"
    >
      <p className="text-sm font-medium text-accent">
        {kind === "today" ? "今日一篇" : "最新碎念"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <TopicTag topic={post.topic} />
        <PostDate date={post.date} />
        <span>約 {post.readingMinutes} 分鐘</span>
        <FixtureBadge source={post.source} />
      </div>
      <h2
        id="feature-title"
        className="mt-4 max-w-4xl text-balance text-[23px] font-semibold leading-[1.4] text-foreground lg:text-[28px]"
      >
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="mt-3 line-clamp-2 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link to="/blog/posts/$postId" params={{ postId: post.path }} className={BTN_PRIMARY}>
          閱讀全文
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        {post.episode && (
          <a
            href={post.episode.url}
            target="_blank"
            rel="noopener noreferrer"
            data-event="click_blog_episode"
            className={QUIET_LINK}
          >
            聽這集
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}

function WeekStrip({ week, today, weekKey }: { week: WeekDay[]; today: string; weekKey: string }) {
  return (
    <section aria-labelledby="week-title" className="mt-12 lg:mt-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="week-title" className={SECTION_TITLE}>
          本週
        </h2>
        <p className="text-sm tabular-nums text-muted-foreground">
          {formatDate(week[0].date)} – {formatDate(week[6].date).slice(5)}
        </p>
      </div>
      {/* 只有週曆自己可以橫滑；下一格露出一部分提示可滑。
          週曆格是索引，標題最多四行；完整標題在下方列表與單篇頁 */}
      <ol className="-mx-5 mt-5 flex snap-x snap-proximity scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0 lg:pb-0">
        {week.map((day, i) => {
          const topic = TOPICS[WEEK_ORDER[i]];
          const isToday = day.date === today;
          return (
            <li
              key={day.date}
              className={cn(
                `topic-${topic.slug}`,
                "flex w-[148px] shrink-0 snap-start flex-col rounded-lg border bg-background p-4 lg:w-auto",
                isToday ? "border-foreground" : "border-border",
              )}
            >
              <span aria-hidden="true" className="mb-3 block h-0.5 w-6 bg-topic" />
              <p className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold text-foreground">{topic.weekdayLabel}</span>
                <time dateTime={day.date} className="tabular-nums text-muted-foreground">
                  {formatDate(day.date).slice(5)}
                </time>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {topic.name}
                {isToday && <span className="ml-2 font-medium text-foreground">今天</span>}
              </p>
              <div className="mt-3 flex flex-1 flex-col gap-2 border-t border-border pt-3 text-sm leading-normal">
                {day.posts.map((post) => (
                  <Link
                    key={post.id}
                    to="/blog/posts/$postId"
                    params={{ postId: post.path }}
                    title={post.title}
                    className="line-clamp-4 min-h-11 font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
                  >
                    {post.title}
                  </Link>
                ))}
                {topic.slug === "rest" ? (
                  <Link
                    to="/blog/week/$weekKey"
                    params={{ weekKey }}
                    className="inline-flex min-h-11 items-start gap-1 font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
                  >
                    本週索引
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                ) : (
                  day.posts.length === 0 && <p className="text-muted-foreground">本週尚無文章</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** 六主題入口：細分隔＋留白，不做六張胖卡。桌機三欄兩排、手機兩欄三排。 */
function TopicEntrances() {
  return (
    <section aria-labelledby="topics-title" className="mt-12 lg:mt-16">
      <h2 id="topics-title" className={SECTION_TITLE}>
        六個主題
      </h2>
      <ul className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-3">
        {TOPIC_SLUGS.map((slug) => {
          const topic = TOPICS[slug];
          return (
            <li key={slug} className={cn(`topic-${slug}`, "bg-background")}>
              <Link
                to="/blog/topic/$topic"
                params={{ topic: slug }}
                className="group flex h-full min-h-[88px] items-start gap-3 p-4 transition-colors duration-200 hover:bg-surface sm:p-5"
              >
                <TopicIcon topic={slug} className="mt-0.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[17px] font-semibold text-foreground">
                    {topic.name}
                    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-topic" />
                  </span>
                  <span className="mt-1 block text-sm leading-normal text-muted-foreground">
                    {topic.spirit}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LatestList({ posts }: { posts: PostSummary[] }) {
  return (
    <section aria-labelledby="latest-title" className="mt-12 lg:mt-16">
      <h2 id="latest-title" className={SECTION_TITLE}>
        更多碎念
      </h2>
      {posts.length > 0 && (
        <div className="mt-4">
          <PostRows posts={posts} />
        </div>
      )}
      <Link to="/blog/archive" className={cn(TEXT_LINK, "mt-5 min-h-11")}>
        看全部封存
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export default function BlogHome({ index }: { index: BlogIndex }) {
  const { feature, week, latest, today, weekKey } = index;
  return (
    <BlogShell section="all">
      <header className="pb-6 pt-8 lg:pb-8 lg:pt-12">
        <Eyebrow>E 人 I 碎念・文字版</Eyebrow>
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight text-foreground lg:text-[42px]">
          每日碎念
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-[17px]">
          週一到週六，一天一個主題，從身體、心情、靈命寫到家庭、事業、社會。聽完節目，回來把想法寫慢一點。
        </p>
      </header>

      {feature ? (
        <>
          <FeatureSection feature={feature} />
          <WeekStrip week={week} today={today} weekKey={weekKey} />
          <TopicEntrances />
          <LatestList posts={latest} />
        </>
      ) : (
        <EmptyState
          title="還沒有公開的碎念"
          action={
            <a href="/#first-listen" className={BTN_SECONDARY}>
              先聽一集
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          }
        >
          第一篇文章發布後會出現在這裡。現在可以先回首頁聽最近的集數。
        </EmptyState>
      )}
    </BlogShell>
  );
}
