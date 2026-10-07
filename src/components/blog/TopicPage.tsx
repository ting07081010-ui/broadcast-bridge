import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { TopicPage as TopicPageData } from "@/lib/blog/posts.functions";
import { TOPICS } from "@/lib/blog/topics";
import { TOPIC_SLUGS } from "@/lib/blog/types";
import { TEXT_LINK } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";
import BlogShell, { BackToAllLink, EmptyState } from "./BlogShell";
import { PostDate, PostRows } from "./PostList";
import { FixtureBadge, TopicIcon, TopicMark } from "./TopicTag";

export default function TopicPage({ data }: { data: TopicPageData }) {
  const topic = TOPICS[data.topic];
  const [latest, ...rest] = data.posts;
  const others = TOPIC_SLUGS.filter((slug) => slug !== data.topic);

  return (
    <BlogShell section={data.topic}>
      <header className={cn(`topic-${data.topic}`, "pb-8 pt-8 lg:pb-10 lg:pt-12")}>
        {/* 主題色只作細線與圖示的裝飾，主題名永遠以文字呈現 */}
        <span aria-hidden="true" className="mb-5 block h-0.5 w-10 bg-topic" />
        <div className="flex items-center gap-3">
          <TopicIcon topic={data.topic} className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-[30px] font-semibold leading-[1.25] tracking-tight text-foreground lg:text-[42px]">
            {topic.name}
          </h1>
        </div>
        <p className="mt-3 text-[17px] leading-relaxed text-foreground lg:text-lg">
          {topic.spirit}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">規劃於每{topic.weekdayLabel}更新</p>
      </header>

      {latest ? (
        <>
          {/* 最新一篇：較大的文字區，不加外框，和下方時間線列表拉開層級 */}
          <section aria-labelledby="topic-latest" className="border-t border-border py-8 lg:py-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-accent">最新一篇</span>
              <PostDate date={latest.date} />
              <span>約 {latest.readingMinutes} 分鐘</span>
              <FixtureBadge source={latest.source} />
            </div>
            <h2
              id="topic-latest"
              className="mt-3 max-w-4xl text-balance text-[23px] font-semibold leading-[1.4] text-foreground lg:text-[28px]"
            >
              {latest.title}
            </h2>
            {latest.excerpt && (
              <p className="mt-3 line-clamp-2 max-w-3xl text-base leading-relaxed text-muted-foreground">
                {latest.excerpt}
              </p>
            )}
            <Link
              to="/blog/posts/$postId"
              params={{ postId: latest.path }}
              className={cn(TEXT_LINK, "mt-4 min-h-11")}
            >
              閱讀全文
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>

          {rest.length > 0 && (
            <section aria-labelledby="topic-earlier">
              <h2 id="topic-earlier" className="text-xl font-semibold text-foreground">
                更早的{topic.name}
              </h2>
              <div className="mt-4">
                <PostRows posts={rest} showTopic={false} />
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="border-t border-border">
          <EmptyState title="這個主題尚無文章" action={<BackToAllLink />}>
            「{topic.name}」的第一篇文章發布後會出現在這裡。
          </EmptyState>
        </div>
      )}

      <nav aria-labelledby="other-topics" className="mt-12 lg:mt-16">
        <h2 id="other-topics" className="text-sm font-medium text-muted-foreground">
          其他主題
        </h2>
        <ul className="mt-2 flex flex-wrap gap-x-6">
          {others.map((slug) => (
            <li key={slug}>
              <Link
                to="/blog/topic/$topic"
                params={{ topic: slug }}
                className="inline-flex min-h-11 items-center text-[15px] text-foreground underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
              >
                <TopicMark topic={slug} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </BlogShell>
  );
}
