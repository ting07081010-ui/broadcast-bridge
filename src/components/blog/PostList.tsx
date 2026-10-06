import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { formatDate, weekdayLabel } from "@/lib/blog/time";
import type { PostSummary } from "@/lib/blog/types";
import { cn } from "@/lib/utils";
import { FixtureBadge, TopicMark } from "./TopicTag";

/** 全站一致的日期寫法：2026.10.05 週一 */
export function PostDate({ date, className }: { date: string; className?: string }) {
  return (
    <time dateTime={date} className={cn("tabular-nums", className)}>
      {formatDate(date)} {weekdayLabel(date)}
    </time>
  );
}

/**
 * 文章列：桌機「日期｜主題｜標題｜箭頭」，手機 meta 在上、標題在下。
 * 長標題讓列高自然成長，不裁字。
 */
export function PostRow({ post, showTopic = true }: { post: PostSummary; showTopic?: boolean }) {
  return (
    <li>
      <Link
        to="/blog/posts/$postId"
        params={{ postId: post.path }}
        className={cn(
          "group grid min-h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-4 md:gap-x-6",
          showTopic
            ? "md:grid-cols-[136px_88px_minmax(0,1fr)_auto]"
            : "md:grid-cols-[136px_minmax(0,1fr)_auto]",
        )}
      >
        <span className="col-span-2 flex items-center gap-3 text-sm text-muted-foreground md:contents">
          <PostDate date={post.date} />
          {showTopic && <TopicMark topic={post.topic} />}
          <span className="md:hidden">
            <FixtureBadge source={post.source} />
          </span>
        </span>
        <span className="text-[17px] font-medium leading-normal text-foreground transition-colors duration-200 group-hover:text-accent">
          {post.title}
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-accent"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

export function PostRows({ posts, showTopic }: { posts: PostSummary[]; showTopic?: boolean }) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {posts.map((post) => (
        <PostRow key={post.id} post={post} showTopic={showTopic} />
      ))}
    </ol>
  );
}
