import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
  const navHref = (href: string) => (isHome ? href : `/${href}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 點選連結或換頁後自動收合
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const close = () => setOpen(false);

  // 選單開著時背景被鎖住不能捲動，直接點錨點會跳不到位。
  // 所以先記下目的地、關閉選單，等焦點歸還的時機（背景已解鎖）再前往。
  const pendingHref = useRef<string | null>(null);
  const goAfterClose = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    pendingHref.current = event.currentTarget.href;
    setOpen(false);
  };
  const onMenuClosed = (event: Event) => {
    const href = pendingHref.current;
    if (!href) return; // 用 Escape 或關閉鈕收合：讓焦點照常回到觸發鈕
    pendingHref.current = null;
    event.preventDefault();
    window.location.assign(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled
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

          {/*
            手機選單用 Radix Dialog：Escape 關閉、焦點鎖在選單內、關閉後焦點回到觸發鈕、
            開啟時背景不捲動，這些行為都由元件提供，不自己重寫。
          */}
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              aria-label="開啟選單"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 md:hidden" />
              <Dialog.Content
                aria-describedby={undefined}
                onCloseAutoFocus={onMenuClosed}
                className="fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto border-b border-border bg-background text-foreground md:hidden"
              >
                <div className={cn(CONTAINER, "flex h-14 items-center justify-between gap-3")}>
                  <Dialog.Title className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
                    <Radio className="h-4 w-4 text-accent" aria-hidden="true" />
                    {PODCAST.name}
                    <span className="sr-only">選單</span>
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label="關閉選單"
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-border"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Dialog.Close>
                </div>
                <nav aria-label="行動裝置主導覽" className={cn(CONTAINER, "pb-5")}>
                  <ul className="border-t border-border">
                    {NAV_LINKS.map((l) => (
                      <li key={l.href} className="border-b border-border">
                        <a
                          href={navHref(l.href)}
                          onClick={goAfterClose}
                          data-event="click_nav"
                          data-target={l.href.replace("#", "")}
                          className="flex min-h-12 items-center text-base text-foreground"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={navHref("#tune-in")}
                    onClick={goAfterClose}
                    data-event="click_nav_cta"
                    data-location="mobile_menu"
                    className={cn(BTN_PRIMARY, "mt-5 w-full")}
                  >
                    <Headphones className="h-4 w-4" aria-hidden="true" />
                    選平台訂閱
                  </a>
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
