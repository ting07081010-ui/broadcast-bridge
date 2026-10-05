import {
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
import TopNav from "./TopNav";
import { Eyebrow } from "./primitives";
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
function Hero() {
  const proofItems = [
    "週一到週六固定更新",
    "Spotify、Apple Podcasts、YouTube 同步上架",
    "科技、資安、家庭、信仰一次收聽",
  ];

  return (
    <section
      id="top"
      className="enian-hero-glow relative overflow-hidden border-b border-border bg-background px-6 pb-20 pt-10 sm:pt-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),360px] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-live">
                <span className="enian-pulse-dot inline-block h-2 w-2 rounded-full bg-live" />
                {PODCAST.frequency}
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span>中文 Podcast・週一到週六更新</span>
            </p>
            <h1 className="text-[3.6rem] font-medium leading-[0.92] text-foreground sm:text-[4.75rem] lg:text-[6rem]">
              把科技、信仰與家庭，
              <br className="hidden sm:block" />
              聊成你每天都想打開的一集。
            </h1>
            <p className="mt-5 text-xl font-semibold text-foreground sm:text-2xl">
              《{PODCAST.name}》由 {PODCAST.hostName} 主持，
              用白話又有梗的方式拆解科技、資安、家庭、信仰與社會觀察。
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              如果你想在通勤、開車、做家事的空檔，聽到一個不裝懂、也不說教的中文 Podcast，
              這裡就是入口。每週一到週六更新，讓你每天都有一個值得打開的新主題。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={PRIMARY_CTA.href}
                data-event="click_cta_primary"
                data-location="hero"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-7 py-3.5 text-base font-bold text-background transition hover:opacity-90"
              >
                <Headphones className="h-5 w-5" />
                {PRIMARY_CTA.label}
              </a>
              <a
                href={SECONDARY_CTA.href}
                data-event="click_cta_secondary"
                data-location="hero"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 text-base font-semibold text-foreground transition hover:border-accent-2 hover:text-accent-2"
              >
                <Play className="h-4 w-4" />
                {SECONDARY_CTA.label}
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {proofItems.map((item, idx) => (
                <div
                  key={item}
                  className="rounded-xl border border-border bg-surface/88 p-4 text-sm leading-relaxed text-foreground"
                >
                  <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    0{idx + 1}
                  </div>
                  <p className="mt-2">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl border border-border bg-surface p-3">
              <div className="rounded-xl bg-surface-2 p-6 text-foreground">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-muted-foreground">主持人</p>
                    <h2 className="mt-2 text-3xl font-medium leading-none">{PODCAST.hostName}</h2>
                  </div>
                  <img
                    src={PODCAST.avatarUrl}
                    alt={`${PODCAST.name} 主持人 ${PODCAST.hostName} 頭像`}
                    width={96}
                    height={96}
                    sizes="96px"
                    className="h-24 w-24 rounded-xl border border-border object-cover"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {PODCAST.tagline}。把太複雜的議題，講成能在日常裡真正聽懂的內容。
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-border bg-surface p-5 text-foreground">
                <p className="text-[13px] font-medium text-muted-foreground">為什麼聽</p>
                <p className="mt-10 max-w-[12rem] text-2xl font-semibold leading-tight">
                  通勤時段也能聽懂的中文深度內容。
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5 text-foreground">
                <p className="text-[13px] font-medium text-muted-foreground">每週節奏</p>
                <p className="mt-3 text-lg font-semibold leading-snug">
                  一週六天，一天一個固定節目單元。
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  想先試水溫，直接按「先聽三集推薦」；想穩定追更新，就直接選你常用的平台訂閱。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────── WHO FOR ───────────
function WhoFor() {
  return (
    <section id="who-for" className="border-b border-border bg-background px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <Eyebrow>聽眾</Eyebrow>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">這個節目適合誰？</h2>
        <p className="mt-3 text-muted-foreground">
          5 秒自我辨識：如果以下任何一項打到你，這個頻道就是為你開的。
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {WHO_FOR.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-foreground"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-live" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─────────── TOPICS ───────────
function Topics() {
  return (
    <section id="topics" className="border-b border-border bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <Eyebrow>內容主軸</Eyebrow>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">四大內容主軸</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((t) => {
            const Icon = TOPIC_ICONS[t.code] ?? Shield;
            return (
              <div
                key={t.code}
                className="rounded-xl border border-border bg-surface p-5 transition hover:border-accent-2"
              >
                <Icon className="h-7 w-7 text-accent-2" />
                <h3 className="mt-1 text-lg font-bold text-foreground">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
              </div>
            );
          })}
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

  const steps = [
    "先點一集試聽，確認你喜歡這個聊天節奏。",
    "喜歡再選一個你每天會打開的 app 訂閱。",
    "之後讓平台自動推新集，不用每次重新找。",
  ];

  return (
    <section id="first-listen" className="border-b border-border bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),280px] lg:items-start">
          <div>
            <Eyebrow>先聽一集</Eyebrow>
            <h2 className="text-3xl font-medium text-foreground sm:text-4xl">
              第一次來，這樣開始最快。
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">
              不用先研究整個節目庫。先從最近三集裡挑一集試聽，感受主持節奏；喜歡的話，再往下選平台訂閱。
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-[13px] font-medium text-muted-foreground">從這裡開始</p>
            <ol className="mt-4 space-y-3">
              {steps.map((step, idx) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-foreground">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-mono text-[11px] text-muted-foreground">
                    0{idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {picks.map((ep, idx) => {
            const label = ep.episodeNumber
              ? `EP${String(ep.episodeNumber).padStart(3, "0")}`
              : `EP${String(idx + 1).padStart(3, "0")}`;
            return (
              <a
                key={ep.id}
                href={ep.link || "#tune-in"}
                target={ep.link?.startsWith("http") ? "_blank" : undefined}
                rel={ep.link?.startsWith("http") ? "noopener noreferrer" : undefined}
                data-event="click_episode_card"
                data-ep={label}
                className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition hover:border-accent"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs tracking-widest text-accent">{label}</span>
                  <span className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {idx === 0 ? "先從這集試" : "下一集入口"}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-foreground group-hover:text-accent-2">
                  {ep.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {ep.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-2">
                  收聽本集 <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </a>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface px-5 py-4">
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
            三集裡只要有一集讓你想聽完，就直接去選平台訂閱；之後每次更新，你就不用再回首頁找。
          </p>
          <a
            href="#tune-in"
            data-event="click_cta_after_first_listen"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            下一步選平台
            <Headphones className="h-4 w-4" />
          </a>
        </div>
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
  if (!videos || videos.length === 0) return null;
  const channelUrl = PLATFORMS.find((p) => p.key === "youtube")?.url ?? "#";
  return (
    <section id="youtube" className="border-b border-border bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <Eyebrow>影片版</Eyebrow>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">YouTube 最新影片</h2>
        <p className="mt-3 text-muted-foreground">想看影片版？最新幾集都在這。</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noreferrer"
              data-event="click_youtube_video"
              data-video-id={v.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:border-accent"
            >
              <div className="relative aspect-video overflow-hidden bg-surface-2">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  width={480}
                  height={360}
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-full w-full object-cover transition"
                />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent text-background">
                    <Play className="h-6 w-6 fill-current" />
                  </span>
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-accent">
                  {v.title}
                </h3>
                {v.publishedAt && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDate(v.publishedAt)}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={channelUrl}
            target="_blank"
            rel="noreferrer"
            data-event="click_youtube_channel"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-accent px-6 py-3 text-base font-semibold text-accent transition hover:bg-accent hover:text-background"
          >
            前往 YouTube 頻道 <ExternalLink className="h-4 w-4" />
          </a>
        </div>
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
        <WhoFor />
        <Topics />
        <Schedule />
        <FirstListen episodes={episodes} />
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
