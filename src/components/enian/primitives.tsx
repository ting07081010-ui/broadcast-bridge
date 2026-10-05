import type { ReactNode } from "react";
import {
  AtSign,
  AudioLines,
  Camera,
  Mail,
  MonitorPlay,
  Podcast,
  Radio,
  ThumbsUp,
} from "lucide-react";
import { CONTACT, PODCAST, type PlatformKey } from "@/lib/enian/constants";
import { CONTAINER } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";

/** 區塊眉題：短中文標籤＋一小段琥珀刻度線（取代原本的 `// CODE_LABEL`）。 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mb-3 flex items-center gap-2.5 text-[13px] font-medium tracking-[0.08em] text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-5 bg-accent" />
      {children}
    </p>
  );
}

/** 區塊標頭：眉題＋H2＋一句導語。 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-[26px] font-semibold leading-[1.25] tracking-tight text-foreground sm:text-[32px]">
        {title}
      </h2>
      {lead && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          {lead}
        </p>
      )}
    </div>
  );
}

// 不依賴外部品牌 SVG：用通用線條圖示＋旁邊的平台名稱文字辨識。
const PLATFORM_ICONS: Record<PlatformKey, typeof AudioLines> = {
  spotify: AudioLines,
  apple: Podcast,
  youtube: MonitorPlay,
  facebook: ThumbsUp,
  instagram: Camera,
  threads: AtSign,
};

export function PlatformIcon({
  platform,
  className,
}: {
  platform: PlatformKey;
  className?: string;
}) {
  const Icon = PLATFORM_ICONS[platform];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-foreground",
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

/** 頁尾底列：品牌、頁面專屬連結（children）、合作信箱與版權。兩個頁面共用。 */
export function FooterBar({ children }: { children?: ReactNode }) {
  return (
    <div className="border-t border-border">
      <div
        className={cn(
          CONTAINER,
          "flex flex-col gap-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between",
        )}
      >
        <p className="flex items-center gap-2.5">
          <Radio className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="font-medium text-foreground">{PODCAST.name}</span>
          <span className="font-mono text-xs tracking-wider">{PODCAST.frequency}</span>
        </p>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2" aria-label="頁尾">
          {children}
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-foreground"
          >
            <Mail className="h-4 w-4" aria-hidden="true" /> 合作 / 投稿
          </a>
        </nav>
        <p className="text-[13px]">
          © {new Date().getFullYear()} {PODCAST.name} · emting.life
        </p>
      </div>
    </div>
  );
}
