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
import type { Episode } from "@/server/episodes.functions";
import type { YouTubeVideo } from "@/server/youtube.functions";
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
  return (
    <section
      id="top"
      className="enian-scanlines relative overflow-hidden border-b border-[var(--studio-border)] px-6 pb-20 pt-10 sm:pt-16"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, color-mix(in oklab, var(--neon-magenta) 22%, transparent), transparent 55%), radial-gradient(circle at 90% 30%, color-mix(in oklab, var(--neon-cyan) 18%, transparent), transparent 50%), var(--studio-bg)",
      }}
    >
      <div className="mx-auto max-w-5xl">
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

        <div className="grid gap-10 md:grid-cols-[1fr,auto] md:items-center">
          <div>
            <p
              className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
              style={{ fontFamily: "var(--font-mono-display)" }}
            >
              PODCAST // 中文 / Weekly
            </p>
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-[var(--studio-text)] sm:text-6xl md:text-7xl">
              {PODCAST.name}
            </h1>
            <p className="mt-5 text-xl font-medium text-[var(--studio-text)] sm:text-2xl">
              {PODCAST.tagline}
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--studio-text-muted)]">
              用輕鬆幽默的方式，聊科技、資安、家庭、信仰與社會觀察。
              週一到週六，每天一個新面向，陪你把生活中的小事，拆成值得思考的大事。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={PRIMARY_CTA.href}
                data-event="click_cta_primary"
                data-location="hero"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--neon-cyan)] px-7 py-3.5 text-base font-bold text-[var(--studio-bg)] shadow-[var(--shadow-neon-cyan)] transition hover:scale-[1.02] hover:brightness-110"
              >
                <Headphones className="h-5 w-5" />
                {PRIMARY_CTA.label}
              </a>
              <a
                href={SECONDARY_CTA.href}
                data-event="click_cta_secondary"
                data-location="hero"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--neon-magenta)] px-6 py-3 text-base font-semibold text-[var(--neon-magenta)] transition hover:bg-[var(--neon-magenta)] hover:text-[var(--studio-bg)]"
              >
                <Play className="h-4 w-4" />
                {SECONDARY_CTA.label}
              </a>
            </div>
          </div>

          <div className="relative mx-auto md:mx-0">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 rounded-full blur-2xl"
              style={{ background: "var(--gradient-neon)", opacity: 0.5 }}
            />
            <img
              src={PODCAST.avatarUrl}
              alt={`${PODCAST.name} 主持人 ${PODCAST.hostName} 頭像`}
              className="h-44 w-44 rounded-full border-4 border-[var(--neon-cyan)] object-cover shadow-[var(--shadow-neon-cyan)] sm:h-52 sm:w-52"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────── WHO FOR ───────────
function WhoFor() {
  return (
    <section id="who-for" className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20">
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
    <section id="topics" className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          // CONTENT_MODULES
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
          四大內容主軸
        </h2>
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
                <h3 className="mt-1 text-lg font-bold text-[var(--studio-text)]">
                  {t.title}
                </h3>
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
    <section id="schedule" className="border-b border-[var(--studio-border)] bg-[var(--studio-surface)] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-amber)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          // BROADCAST_SCHEDULE
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
          每週節目頻道
        </h2>
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
  return (
    <section id="first-listen" className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-magenta)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
        >
          // FIRST_TIME_HERE
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
          第一次來，先聽這幾集
        </h2>
        <p className="mt-3 text-[var(--studio-text-muted)]">
          不知道從哪集開始？這幾集最能快速認識節目調性。
        </p>
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
                className="group flex flex-col rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-5 transition hover:border-[var(--neon-magenta)] hover:shadow-[var(--shadow-neon-magenta)]"
              >
                <span
                  className="font-mono text-xs tracking-widest text-[var(--neon-magenta)]"
                  style={{ fontFamily: "var(--font-mono-display)" }}
                >
                  {label}
                </span>
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
            <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
              最新集數
            </h2>
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
    <section id="about-host" className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[auto,1fr] md:items-center">
        <img
          src={PODCAST.avatarUrl}
          alt={`${PODCAST.hostName} 主持人照`}
          className="mx-auto h-40 w-40 rounded-2xl border-2 border-[var(--neon-magenta)] object-cover shadow-[var(--shadow-neon-magenta)] md:mx-0"
          loading="lazy"
        />
        <div>
          <p
            className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]"
            style={{ fontFamily: "var(--font-mono-display)" }}
          >
            // HOST_ANALYSIS
          </p>
          <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
            關於主持人
          </h2>
          <p className="mt-2 text-lg font-semibold text-[var(--studio-text)]">
            {PODCAST.hostName} ／ TYPE: E 人 (Extravert)
          </p>
          <p className="mt-4 leading-relaxed text-[var(--studio-text-muted)]">
            雖然外表看起來有點宅宅的，但內心充滿了 E 人能量。喜歡碎碎念，是因為腦袋運轉太快——如果不說出來會過熱。
            「I 碎念」是為了釋放 E 能量。日常涉獵資安、AI、家庭、信仰與社會時事，把生活中的小事拆成值得思考的大事。
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────── MISSION ───────────
function Mission() {
  return (
    <section id="mission" className="enian-scanlines relative overflow-hidden border-b border-[var(--studio-border)] px-6 py-20"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--neon-magenta) 25%, transparent), transparent 60%), var(--studio-surface)",
      }}
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
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--neon-magenta)] px-7 py-3.5 text-base font-bold text-[var(--studio-bg)] shadow-[var(--shadow-neon-magenta)] transition hover:scale-[1.02]"
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
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
          選擇你的收聽平台
        </h2>
        <p className="mt-3 text-[var(--studio-text-muted)]">
          挑你常用的一個，按下訂閱／追蹤，就能每集自動收到。
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PLATFORMS.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target={p.url.startsWith("http") ? "_blank" : undefined}
              rel={p.url.startsWith("http") ? "noreferrer" : undefined}
              data-event="click_platform"
              data-platform={p.key}
              aria-label={`${p.description}（${p.name}）`}
              className="group flex items-center gap-4 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--neon-cyan)] hover:shadow-[var(--shadow-neon-cyan)]"
            >
              <PlatformGlyph keyName={p.key} />
              <div className="flex-1">
                <div className="text-base font-bold text-[var(--studio-text)] group-hover:text-[var(--neon-cyan)]">
                  {p.name}
                </div>
                <div className="text-xs text-[var(--studio-text-muted)]">{p.description}</div>
              </div>
              <ExternalLink className="h-4 w-4 text-[var(--studio-text-muted)] group-hover:text-[var(--neon-cyan)]" />
            </a>
          ))}
        </div>
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

// ─────────── PAGE ───────────
export default function EnianLanding({
  episodes,
  source,
}: {
  episodes: Episode[];
  source: string;
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
        <Faq />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
