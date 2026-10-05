import { useState, useMemo } from "react";
import { ArrowLeft, ExternalLink, Headphones, Radio } from "lucide-react";
import TopNav from "./TopNav";
import { Eyebrow } from "./primitives";
import { PODCAST } from "@/lib/enian/constants";

const spotifySearch = (q: string) =>
  `https://open.spotify.com/search/${encodeURIComponent(q)}/podcasts`;

type Rec = {
  name: string;
  hosts: string;
  category: string;
  why: string;
  bestFor: string;
  searchUrl: string;
};

const CATEGORIES = [
  "全部",
  "科技與資安觀察",
  "家庭與親子教養",
  "基督信仰與生活",
  "社會觀點與深度對話",
];

const RECOMMENDATIONS: Rec[] = [
  {
    name: "星箭廣播",
    hosts: "喬克與 Star Rocket 團隊",
    category: "科技與資安觀察",
    why: "如果你喜歡《E 人 I 碎念》把科技講成日常對話的語氣，星箭廣播會是很順的延伸。節目聊產品、創業、數位工具與網路文化，節奏輕鬆但資訊密度高，很適合通勤時順順聽。",
    bestFor: "對科技產品、創業與網路文化有興趣的聽眾",
    searchUrl: spotifySearch("星箭廣播"),
  },
  {
    name: "科技島讀",
    hosts: "周欽華",
    category: "科技與資安觀察",
    why: "周欽華用清楚的結構拆解科技產業趨勢，從商業模式到競爭格局都講得很有條理。適合想從「為什麼會這樣」角度理解科技新聞的人。",
    bestFor: "想從商業與策略角度理解科技趨勢的聽眾",
    searchUrl: spotifySearch("科技島讀"),
  },
  {
    name: "曼報",
    hosts: "曼報團隊",
    category: "科技與資安觀察",
    why: "這是資安新聞週報的的代表作之一，把駭客事件、漏洞通報與防護觀念講得清楚又不艱澀。和《E 人 I 碎念》的資安單元氣質最相近。",
    bestFor: "想穩定跟上資安動態、建立防護觀念的聽眾",
    searchUrl: spotifySearch("曼報"),
  },
  {
    name: "親子天下",
    hosts: "親子天下團隊",
    category: "家庭與親子教養",
    why: "教養議題覆蓋面很廣，從學齡前到青春期都有，訪談扎實、不給標準答案。適合在家庭、工作與自我之間找平衡的父母。",
    bestFor: "想找教養參考座標、理解孩子各階段需求的家長",
    searchUrl: spotifySearch("親子天下 Podcast"),
  },
  {
    name: "媽媽寶寶",
    hosts: "媽媽寶寶編輯部",
    category: "家庭與親子教養",
    why: "從孕期到學齡前的實用資訊為主，語氣溫暖、節奏明確。對新手爸媽來說，是快速補充育兒知識的入口。",
    bestFor: "準爸媽與 0-6 歲孩子的家長",
    searchUrl: spotifySearch("媽媽寶寶 Podcast"),
  },
  {
    name: "空中崇拜",
    hosts: "好消息電視台",
    category: "基督信仰與生活",
    why: "把主日崇拜與信息帶進耳機，適合無法固定到教會、或想在工作日補充靈糧的基督徒。信息完整，適合反覆聽。",
    bestFor: "想穩定靈修、聽信息的基督徒",
    searchUrl: spotifySearch("空中崇拜"),
  },
  {
    name: "恩典時刻",
    hosts: "好消息電視台",
    category: "基督信仰與生活",
    why: "以信仰生活對談為主，溫暖不說教。適合喜歡聽見證、生命故事，以及把信仰應用在日常選擇裡的聽眾。",
    bestFor: "喜歡見證與生活信仰對話的聽眾",
    searchUrl: spotifySearch("恩典時刻"),
  },
  {
    name: "百靈果 News",
    hosts: "凱莉、Ken",
    category: "社會觀點與深度對話",
    why: "國際新聞與社會議題為主，觀點鮮明、資訊量大。雖然語氣比《E 人 I 碎念》更辛辣，但同樣擅長把複雜事件講出脈絡。",
    bestFor: "想聽不同觀點、拓展國際視角的聽眾",
    searchUrl: spotifySearch("百靈果 News"),
  },
  {
    name: "台灣通勤第一品牌",
    hosts: "李毅誠等",
    category: "社會觀點與深度對話",
    why: "職場與生活觀察真實接地氣，像是一群朋友在車上聊天。適合通勤族或職場新鮮人，聽完會覺得「原來不是只有我這樣想」。",
    bestFor: "通勤族、職場新鮮人與生活觀察者",
    searchUrl: spotifySearch("台灣通勤第一品牌"),
  },
];

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
          <a href="/" className="inline-flex items-center gap-1 hover:text-accent-2">
            <ArrowLeft className="h-4 w-4" /> 回到首頁
          </a>
          <a
            href="mailto:contact@emting.life"
            className="inline-flex items-center gap-1 hover:text-accent-2"
          >
            合作 / 投稿
          </a>
        </div>
        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} {PODCAST.name} · emting.life
        </p>
      </div>
    </footer>
  );
}

