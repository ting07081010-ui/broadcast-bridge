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
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--studio-surface-2)] font-mono text-base font-bold text-[var(--neon-cyan)]"
      style={{ fontFamily: "var(--font-mono-display)" }}
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
      className="enian-scanlines enian-hero-glow relative overflow-hidden border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 pb-20 pt-10 sm:pt-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* Top status bar */}
        <div
          className="mb-10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-widest text-[var(--studio-text-muted)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-[var(--neon-cyan)]" />
            <span>{PODCAST.frequency}</span>
            <span className="mx-2 opacity-40">//</span>
            <span className="enian-pulse-dot inline-block h-2 w-2 rounded-full bg-[var(--neon-lime)]" />
            <span className="text-[var(--neon-lime)]">TRANSMISSION ACTIVE</span>
          </div>
          <span className="font-mono opacity-60" style={{ fontFamily: "var(--font-mono-display)" }}>
            EMTING.LIFE
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),360px] lg:items-end">
          <div className="max-w-3xl">
            <p
              className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
            >
              PODCAST // zh-TW // MON-SAT
            </p>
            <h1
              className="text-[3.6rem] font-medium leading-[0.92] text-[var(--studio-text)] sm:text-[4.75rem] lg:text-[6rem]"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.045em" }}
            >
              把科技、信仰與家庭，
              <br className="hidden sm:block" />
              聊成你每天都想打開的一集。
            </h1>
            <p className="mt-5 text-xl font-semibold text-[var(--studio-text)] sm:text-2xl">
              《{PODCAST.name}》由 {PODCAST.hostName} 主持，
              用白話又有梗的方式拆解科技、資安、家庭、信仰與社會觀察。
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--studio-text-muted)] sm:text-lg">
              如果你想在通勤、開車、做家事的空檔，聽到一個不裝懂、也不說教的中文 Podcast，
              這裡就是入口。每週一到週六更新，讓你每天都有一個值得打開的新主題。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={PRIMARY_CTA.href}
                data-event="click_cta_primary"
                data-location="hero"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--studio-text)] px-7 py-3.5 text-base font-bold text-[var(--studio-bg)] transition hover:scale-[1.02] hover:opacity-90"
              >
                <Headphones className="h-5 w-5" />
                {PRIMARY_CTA.label}
              </a>
              <a
                href={SECONDARY_CTA.href}
                data-event="click_cta_secondary"
                data-location="hero"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface)] px-6 py-3 text-base font-semibold text-[var(--studio-text)] transition hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)]"
              >
                <Play className="h-4 w-4" />
                {SECONDARY_CTA.label}
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {proofItems.map((item, idx) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-[var(--studio-border)] bg-[color-mix(in_oklab,var(--studio-surface)_88%,transparent)] p-4 text-sm leading-relaxed text-[var(--studio-text)]"
                >
                  <div
                    className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--studio-text-muted)]"
                    style={{ fontFamily: "var(--font-mono-display)" }}
                  >
                    0{idx + 1}
                  </div>
                  <p className="mt-2">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.75rem] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-3">
              <div className="rounded-[1.4rem] bg-[var(--studio-surface-2)] p-6 text-[var(--studio-text)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--studio-text-muted)]"
                      style={{ fontFamily: "var(--font-mono-display)" }}
                    >
                      HOSTED BY
                    </p>
                    <h2
                      className="mt-2 text-3xl font-medium leading-none"
                      style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}
                    >
                      {PODCAST.hostName}
                    </h2>
                  </div>
                  <img
                    src={PODCAST.avatarUrl}
                    alt={`${PODCAST.name} 主持人 ${PODCAST.hostName} 頭像`}
                    width={96}
                    height={96}
                    sizes="96px"
                    className="h-24 w-24 rounded-[1.5rem] border border-[var(--studio-border)] object-cover"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
                <p className="mt-6 max-w-xs text-sm leading-relaxed text-[var(--studio-text-muted)]">
                  {PODCAST.tagline}。把太複雜的議題，講成能在日常裡真正聽懂的內容。
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.75rem] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 text-[var(--studio-text)]">
                <p
                  className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--studio-text-muted)]"
                  style={{ fontFamily: "var(--font-mono-display)" }}
                >
                  WHY LISTEN
                </p>
                <p className="mt-10 max-w-[12rem] text-2xl font-semibold leading-tight">
                  通勤時段也能聽懂的中文深度內容。
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 text-[var(--studio-text)]">
                <p
                  className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--studio-text-muted)]"
                  style={{ fontFamily: "var(--font-mono-display)" }}
                >
                  THIS WEEK
                </p>
                <p className="mt-3 text-lg font-semibold leading-snug">
                  一週六天，一天一個固定節目單元。
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--studio-text-muted)]">
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
    <section
      id="who-for"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20"
    >
      <div className="mx-auto max-w-4xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-magenta)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          // AUDIENCE_MATCH
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
          這個節目適合誰？
        </h2>
        <p className="mt-3 text-[var(--studio-text-muted)]">
          5 秒自我辨識：如果以下任何一項打到你，這個頻道就是為你開的。
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {WHO_FOR.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 text-[var(--studio-text)]"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--neon-lime)]" />
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
    <section
      id="topics"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          // CONTENT_MODULES
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">四大內容主軸</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((t) => {
            const Icon = TOPIC_ICONS[t.code] ?? Shield;
            return (
              <div
                key={t.code}
                className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 transition hover:border-[var(--neon-cyan)] hover:shadow-[var(--shadow-neon-cyan)]"
              >
                <Icon className="h-7 w-7 text-[var(--neon-cyan)]" />
                <p
                  className="mt-3 font-mono text-xs tracking-widest text-[var(--studio-text-muted)]"
                  style={{ fontFamily: "var(--font-mono-display)" }}
                >
                  ▶ {t.code}
                </p>
                <h3 className="mt-1 text-lg font-bold text-[var(--studio-text)]">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--studio-text-muted)]">
                  {t.desc}
                </p>
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
    <section
      id="schedule"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-surface)] px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-amber)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          // BROADCAST_SCHEDULE
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">每週節目頻道</h2>
        <p className="mt-3 text-[var(--studio-text-muted)]">
          一週六天、每天一個固定單元，固定時段陪你度過。
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCHEDULE.map((s) => (
            <div
              key={s.day}
              className="rounded-lg border border-[var(--studio-border)] bg-[var(--studio-bg)] p-4"
            >
              <div className="flex items-baseline justify-between">
                <span
                  className="font-mono text-sm font-bold tracking-widest text-[var(--neon-cyan)]"
                  style={{ fontFamily: "var(--font-mono-display)" }}
                >
                  {s.day}
                </span>
                <span className="text-xs text-[var(--studio-text-muted)]">{s.topic}</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-[var(--studio-text)]">{s.unit}</h3>
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
    <section
      id="first-listen"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),280px] lg:items-start">
          <div>
            <p
              className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-magenta)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
            >
              // FIRST_TIME_HERE
            </p>
            <h2
              className="text-3xl font-medium text-[var(--studio-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              第一次來，這樣開始最快。
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--studio-text-muted)] sm:text-lg">
              不用先研究整個節目庫。先從最近三集裡挑一集試聽，感受主持節奏；喜歡的話，再往下選平台訂閱。
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--studio-text-muted)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
            >
              START HERE
            </p>
            <ol className="mt-4 space-y-3">
              {steps.map((step, idx) => (
                <li
                  key={step}
                  className="flex gap-3 text-sm leading-relaxed text-[var(--studio-text)]"
                >
                  <span
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--studio-surface-2)] font-mono text-[11px] text-[var(--studio-text-muted)]"
                    style={{ fontFamily: "var(--font-mono-display)" }}
                  >
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
                className="group flex flex-col rounded-[1.5rem] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 transition hover:border-[var(--neon-magenta)] hover:shadow-[var(--shadow-neon-magenta)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="font-mono text-xs tracking-widest text-[var(--neon-magenta)]"
                    style={{ fontFamily: "var(--font-mono-display)" }}
                  >
                    {label}
                  </span>
                  <span className="rounded-full border border-[var(--studio-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--studio-text-muted)]">
                    {idx === 0 ? "先從這集試" : "下一集入口"}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-[var(--studio-text)] group-hover:text-[var(--neon-cyan)]">
                  {ep.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--studio-text-muted)]">
                  {ep.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--neon-cyan)]">
                  收聽本集 <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </a>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-[var(--studio-border)] bg-[var(--studio-surface)] px-5 py-4">
          <p className="flex-1 text-sm leading-relaxed text-[var(--studio-text-muted)]">
            三集裡只要有一集讓你想聽完，就直接去選平台訂閱；之後每次更新，你就不用再回首頁找。
          </p>
          <a
            href="#tune-in"
            data-event="click_cta_after_first_listen"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--studio-text)] px-5 py-2.5 text-sm font-semibold text-[var(--studio-bg)] transition hover:opacity-90"
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
    <section
      id="latest-episodes"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-surface)] px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p
              className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-lime)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
            >
              // LATEST_EPISODES
            </p>
            <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">最新集數</h2>
          </div>
          {source === "fallback" && (
            <span
              className="font-mono text-xs text-[var(--studio-text-muted)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
            >
              // 暫顯示範例集數，待 RSS 設定
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
              className="group flex flex-col rounded-xl border border-[var(--studio-border)] bg-[var(--studio-bg)] p-5 transition hover:border-[var(--neon-cyan)] hover:shadow-[var(--shadow-neon-cyan)]"
            >
              <div
                className="flex items-center gap-3 font-mono text-xs text-[var(--studio-text-muted)]"
                style={{ fontFamily: "var(--font-mono-display)" }}
              >
                {ep.episodeNumber && (
                  <span className="text-[var(--neon-cyan)]">
                    EP{String(ep.episodeNumber).padStart(3, "0")}
                  </span>
                )}
                {ep.pubDate && <span>{formatDate(ep.pubDate)}</span>}
                {ep.durationSec && <span>{formatDuration(ep.durationSec)}</span>}
              </div>
              <h3 className="mt-2 text-lg font-bold leading-snug text-[var(--studio-text)] group-hover:text-[var(--neon-cyan)]">
                {ep.title}
              </h3>
              {ep.description && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--studio-text-muted)]">
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
    <section
      id="about-host"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20"
    >
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[auto,1fr] md:items-center">
        <img
          src={PODCAST.avatarUrl}
          alt={`${PODCAST.hostName} 主持人照`}
          width={160}
          height={160}
          sizes="160px"
          className="mx-auto h-40 w-40 rounded-2xl border-2 border-[var(--neon-magenta)] object-cover shadow-[var(--shadow-neon-magenta)] md:mx-0"
          loading="lazy"
          decoding="async"
        />
        <div>
          <p
            className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
            style={{ fontFamily: "var(--font-mono-display)" }}
          >
            // HOST_ANALYSIS
          </p>
          <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">關於主持人</h2>
          <p className="mt-2 text-lg font-semibold text-[var(--studio-text)]">
            {PODCAST.hostName} ／ TYPE: E 人 (Extravert)
          </p>
          <p className="mt-4 leading-relaxed text-[var(--studio-text-muted)]">
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
      className="enian-scanlines relative overflow-hidden border-b border-[var(--studio-border)] bg-[var(--studio-surface)] px-6 py-20"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-magenta)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          // MISSION_OBJECTIVE
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
          加入廣播基地，一起共建
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[var(--studio-text-muted)]">
          {MISSION.copy}
        </p>

        <a
          href="#tune-in"
          data-event="click_cta_mission"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--studio-text)] px-7 py-3.5 text-base font-bold text-[var(--studio-bg)] transition hover:opacity-90"
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
    <section
      id="tune-in"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20"
    >
      <div className="mx-auto max-w-4xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          // TUNE_IN_NOW
        </p>
        <h2
          className="text-3xl font-medium text-[var(--studio-text)] sm:text-4xl"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
        >
          選一個你真的會打開的收聽平台。
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--studio-text-muted)] sm:text-lg">
          不用每個都追。只要挑一個你每天最常打開的 app，按下訂閱，就能穩定收到每一集更新。
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {listeningPlatforms.map((platform) => (
            <div
              key={`${platform.key}-guide`}
              className="rounded-[1.5rem] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5"
            >
              <p
                className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--studio-text-muted)]"
                style={{ fontFamily: "var(--font-mono-display)" }}
              >
                {platformGuide[platform.key]?.tag ?? platform.name}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-[var(--studio-text)]">
                {platform.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--studio-text-muted)]">
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
              className="group flex items-center gap-4 rounded-[1.5rem] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--neon-cyan)] hover:shadow-[var(--shadow-neon-cyan)]"
            >
              <PlatformGlyph keyName={p.key} />
              <div className="flex-1">
                <div className="text-base font-bold text-[var(--studio-text)] group-hover:text-[var(--neon-cyan)]">
                  {p.name}
                </div>
                <div className="mt-1 text-xs text-[var(--studio-text-muted)]">{p.description}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-[var(--studio-text-muted)] group-hover:text-[var(--neon-cyan)]" />
            </a>
          ))}
        </div>

        <p className="mt-6 text-sm text-[var(--studio-text-muted)]">
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
    <footer className="bg-[var(--studio-bg)] px-6 py-12 text-[var(--studio-text-muted)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center text-sm">
        <div
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--studio-text-muted)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          <Radio className="h-3.5 w-3.5 text-[var(--neon-cyan)]" />
          <span>{PODCAST.frequency}</span>
          <span className="opacity-40">//</span>
          <span>{PODCAST.name}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a
            href="/podcast-recommendations"
            data-event="click_footer_recommendations"
            className="hover:text-[var(--neon-cyan)]"
          >
            Podcast 推薦
          </a>
          <a
            href="mailto:contact@emting.life"
            className="inline-flex items-center gap-1 hover:text-[var(--neon-cyan)]"
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
    <section
      id="youtube"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-amber)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          // LATEST_VIDEOS
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
          YouTube 最新影片
        </h2>
        <p className="mt-3 text-[var(--studio-text-muted)]">想看影片版？最新幾集都在這。</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noreferrer"
              data-event="click_youtube_video"
              data-video-id={v.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] transition hover:-translate-y-0.5 hover:border-[var(--neon-amber)]"
            >
              <div className="relative aspect-video overflow-hidden bg-[var(--studio-surface-2)]">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  width={480}
                  height={360}
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--neon-amber)] text-[var(--studio-bg)]">
                    <Play className="h-6 w-6 fill-current" />
                  </span>
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-[var(--studio-text)] group-hover:text-[var(--neon-amber)]">
                  {v.title}
                </h3>
                {v.publishedAt && (
                  <span
                    className="font-mono text-xs text-[var(--studio-text-muted)]"
                    style={{ fontFamily: "var(--font-mono-display)" }}
                  >
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
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--neon-amber)] px-6 py-3 text-base font-semibold text-[var(--neon-amber)] transition hover:bg-[var(--neon-amber)] hover:text-[var(--studio-bg)]"
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
    <section
      id="social"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-surface)] px-6 py-20"
    >
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),260px] lg:items-start">
          <div>
            <p
              className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-magenta)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
            >
              // SOCIAL_FOLLOW
            </p>
            <h2
              className="text-3xl font-medium text-[var(--studio-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              想看幕後與碎念，再追社群。
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--studio-text-muted)] sm:text-lg">
              社群這一區不是主收聽入口，而是節目外延伸：短想法、幕後花絮、影片片段和即時互動都在這裡。
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--studio-border)] bg-[var(--studio-bg)] p-5">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--studio-text-muted)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
            >
              GOOD TO KNOW
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--studio-text-muted)]">
              想完整收聽每一集，還是建議先到上方平台訂閱；社群比較適合追幕後內容與主持人的即時狀態。
            </p>
            <a
              href="#tune-in"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--studio-border)] bg-[var(--studio-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--studio-text)] transition hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)]"
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
              className="group flex items-start gap-4 rounded-[1.5rem] border border-[var(--studio-border)] bg-[var(--studio-bg)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--neon-magenta)] hover:shadow-[var(--shadow-neon-magenta)]"
            >
              <PlatformGlyph keyName={s.key} />
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-[var(--studio-text)] group-hover:text-[var(--neon-magenta)]">
                  {s.name}
                </div>
                <div
                  className="mt-1 truncate font-mono text-xs text-[var(--studio-text-muted)]"
                  style={{ fontFamily: "var(--font-mono-display)" }}
                >
                  {s.handle}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--studio-text-muted)]">
                  {socialNotes[s.key] ?? s.description}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-[var(--studio-text-muted)] group-hover:text-[var(--neon-magenta)]" />
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
      <main id="main" className="min-h-screen bg-[var(--studio-bg)] text-[var(--studio-text)]">
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
