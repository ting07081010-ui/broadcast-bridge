import { ArrowUpRight, Mic, Handshake, MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/enian/constants";

const ICONS = [Mic, Handshake, MessageCircle];

export default function Contact() {
  return (
    <section
      id="contact"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-surface)] px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
          aria-hidden="true"
        >
          // CONTACT_CHANNELS
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
          一起做點什麼？
        </h2>
        <p className="mt-3 text-[var(--studio-text-muted)]">
          來賓邀約、品牌合作、聽眾回饋，挑一個最方便的方式聯絡。
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CONTACT.channels.map((c, idx) => {
            const Icon = ICONS[idx] ?? Mic;
            const isExternal = c.href.startsWith("http");
            return (
              <a
                key={c.title}
                href={c.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
                data-event="click_contact"
                data-channel={c.title}
                className="group flex flex-col rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--neon-magenta)] hover:shadow-[var(--shadow-neon-magenta)]"
              >
                <Icon
                  className="h-6 w-6 text-[var(--neon-magenta)]"
                  aria-hidden="true"
                />
                <h3 className="mt-3 text-lg font-bold text-[var(--studio-text)]">
                  {c.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--studio-text-muted)]">
                  {c.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--neon-cyan)] group-hover:underline">
                  {c.action}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
