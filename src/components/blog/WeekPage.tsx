import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { WeekPage as WeekPageData } from "@/lib/blog/posts.functions";
import { formatDate, formatWeekKey } from "@/lib/blog/time";
import { TOPICS, WEEK_ORDER } from "@/lib/blog/topics";
import { cn } from "@/lib/utils";
import BlogShell, { BackToAllLink, EmptyState } from "./BlogShell";
import { FixtureBadge, TopicIcon, TopicMark } from "./TopicTag";

const WEEK_NAV_LINK =
  "inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline";

export default function WeekPage({ data }: { data: WeekPageData }) {
  const { days, weekKey, isCurrentWeek, previousKey, nextKey } = data;
  const total = days.reduce((sum, day) => sum + day.posts.length, 0);
  // 週一到週六是六個主題日；週日只有當天真的有文章才列出
  const listed = days.filter((day, i) => i < 6 || day.posts.length > 0);

  return (
    <BlogShell section={null}>
      <header className="topic-rest pb-8 pt-8 lg:pb-10 lg:pt-12">
        <span aria-hidden="true" className="mb-5 block h-0.5 w-10 bg-topic" />
        <div className="flex items-center gap-3">
          <TopicIcon topic="rest" className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight text-foreground lg:text-[42px]">
            一週回顧
          </h1>
        </div>
        <p className="mt-3 text-[17px] tabular-nums leading-relaxed text-foreground lg:text-lg">
          {formatWeekKey(weekKey)}・{formatDate(days[0].date)} – {formatDate(days[6].date).slice(5)}
          {isCurrentWeek && <span className="ml-2 text-muted-foreground">（本週）</span>}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">{TOPICS.rest.spirit}</p>
      </header>

      {total > 0 ? (
        <ol className="divide-y divide-border border-y border-border">
          {listed.map((day, i) => {
            const planned = TOPICS[WEEK_ORDER[days.indexOf(day)]];
            return (
              <li
                key={day.date}
                className="grid gap-x-6 gap-y-2 py-5 md:grid-cols-[136px_minmax(0,1fr)]"
              >
                <p className="flex items-baseline gap-3 text-sm md:flex-col md:gap-1">
                  <span className="font-semibold text-foreground">{planned.weekdayLabel}</span>
                  <time dateTime={day.date} className="tabular-nums text-muted-foreground">
                    {formatDate(day.date)}
                  </time>
                </p>
                {day.posts.length > 0 ? (
                  <ul className="flex flex-col gap-4">
                    {day.posts.map((post) => (
                      <li key={post.id}>
                        <p className="flex items-center gap-3 text-sm text-muted-foreground">
                          <TopicMark topic={post.topic} />
                          <FixtureBadge source={post.source} />
                        </p>
                        <Link
                          to="/blog/posts/$postId"
                          params={{ postId: post.path }}
                          className="mt-1 inline-flex min-h-11 items-center text-[17px] font-medium leading-normal text-foreground underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
                        >
                          {post.title}
                        </Link>
                        {post.excerpt && (
                          <p className="line-clamp-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
                            {post.excerpt}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={cn(`topic-${planned.slug}`, "text-[15px] text-muted-foreground")}>
                    {i < 6 && `${planned.name}：`}本週尚無文章
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="border-t border-border">
          <EmptyState title="這一週沒有文章" action={<BackToAllLink />}>
            {isCurrentWeek ? "本週的文章發布後會列在這裡。" : "這一週沒有發布任何碎念。"}
          </EmptyState>
        </div>
      )}

      {(previousKey || nextKey) && (
        <nav aria-label="前後週" className="mt-8 flex items-center justify-between gap-4">
          {previousKey ? (
            <Link
              to="/blog/week/$weekKey"
              params={{ weekKey: previousKey }}
              className={WEEK_NAV_LINK}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              上一週
            </Link>
          ) : (
            <span />
          )}
          {nextKey && (
            <Link to="/blog/week/$weekKey" params={{ weekKey: nextKey }} className={WEEK_NAV_LINK}>
              下一週
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </BlogShell>
  );
}
