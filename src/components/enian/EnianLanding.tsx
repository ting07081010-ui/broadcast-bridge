import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Headphones,
  Play,
  Radio,
  Shield,
  Home as HomeIcon,
  HeartHandshake,
  Newspaper,
  CheckCircle2,
  Mail,
  ExternalLink,
} from "lucide-react";
import {
  PODCAST,
  PLATFORMS,
  PRIMARY_CTA,
  SECONDARY_CTA,
  WHO_FOR,
  TOPICS,
  SCHEDULE,
  MISSION,
  SOCIAL_LINKS,
  type PlatformKey,
} from "@/lib/enian/constants";
import type { Episode } from "@/lib/enian/episodes.functions";
import type { YouTubeVideo } from "@/lib/enian/youtube.functions";
import { dedupeVideos, stripHashtags } from "@/lib/enian/videos";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  CONTAINER,
  SCROLL_ROW,
  SCROLL_ROW_ITEM,
  SECTION_Y,
  TEXT_LINK,
} from "@/lib/enian/ui";
import { cn } from "@/lib/utils";
import TopNav from "./TopNav";
import { Eyebrow, PlatformIcon, SectionHeader } from "./primitives";
import Faq from "./Faq";
import Contact from "./Contact";

const TOPIC_ICONS: Record<string, typeof Shield> = {
  INFOSEC: Shield,
  FAMILY: HomeIcon,
  FAITH: HeartHandshake,
  SOCIAL: Newspaper,
};

function formatDate(input: string): string {
  if (!input) return "";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatDuration(sec?: number): string {
  if (!sec) return "";
  const m = Math.round(sec / 60);
  return `${m} 分鐘`;
}

function PlatformGlyph({ keyName }: { keyName: PlatformKey }) {
  // 簡單字母 / icon 標識，不依賴外部 brand SVG
  const map: Record<PlatformKey, string> = {
    spotify: "S",
    apple: "",
    youtube: "▶",
    facebook: "f",
    instagram: "IG",
    threads: "@",
  };
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-mono text-base font-bold text-accent-2"
    >
      {map[keyName] || "•"}
    </span>
  );
}

// ─────────── HERO ───────────
const DIAL_MIN_MHZ = 88;
const DIAL_MAX_MHZ = 108;
const DIAL_LABELS = [88, 92, 96, 100, 104, 108];

/** FM 調頻刻度：指針停在節目頻率上（純裝飾，取代原本的彩色光暈）。 */
function TunerDial() {
  const station = Number.parseFloat(PODCAST.frequency.replace(/[^\d.]/g, "")) || 92.1;
  const x = (mhz: number) => 10 + ((mhz - DIAL_MIN_MHZ) / (DIAL_MAX_MHZ - DIAL_MIN_MHZ)) * 280;
  const ticks = Array.from(
    { length: (DIAL_MAX_MHZ - DIAL_MIN_MHZ) * 2 + 1 },
    (_, i) => DIAL_MIN_MHZ + i / 2,
  );
  return (
    <svg viewBox="0 0 300 46" className="mt-5 w-full" aria-hidden="true">
      {ticks.map((mhz) => {
        const isLabelled = mhz % 4 === 0;
        const isWhole = Number.isInteger(mhz);
        return (
          <line
            key={mhz}
            x1={x(mhz)}
            x2={x(mhz)}
            y1={isLabelled ? 8 : isWhole ? 15 : 19}
            y2={26}
            strokeWidth={1}
            className={isLabelled ? "stroke-muted-foreground" : "stroke-border"}
          />
        );
      })}
      {DIAL_LABELS.map((mhz) => (
        <text
          key={mhz}
          x={x(mhz)}
          y={42}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[9px]"
        >
          {mhz}
        </text>
      ))}
      <line
        x1={x(station)}
        x2={x(station)}
        y1={3}
        y2={30}
        strokeWidth={2}
        strokeLinecap="round"
        className="stroke-accent"
      />
    </svg>
  );
}

