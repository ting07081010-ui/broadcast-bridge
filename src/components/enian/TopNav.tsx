import { useEffect, useState } from "react";
import { Menu, Radio, X, Headphones } from "lucide-react";
import { NAV_LINKS, PODCAST } from "@/lib/enian/constants";

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? "border-[var(--studio-border)] bg-[color-mix(in_oklab,var(--studio-bg)_85%,transparent)] backdrop-blur"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          className="flex items-center gap-2 text-[var(--studio-text)]"
          data-event="click_nav"
          data-target="logo"
        >
          <Radio className="h-4 w-4 text-[var(--neon-cyan)]" aria-hidden="true" />
          <span
            className="font-mono text-xs uppercase tracking-widest text-[var(--studio-text-muted)]"
            style={{ fontFamily: "var(--font-mono-display)" }}
            aria-hidden="true"
          >
            {PODCAST.frequency}
          </span>
          <span className="ml-1 text-sm font-bold">{PODCAST.name}</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主導覽">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-event="click_nav"
              data-target={l.href.replace("#", "")}
              className="rounded-full px-3 py-1.5 text-sm text-[var(--studio-text-muted)] transition hover:bg-[var(--studio-surface)] hover:text-[var(--studio-text)]"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#tune-in"
            data-event="click_nav_cta"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--studio-text)] px-3.5 py-1.5 text-sm font-bold text-[var(--studio-bg)] transition hover:opacity-90"
          >
            <Headphones className="h-3.5 w-3.5" />
            訂閱
          </a>
        </nav>

        <button
          type="button"
          aria-label={open ? "關閉選單" : "開啟選單"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-[var(--studio-border)] p-2 text-[var(--studio-text)] md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-[var(--studio-border)] bg-[var(--studio-bg)] md:hidden"
          aria-label="行動裝置主導覽"
        >
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={close}
                  data-event="click_nav"
                  data-target={l.href.replace("#", "")}
                  className="block rounded-md px-3 py-2.5 text-sm text-[var(--studio-text)] hover:bg-[var(--studio-surface)]"
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
