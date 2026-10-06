import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import TopNav from "@/components/enian/TopNav";
import { FooterBar } from "@/components/enian/primitives";
import { BTN_SECONDARY, CONTAINER } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";

/** 單篇不存在（或尚未公開）時的頁面；HTTP 狀態仍是 404。 */
export default function PostNotFound() {
  return (
    <>
      <TopNav />
      <main id="main" className="min-h-[70vh] bg-background text-foreground">
        <div className={cn(CONTAINER, "py-16 lg:py-24")}>
          <p className="text-sm font-medium tabular-nums text-muted-foreground">404</p>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.3] lg:text-[36px]">
            找不到這篇碎念
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            網址可能打錯了，或這篇文章已經下架。
          </p>
          <Link to="/blog" className={cn(BTN_SECONDARY, "mt-6")}>
            看全部碎念
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
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
