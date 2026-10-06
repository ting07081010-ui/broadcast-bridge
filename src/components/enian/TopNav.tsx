import { useEffect, useState } from "react";
import { Menu, Radio, X, Headphones } from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import { NAV_LINKS, PODCAST } from "@/lib/enian/constants";
import { BTN_PRIMARY, BTN_SM, CONTAINER } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const logoHref = isHome ? "#top" : "/";
  const navHref = (href: string) => (href.startsWith("/") || isHome ? href : `/${href}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled || open
          ? "border-border bg-background/90 backdrop-blur"
          : "border-transparent bg-background",
      )}
    >
      <div className={cn(CONTAINER, "flex h-14 items-center justify-between gap-3 md:h-16")}>
        <a
          href={logoHref}
          className="flex items-center gap-2.5 text-foreground"
          data-event="click_nav"
          data-target="logo"
        >
          <Radio className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="text-[15px] font-semibold tracking-tight">{PODCAST.name}</span>
          <span
            className="hidden font-mono text-xs tracking-wider text-muted-foreground sm:inline"
            aria-hidden="true"
          >
            {PODCAST.frequency}
          </span>
        </a>

        <div className="flex items-center gap-2">
          <nav className="mr-2 hidden items-center gap-6 md:flex" aria-label="主導覽">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={navHref(l.href)}
                data-event="click_nav"
                data-target={l.href.replace("#", "")}
                className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* 全站導覽只保留這一顆訂閱鈕 */}
          <a
            href={navHref("#tune-in")}
            onClick={close}
            data-event="click_nav_cta"
            className={cn(BTN_PRIMARY, BTN_SM)}
          >
            <Headphones className="h-4 w-4" aria-hidden="true" />
            訂閱
          </a>

          <button
            type="button"
            aria-label={open ? "關閉選單" : "開啟選單"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-background md:hidden"
          aria-label="行動裝置主導覽"
        >
          <ul className={cn(CONTAINER, "flex flex-col py-2")}>
            {NAV_LINKS.map((l) => (
              <li key={l.href} className="border-b border-border last:border-b-0">
                <a
                  href={navHref(l.href)}
                  onClick={close}
                  data-event="click_nav"
                  data-target={l.href.replace("#", "")}
                  className="block py-3.5 text-[15px] text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
