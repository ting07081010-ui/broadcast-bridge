import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { ArchivePage as ArchivePageData } from "@/lib/blog/posts.functions";
import { formatMonth } from "@/lib/blog/time";
import { TOPICS } from "@/lib/blog/topics";
import { TOPIC_SLUGS, type TopicSlug } from "@/lib/blog/types";
import { BTN_SECONDARY } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";
import BlogShell, { BackToAllLink, EmptyState } from "./BlogShell";
import { PostRows } from "./PostList";

// 篩選連結只有 query 完全相同才算目前位置（Link 會自動加上 aria-current）
const EXACT_SEARCH = { exact: true, includeSearch: true } as const;

const chipClass = (active: boolean) =>
  cn(
    "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-sm transition-colors duration-200",
    active
      ? "border-foreground font-semibold text-foreground"
      : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
  );

export default function ArchivePage({
  data,
  topic,
}: {
  data: ArchivePageData;
  /** 來自網址 ?topic=，重新整理與返回都會保留 */
  topic?: TopicSlug;
}) {
  const hasAnyPost = data.groups.length > 0;
  const groups = data.groups
    .map((group) => ({
      ...group,
      posts: topic ? group.posts.filter((post) => post.topic === topic) : group.posts,
    }))
    .filter((group) => group.posts.length > 0);

  return (
    <BlogShell section="archive">
      <header className="pb-6 pt-8 lg:pb-8 lg:pt-12">
        <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight text-foreground lg:text-[42px]">
          封存
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-[17px]">
          所有已發布的碎念，依年月排列。
        </p>
      </header>

      {hasAnyPost ? (
        <>
          {/* 選中的狀態用勾選＋外框＋字重表示，主題色不是唯一線索 */}
          <nav
            aria-label="依主題篩選"
            className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <Link to="/blog/archive" activeOptions={EXACT_SEARCH} className={chipClass(!topic)}>
              {!topic && <Check className="h-4 w-4" aria-hidden="true" />}
              全部主題
            </Link>
            {TOPIC_SLUGS.map((slug) => (
              <Link
                key={slug}
                to="/blog/archive"
                search={{ topic: slug }}
                activeOptions={EXACT_SEARCH}
                className={chipClass(topic === slug)}
              >
                {topic === slug && <Check className="h-4 w-4" aria-hidden="true" />}
                {TOPICS[slug].name}
              </Link>
            ))}
          </nav>

          {groups.length > 0 ? (
            groups.map((group) => (
              <section key={group.month} aria-labelledby={`m-${group.month}`} className="mt-10">
                <h2
                  id={`m-${group.month}`}
                  className="text-xl font-semibold tabular-nums text-foreground"
                >
                  {formatMonth(group.month)}
                </h2>
                <div className="mt-4">
                  <PostRows posts={group.posts} showTopic={!topic} />
                </div>
              </section>
            ))
          ) : (
            <div className="mt-8 border-t border-border">
              <EmptyState
                title={`「${topic ? TOPICS[topic].name : ""}」還沒有文章`}
                action={
                  <Link to="/blog/archive" className={BTN_SECONDARY}>
                    清除篩選
                  </Link>
                }
              >
                換一個主題，或清除篩選看全部文章。
              </EmptyState>
            </div>
          )}
        </>
      ) : (
        <div className="border-t border-border">
          <EmptyState title="還沒有公開的碎念" action={<BackToAllLink />}>
            第一篇文章發布後，這裡會依年月列出所有文章。
          </EmptyState>
        </div>
      )}
    </BlogShell>
  );
}