function Hero() {
  const proofItems = [
    "週一到週六固定更新",
    "Spotify、Apple Podcasts、YouTube 同步上架",
    "科技、資安、家庭、信仰一次收聽",
  ];

  return (
    <section id="top" className="enian-hero-glow border-b border-border">
      <div
        className={cn(
          CONTAINER,
          "grid gap-10 pb-12 pt-8 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-14 lg:pb-20 lg:pt-20",
        )}
      >
        <div>
          <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-live">
              <span className="enian-pulse-dot inline-block h-2 w-2 rounded-full bg-live" />
              {PODCAST.frequency}
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <span>中文 Podcast・週一到週六更新</span>
          </p>
          <h1 className="text-[34px] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[44px] xl:text-[52px]">
            把科技、信仰與家庭，
            <br className="hidden sm:block" />
            聊成你每天都想打開的一集。
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-foreground sm:text-lg sm:leading-relaxed">
            《{PODCAST.name}》由 {PODCAST.hostName} 主持，
            用白話又有梗的方式拆解科技、資安、家庭、信仰與社會觀察。
          </p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base sm:leading-relaxed">
            通勤、開車、做家事的空檔，聽一個不裝懂、也不說教的中文 Podcast。
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={PRIMARY_CTA.href}
              data-event="click_cta_primary"
              data-location="hero"
              className={BTN_PRIMARY}
            >
              <Headphones className="h-4 w-4" aria-hidden="true" />
              {PRIMARY_CTA.label}
            </a>
            <a
              href={SECONDARY_CTA.href}
              data-event="click_cta_secondary"
              data-location="hero"
              className={BTN_SECONDARY}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {SECONDARY_CTA.label}
            </a>
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-5">
            <img
              src={PODCAST.avatarUrl}
              alt={`${PODCAST.name} 主持人 ${PODCAST.hostName} 頭像`}
              width={112}
              height={112}
              sizes="(min-width: 1024px) 112px, 64px"
              className="h-16 w-16 rounded-xl border border-border object-cover lg:h-28 lg:w-28"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">主持人</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {PODCAST.hostName}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            {PODCAST.tagline}。把太複雜的議題，講成能在日常裡真正聽懂的內容。
          </p>
          <TunerDial />
        </aside>
      </div>

      {/* 信任條：三個文字事實，不再用大卡 */}
      <div className={CONTAINER}>
        <ul className="grid gap-x-8 gap-y-2.5 border-t border-border py-5 text-sm text-muted-foreground sm:grid-cols-3">
          {proofItems.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─────────── WHO FOR ＋ TOPICS ───────────
function WhoFor() {
  return (
    <section id="who-for" className="border-b border-border">
      <div className={cn(CONTAINER, SECTION_Y, "grid gap-12 lg:grid-cols-2 lg:gap-16")}>
        <div>
          <SectionHeader
            eyebrow="聽眾"
            title="這個節目適合誰？"
            lead="以下任何一項打到你，這個頻道就是為你開的。"
          />
          <ul className="mt-7 divide-y divide-border border-y border-border">
            {WHO_FOR.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 py-3.5 text-[15px] leading-relaxed text-foreground sm:text-base"
              >
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 保留 #topics 錨點：外部可能已分享連結 */}
        <div id="topics">
          <Eyebrow>內容主軸</Eyebrow>
          <h3 className="text-[22px] font-semibold leading-[1.3] tracking-tight text-foreground sm:text-2xl">
            四大內容主軸
          </h3>
          <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
            {TOPICS.map((t) => {
              const Icon = TOPIC_ICONS[t.code] ?? Shield;
              return (
                <li key={t.code} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                  <Icon className="h-5 w-5 text-accent-2" aria-hidden="true" />
                  <h4 className="mt-3 text-base font-semibold text-foreground sm:text-[17px]">
                    {t.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─────────── SCHEDULE ───────────
function Schedule() {
  return (
    <section id="schedule" className="border-b border-border bg-surface px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <Eyebrow>節目單</Eyebrow>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">每週節目頻道</h2>
        <p className="mt-3 text-muted-foreground">一週六天、每天一個固定單元，固定時段陪你度過。</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCHEDULE.map((s) => (
            <div key={s.day} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-sm font-bold tracking-widest text-accent-2">
                  {s.day}
                </span>
                <span className="text-xs text-muted-foreground">{s.topic}</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-foreground">{s.unit}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────── FIRST LISTEN ───────────
function FirstListen({ episodes }: { episodes: Episode[] }) {
  const picks = episodes.slice(0, 3);
  if (picks.length === 0) return null;

  return (
    <section id="first-listen" className="border-b border-border bg-surface">
      <div className={cn(CONTAINER, SECTION_Y)}>
        <SectionHeader
          eyebrow="先聽一集"
          title="第一次來，這樣開始最快。"
          lead="先從最近三集裡挑一集試聽，感受主持節奏；喜歡的話，再往下選平台訂閱。"
        />

        <ol className={cn(SCROLL_ROW, "mt-8")}>
          {picks.map((ep, idx) => {
            const label = ep.episodeNumber
              ? `EP${String(ep.episodeNumber).padStart(3, "0")}`
              : `EP${String(idx + 1).padStart(3, "0")}`;
            const isExternal = ep.link?.startsWith("http");
            const duration = formatDuration(ep.durationSec);
            return (
              <li key={ep.id} className={SCROLL_ROW_ITEM}>
                <a
                  href={ep.link || "#tune-in"}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  data-event="click_episode_card"
                  data-ep={label}
                  className="group flex h-full flex-col rounded-xl border border-border bg-background p-5 transition-colors duration-200 hover:border-accent"
                >
                  <div className="flex min-h-7 items-center justify-between gap-3 text-[13px]">
                    <span className="font-semibold tabular-nums text-accent">{label}</span>
                    {idx === 0 && (
                      <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground">
                        先從這集試
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 line-clamp-3 flex-1 text-[17px] font-semibold leading-[1.45] text-foreground">
                    {ep.title}
                  </h3>
                  <span className="mt-5 flex items-center gap-3 text-sm font-semibold text-foreground">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-background">
                      <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    </span>
                    收聽
                    {duration && (
                      <span className="font-normal tabular-nums text-muted-foreground">
                        {duration}
                      </span>
                    )}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-muted-foreground">
          <span>有一集讓你想聽完，就直接去選平台訂閱。</span>
          <a href="#tune-in" data-event="click_cta_after_first_listen" className={TEXT_LINK}>
            下一步選平台
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  );
}

// ─────────── EPISODES (RSS) ───────────
function Episodes({ episodes, source }: { episodes: Episode[]; source: string }) {
  return (
    <section id="latest-episodes" className="border-b border-border bg-surface px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>集數</Eyebrow>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">最新集數</h2>
          </div>
          {source === "fallback" && (
            <span className="font-mono text-xs text-muted-foreground">
              暫顯示範例集數，待 RSS 設定
            </span>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {episodes.map((ep) => (
            <a
              key={ep.id}
              href={ep.link || "#tune-in"}
              target={ep.link?.startsWith("http") ? "_blank" : undefined}
              rel={ep.link?.startsWith("http") ? "noreferrer" : undefined}
              data-event="click_episode_card"
              className="group flex flex-col rounded-xl border border-border bg-background p-5 transition hover:border-accent-2"
            >
              <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                {ep.episodeNumber && (
                  <span className="text-accent-2">
                    EP{String(ep.episodeNumber).padStart(3, "0")}
                  </span>
                )}
                {ep.pubDate && <span>{formatDate(ep.pubDate)}</span>}
                {ep.durationSec && <span>{formatDuration(ep.durationSec)}</span>}
              </div>
              <h3 className="mt-2 text-lg font-bold leading-snug text-foreground group-hover:text-accent-2">
                {ep.title}
              </h3>
              {ep.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {ep.description}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────── ABOUT HOST ───────────
function AboutHost() {
  return (
    <section id="about-host" className="border-b border-border bg-background px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[auto,1fr] md:items-center">
        <img
          src={PODCAST.avatarUrl}
          alt={`${PODCAST.hostName} 主持人照`}
          width={160}
          height={160}
          sizes="160px"
          className="mx-auto h-40 w-40 rounded-2xl border-2 border-accent object-cover md:mx-0"
          loading="lazy"
          decoding="async"
        />
        <div>
          <Eyebrow>主持人</Eyebrow>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">關於主持人</h2>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {PODCAST.hostName} ／ TYPE: E 人 (Extravert)
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            雖然外表看起來有點宅宅的，但內心充滿了 E
            人能量。喜歡碎碎念，是因為腦袋運轉太快——如果不說出來會過熱。 「I 碎念」是為了釋放 E
            能量。日常涉獵資安、AI、家庭、信仰與社會時事，把生活中的小事拆成值得思考的大事。
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────── MISSION ───────────
function Mission() {
  return (
    <section
      id="mission"
      className="relative overflow-hidden border-b border-border bg-surface px-6 py-20"
    >
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>廣播基地</Eyebrow>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">加入廣播基地，一起共建</h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{MISSION.copy}</p>

        <a
          href="#tune-in"
          data-event="click_cta_mission"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground px-7 py-3.5 text-base font-bold text-background transition hover:opacity-90"
        >
          <Headphones className="h-5 w-5" />
          加入廣播基地
        </a>
      </div>
    </section>
  );
}

// ─────────── TUNE IN ───────────
function TuneIn() {
  const listeningPlatforms = PLATFORMS.filter((platform) =>
    ["spotify", "apple", "youtube"].includes(platform.key),
  );

  const platformGuide: Record<string, { tag: string; copy: string }> = {
    spotify: {
      tag: "通勤最順手",
      copy: "如果你大多是在走路、開車、運動時收聽，Spotify 通常是最直接的入口。",
    },
    apple: {
      tag: "Apple 生態最省事",
      copy: "iPhone、AirPods、CarPlay 使用者，選 Apple Podcasts 會最無痛。",
    },
    youtube: {
      tag: "想看影片就選這個",
      copy: "如果你想順便看到主持人畫面或把節目當長影片播放，直接走 YouTube。",
    },
  };

  return (
    <section id="tune-in" className="border-b border-border bg-background px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <Eyebrow>訂閱</Eyebrow>
        <h2 className="text-3xl font-medium text-foreground sm:text-4xl">
          選一個你真的會打開的收聽平台。
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">
          不用每個都追。只要挑一個你每天最常打開的 app，按下訂閱，就能穩定收到每一集更新。
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {listeningPlatforms.map((platform) => (
            <div
              key={`${platform.key}-guide`}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                {platformGuide[platform.key]?.tag ?? platform.name}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{platform.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {platformGuide[platform.key]?.copy ?? platform.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listeningPlatforms.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target={p.url.startsWith("http") ? "_blank" : undefined}
              rel={p.url.startsWith("http") ? "noreferrer" : undefined}
              data-event="click_platform"
              data-platform={p.key}
              aria-label={`${p.description}（${p.name}）`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition hover:border-accent-2"
            >
              <PlatformGlyph keyName={p.key} />
              <div className="flex-1">
                <div className="text-base font-bold text-foreground group-hover:text-accent-2">
                  {p.name}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{p.description}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent-2" />
            </a>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Facebook、Instagram、Threads
          這類社群入口我保留在下方社群區塊；這裡只放真正拿來收聽的三個平台，讓你更快做決定。
        </p>
      </div>
    </section>
  );
}

// ─────────── FOOTER ───────────
function Footer() {
  return (
    <footer className="bg-background px-6 py-12 text-muted-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center text-sm">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Radio className="h-3.5 w-3.5 text-accent-2" />
          <span>{PODCAST.frequency}</span>
          <span aria-hidden="true" className="opacity-40">
            ·
          </span>
          <span>{PODCAST.name}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a
            href="/podcast-recommendations"
            data-event="click_footer_recommendations"
            className="hover:text-accent-2"
          >
            Podcast 推薦
          </a>
          <a
            href="mailto:contact@emting.life"
            className="inline-flex items-center gap-1 hover:text-accent-2"
          >
            <Mail className="h-4 w-4" /> 合作 / 投稿
          </a>
        </div>
        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} {PODCAST.name} · emting.life
        </p>
      </div>
    </footer>
  );
}

// ─────────── YOUTUBE LATEST ───────────
function YouTubeLatest({ videos }: { videos: YouTubeVideo[] }) {
  // 同一集的雙影片只留一支，最多 3 支
  const picks = dedupeVideos(videos ?? [], 3);
  if (picks.length === 0) return null;
  const channelUrl = PLATFORMS.find((p) => p.key === "youtube")?.url ?? "#";
  return (
    <section id="youtube" className="border-b border-border">
      <div className={cn(CONTAINER, SECTION_Y)}>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <SectionHeader
            eyebrow="影片版"
            title="YouTube 最新影片"
            lead="想看影片版？最新幾集都在這。"
          />
          <a
            href={channelUrl}
            target="_blank"
            rel="noreferrer"
            data-event="click_youtube_channel"
            className={BTN_SECONDARY}
          >
            前往 YouTube 頻道 <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <ul className={cn(SCROLL_ROW, "mt-8")}>
          {picks.map((v) => {
            const title = stripHashtags(v.title);
            return (
              <li key={v.id} className={SCROLL_ROW_ITEM}>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noreferrer"
                  data-event="click_youtube_video"
                  data-video-id={v.id}
                  className="group block"
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-surface-2">
                    <img
                      src={v.thumbnail}
                      alt={title}
                      width={480}
                      height={360}
                      sizes="(min-width: 768px) 360px, 80vw"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-lg bg-background/85 text-foreground transition-colors duration-200 group-hover:bg-accent group-hover:text-background">
                      <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-base font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-accent">
                    {title}
                  </h3>
                  {v.publishedAt && (
                    <span className="mt-1.5 block text-[13px] tabular-nums text-muted-foreground">
                      {formatDate(v.publishedAt)}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ─────────── SOCIAL FOLLOW ───────────
function SocialFollow() {
  const socialNotes: Record<string, string> = {
    threads: "看主持人的短想法與即時碎念",
    instagram: "看節目花絮、生活片段與限時互動",
    facebook: "看公告、較完整的貼文與社群討論",
    youtube: "看影片版與可分享的長內容",
  };

  return (
    <section id="social" className="border-b border-border bg-surface px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),260px] lg:items-start">
          <div>
            <Eyebrow>社群</Eyebrow>
            <h2 className="text-3xl font-medium text-foreground sm:text-4xl">
              想看幕後與碎念，再追社群。
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">
              社群這一區不是主收聽入口，而是節目外延伸：短想法、幕後花絮、影片片段和即時互動都在這裡。
            </p>
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <p className="text-[13px] font-medium text-muted-foreground">小提醒</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              想完整收聽每一集，還是建議先到上方平台訂閱；社群比較適合追幕後內容與主持人的即時狀態。
            </p>
            <a
              href="#tune-in"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-accent-2 hover:text-accent-2"
            >
              <Headphones className="h-4 w-4" />
              回到收聽平台
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.key}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              data-event="click_social"
              data-platform={s.key}
              aria-label={`在 ${s.name} 追蹤 ${s.handle}`}
              className="group flex items-start gap-4 rounded-xl border border-border bg-background p-5 transition hover:border-accent"
            >
              <PlatformGlyph keyName={s.key} />
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-foreground group-hover:text-accent">
                  {s.name}
                </div>
                <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                  {s.handle}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {socialNotes[s.key] ?? s.description}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-accent" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────── PAGE ───────────
export default function EnianLanding({
  episodes,
  source,
  videos,
}: {
  episodes: Episode[];
  source: string;
  videos: YouTubeVideo[];
}) {
  return (
    <>
      <TopNav />
      <main id="main" className="min-h-screen bg-background text-foreground">
        <Hero />
        <FirstListen episodes={episodes} />
        <WhoFor />
        <Schedule />
        <Episodes episodes={episodes} source={source} />
        <AboutHost />
        <Mission />
        <TuneIn />
        <YouTubeLatest videos={videos} />
        <SocialFollow />
        <Faq />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