export default function PodcastRecommendations() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const filtered = useMemo(
    () =>
      activeCategory === "全部"
        ? RECOMMENDATIONS
        : RECOMMENDATIONS.filter((r) => r.category === activeCategory),
    [activeCategory],
  );

  return (
    <>
      <TopNav />
      <main id="main" className="min-h-screen bg-background text-foreground">
        <section
          id="top"
          className="relative overflow-hidden border-b border-border bg-background px-6 pb-16 pt-10"
        >
          <div className="mx-auto max-w-5xl">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-accent-2 hover:text-accent-2"
            >
              <ArrowLeft className="h-4 w-4" />
              回到首頁
            </a>

            <Eyebrow className="mt-8">主持人私藏</Eyebrow>
            <h1 className="max-w-3xl text-4xl font-medium leading-[0.95] text-foreground sm:text-5xl lg:text-6xl">
              Podcast 推薦：
              <br className="hidden sm:block" />
              主持人私藏的下一個訂閱清單。
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              這不是演算法排行榜，而是 Emmanuel 根據《E 人 I
              碎念》的內容主軸——科技、資安、家庭、信仰、社會觀察——親自挑選的中文 Podcast
              清單。每則都附原創短評，幫你快速判斷哪一個節目最適合現在的你。
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-background px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="推薦分類">
              {CATEGORIES.map((cat) => {
                const active = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-foreground text-background"
                        : "border border-border bg-surface text-muted-foreground hover:border-accent-2 hover:text-accent-2"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((rec) => (
                <article
                  key={rec.name}
                  className="flex flex-col rounded-[1.5rem] border border-border bg-surface p-5 transition hover:border-accent-2"
                >
                  <span className="w-fit rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-2">
                    {rec.category}
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-foreground">{rec.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">主持人：{rec.hosts}</p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {rec.why}
                  </p>
                  <div className="mt-4 rounded-xl bg-background p-3">
                    <p className="text-[13px] font-medium text-muted-foreground">適合</p>
                    <p className="mt-1 text-sm text-foreground">{rec.bestFor}</p>
                  </div>
                  <a
                    href={rec.searchUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-event="click_podcast_rec"
                    data-podcast={rec.name}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-live hover:text-live"
                  >
                    在 Spotify 搜尋
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>E 人 I 碎念</Eyebrow>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              找到喜歡的節目後，也歡迎回來這裡。
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              《E 人 I
              碎念》每週一到週六更新，用白話又有梗的方式聊科技、資安、家庭、信仰與社會觀察。如果你從這份推薦清單找到共鳴，這裡大概也會是你的頻率。
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/#tune-in"
                data-event="click_cta_rec_page"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-base font-bold text-background transition hover:opacity-90"
              >
                <Headphones className="h-5 w-5" />
                訂閱 E 人 I 碎念
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-base font-semibold text-foreground transition hover:border-accent-2 hover:text-accent-2"
              >
                <ArrowLeft className="h-4 w-4" />
                回到首頁
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
