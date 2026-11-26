import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, Radio, X, Headphones } from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { NAV_LINKS, PODCAST } from "@/lib/enian/constants";
import { BTN_PRIMARY, BTN_SM, CONTAINER } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";

type InternalRoute = "/" | "/blog" | "/podcast-recommendations";
type PendingNav = { to?: InternalRoute; hash?: string };

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 視窗寬度拉大到桌機斷點時自動收合行動選單，避免背景維持 scroll lock
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // 點選連結或換頁後自動收合
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const close = () => setOpen(false);

  // 選單開著時背景被鎖住不能捲動，直接點錨點會跳不到位。
  // 所以先記下目的地、關閉選單，等焦點歸還的時機（背景已解鎖）再前往。
  const pendingNav = useRef<PendingNav | null>(null);
  const scheduleNav = (target: PendingNav) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    pendingNav.current = target;
    setOpen(false);
  };
  const onMenuClosed = (event: Event) => {
    const target = pendingNav.current;
    if (!target) return; // 用 Escape 或關閉鈕收合：讓焦點照常回到觸發鈕
    pendingNav.current = null;
    event.preventDefault();
    if (target.to) {
      void navigate({ to: target.to, ...(target.hash ? { hash: target.hash } : {}) });
      return;
    }
    if (target.hash) {
      const el = document.getElementById(target.hash);
      if (el) {
        el.scrollIntoView();
        window.history.replaceState(null, "", `#${target.hash}`);
      } else {
        window.location.hash = `#${target.hash}`;
      }
    }
  };

  const brandContent = (
    <>
      <Radio className="h-4 w-4 text-accent" aria-hidden="true" />
      <span className="text-[15px] font-semibold tracking-tight">{PODCAST.name}</span>
      <span
        className="hidden font-mono text-xs tracking-wider text-muted-foreground sm:inline"
        aria-hidden="true"
      >
        {PODCAST.frequency}
      </span>
    </>
  );

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
        {isHome ? (
          <a
            href="#top"
            className="flex items-center gap-2.5 text-foreground"
            data-event="click_nav"
            data-target="logo"
          >
            {brandContent}
          </a>
        ) : (
          <Link
            to="/"
            className="flex items-center gap-2.5 text-foreground"
            data-event="click_nav"
            data-target="logo"
          >
            {brandContent}
          </Link>
        )}

        <div className="flex items-center gap-2">
          <nav className="mr-2 hidden items-center gap-6 md:flex" aria-label="主導覽">
            {NAV_LINKS.map((l) => {
              const linkClass =
                "text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground";
              if (l.href.startsWith("/")) {
                return (
                  <Link
                    key={l.href}
                    to={l.href as InternalRoute}
                    data-event="click_nav"
                    data-target={l.href.replace("#", "")}
                    className={linkClass}
                  >
                    {l.label}
                  </Link>
                );
              }
              if (isHome) {
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    data-event="click_nav"
                    data-target={l.href.replace("#", "")}
                    className={linkClass}
                  >
                    {l.label}
                  </a>
                );
              }
              return (
                <Link
                  key={l.href}
                  to="/"
                  hash={l.href.slice(1)}
                  data-event="click_nav"
                  data-target={l.href.replace("#", "")}
                  className={linkClass}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* 全站導覽只保留這一顆訂閱鈕 */}
          {isHome ? (
            <a
              href="#tune-in"
              onClick={close}
              data-event="click_nav_cta"
              className={cn(BTN_PRIMARY, BTN_SM)}
            >
              <Headphones className="h-4 w-4" aria-hidden="true" />
              訂閱
            </a>
          ) : (
            <Link
              to="/"
              hash="tune-in"
              onClick={close}
              data-event="click_nav_cta"
              className={cn(BTN_PRIMARY, BTN_SM)}
            >
              <Headphones className="h-4 w-4" aria-hidden="true" />
              訂閱
            </Link>
          )}

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
                    {NAV_LINKS.map((l) => {
                      const itemClass = "flex min-h-12 items-center text-base text-foreground";
                      if (l.href.startsWith("/")) {
                        return (
                          <li key={l.href} className="border-b border-border">
                            <Link
                              to={l.href as InternalRoute}
                              onClick={scheduleNav({ to: l.href as InternalRoute })}
                              data-event="click_nav"
                              data-target={l.href.replace("#", "")}
                              className={itemClass}
                            >
                              {l.label}
                            </Link>
                          </li>
                        );
                      }
                      if (isHome) {
                        return (
                          <li key={l.href} className="border-b border-border">
                            <a
                              href={l.href}
                              onClick={scheduleNav({ hash: l.href.slice(1) })}
                              data-event="click_nav"
                              data-target={l.href.replace("#", "")}
                              className={itemClass}
                            >
                              {l.label}
                            </a>
                          </li>
                        );
                      }
                      return (
                        <li key={l.href} className="border-b border-border">
                          <Link
                            to="/"
                            hash={l.href.slice(1)}
                            onClick={scheduleNav({ to: "/", hash: l.href.slice(1) })}
                            data-event="click_nav"
                            data-target={l.href.replace("#", "")}
                            className={itemClass}
                          >
                            {l.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {isHome ? (
                    <a
                      href="#tune-in"
                      onClick={scheduleNav({ hash: "tune-in" })}
                      data-event="click_nav_cta"
                      data-location="mobile_menu"
                      className={cn(BTN_PRIMARY, "mt-5 w-full")}
                    >
                      <Headphones className="h-4 w-4" aria-hidden="true" />
                      選平台訂閱
                    </a>
                  ) : (
                    <Link
                      to="/"
                      hash="tune-in"
                      onClick={scheduleNav({ to: "/", hash: "tune-in" })}
                      data-event="click_nav_cta"
                      data-location="mobile_menu"
                      className={cn(BTN_PRIMARY, "mt-5 w-full")}
                    >
                      <Headphones className="h-4 w-4" aria-hidden="true" />
                      選平台訂閱
                    </Link>
                  )}
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
