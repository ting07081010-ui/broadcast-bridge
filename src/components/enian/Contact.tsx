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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px] lg:items-start">
          <div>
            <p
              className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
              aria-hidden="true"
            >
              // CONTACT_CHANNELS
            </p>
            <h2
              className="text-3xl font-medium text-[var(--studio-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              想合作、投稿，或只是想聊聊？
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--studio-text-muted)] sm:text-lg">
              來賓邀約、品牌合作、聽眾回饋都歡迎。正式合作建議直接寄信，想快速互動或丟靈感，Instagram
              也可以。
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--studio-border)] bg-[var(--studio-bg)] p-5">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--studio-text-muted)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
            >
              QUICK CONTACT
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--studio-text)] px-5 py-3 text-sm font-semibold text-[var(--studio-bg)] transition hover:opacity-90"
            >
              直接寄信到 {CONTACT.email}
            </a>
            <a
              href={CONTACT.instagramDm}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface)] px-5 py-3 text-sm font-semibold text-[var(--studio-text)] transition hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)]"
            >
              也可以走 Instagram 私訊
            </a>
            <p className="mt-4 text-sm leading-relaxed text-[var(--studio-text-muted)]">
              品牌合作與來賓邀約建議用 email，資訊最完整；聽眾回饋或主題許願，用 IG 比較輕鬆。
            </p>
          </div>
        </div>

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
                className="group flex flex-col rounded-[1.5rem] border border-[var(--studio-border)] bg-[var(--studio-bg)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--neon-magenta)] hover:shadow-[var(--shadow-neon-magenta)]"
              >
                <Icon className="h-6 w-6 text-[var(--neon-magenta)]" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold text-[var(--studio-text)]">{c.title}</h3>
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
