import { ArrowUpRight, Mail, Mic, Handshake, MessageCircle } from "lucide-react";
import { CONTACT } from "@/lib/enian/constants";
import { BTN_SECONDARY, CONTAINER, SECTION_Y } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./primitives";

const ICONS = [Mic, Handshake, MessageCircle];

export default function Contact() {
  return (
    <section id="contact" className="border-b border-border bg-surface">
      <div
        className={cn(
          CONTAINER,
          SECTION_Y,
          "grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16",
        )}
      >
        <div>
          <SectionHeader
            eyebrow="聯絡"
            title="想合作、投稿，或只是想聊聊？"
            lead="來賓邀約、品牌合作、聽眾回饋都歡迎。正式合作建議直接寄信，想快速互動或丟靈感，Instagram 也可以。"
          />
          <a href={`mailto:${CONTACT.email}`} className={cn(BTN_SECONDARY, "mt-6")}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {CONTACT.email}
          </a>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {CONTACT.channels.map((c, idx) => {
            const Icon = ICONS[idx] ?? Mic;
            const isExternal = c.href.startsWith("http");
            return (
              <li key={c.title}>
                <a
                  href={c.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  data-event="click_contact"
                  data-channel={c.title}
                  className="group flex items-start gap-4 py-5"
                >
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-accent-2" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold leading-snug text-foreground">
                      {c.title}
                    </span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-muted-foreground">
                      {c.desc}
                    </span>
                  </span>
                  <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent underline-offset-4 group-hover:underline">
                    {c.action}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
