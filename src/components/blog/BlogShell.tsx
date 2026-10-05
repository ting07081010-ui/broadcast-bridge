import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import TopNav from "@/components/enian/TopNav";
import { FooterBar } from "@/components/enian/primitives";
import { TOPICS } from "@/lib/blog/topics";
import { TOPIC_SLUGS, type TopicSlug } from "@/lib/blog/types";
import { BTN_SECONDARY, CONTAINER } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";

export type BlogSection = "all" | "archive" | TopicSlug | null;

const subNavClass = (active: boolean) =>
  cn(
    "inline-flex min-h-11 shrink-0 items-center border-b-2 px-1 text-[15px] transition-colors duration-200",
    active
      ? "border-foreground font-semibold text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground",
  );
// Link 預設用前綴比對判定 active（/blog 會連 /blog/topic/* 一起算），這裡一律改成完全相符
const EXACT = { exact: true, includeSearch: false } as const;
const current = (active: boolean) => (active ? ("page" as const) : undefined);

/** 部落格深底頁面共用的外殼：全站頂欄＋頁內次導覽（全部／六主題／封存）＋頁尾。 */
export default function BlogShell({
  section,
  children,
}: {
  section: BlogSection;
  children: ReactNode;
}) {
  return (
    <>
      <TopNav />
      <main id="main" className="min-h-screen bg-background pb-16 text-foreground lg:pb-24">
        <div className={CONTAINER}>
          {/* 手機可橫滑；位置以底線＋字重表示，不靠顏色 */}
          <nav
            aria-label="碎念分類"
            className="-mx-5 flex gap-5 overflow-x-auto border-b border-border px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <Link
              to="/blog"
              activeOptions={EXACT}
              aria-current={current(section === "all")}
              className={subNavClass(section === "all")}
            >
              全部
            </Link>
            {TOPIC_SLUGS.map((topic) => (
              <Link
                key={topic}
                to="/blog/topic/$topic"
                params={{ topic }}
                activeOptions={EXACT}
                aria-current={current(section === topic)}
                className={subNavClass(section === topic)}
              >
                {TOPICS[topic].name}
              </Link>
            ))}
            <Link
              to="/blog/archive"
              activeOptions={EXACT}
              aria-current={current(section === "archive")}
              className={subNavClass(section === "archive")}
            >
              封存
            </Link>
          </nav>
          {children}
        </div>
      </main>
      <footer className="bg-background">
        <FooterBar>
          <a href="/" className="transition-colors duration-200 hover:text-foreground">
            回到首頁
          </a>
        </FooterBar>
      </footer>
    </>
  );
}

/** 空狀態：一句說明＋一個可行去向，不用插畫硬撐。 */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action: ReactNode;
}) {
  return (
    <section className="border-b border-border py-12">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{children}</p>
      <div className="mt-6">{action}</div>
    </section>
  );
}

export function BackToAllLink() {
  return (
    <Link to="/blog" className={BTN_SECONDARY}>
      看全部碎念
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
