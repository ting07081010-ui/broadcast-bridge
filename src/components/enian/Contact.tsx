import { Eyebrow } from "./primitives";
import { ArrowUpRight, Mic, Handshake, MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/enian/constants";

const ICONS = [Mic, Handshake, MessageCircle];

export default function Contact() {
  return (
    <section id="contact" className="border-b border-border bg-surface px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px] lg:items-start">
          <div>
            <Eyebrow>聯絡</Eyebrow>
            <h2 className="text-3xl font-medium text-foreground sm:text-4xl">
              想合作、投稿，或只是想聊聊？
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">
              來賓邀約、品牌合作、聽眾回饋都歡迎。正式合作建議直接寄信，想快速互動或丟靈感，Instagram
              也可以。
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <p className="text-[13px] font-medium text-muted-foreground">快速聯絡</p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              直接寄信到 {CONTACT.email}
            </a>
            <a
              href={CONTACT.instagramDm}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent-2 hover:text-accent-2"
            >
              也可以走 Instagram 私訊
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
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
                className="group flex flex-col rounded-xl border border-border bg-background p-5 transition hover:border-accent"
              >
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold text-foreground">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {c.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-2 group-hover:underline">
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
