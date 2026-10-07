// 測試稿（fixtures）：只在開發模式載入，用來打磨版面與驗證各種內容狀態。
// 這裡的標題、內文、集數關聯全部是虛構的測試內容，不是真實發文。
// 絕對不可以從正式程式路徑靜態 import 這個檔案（見 posts.functions.ts）。

import type { Block, Inline, ListItem, Post } from "@/lib/blog/types";
import sleepWeekChart from "./sleep-week.svg";

const t = (text: string): Inline[] => [{ text }];
const p = (...inlines: (string | Inline)[]): Block => ({
  type: "paragraph",
  inlines: inlines.map((i) => (typeof i === "string" ? { text: i } : i)),
});
const h2 = (id: string, text: string): Block => ({
  type: "heading",
  level: 2,
  id,
  inlines: t(text),
});
const h3 = (id: string, text: string): Block => ({
  type: "heading",
  level: 3,
  id,
  inlines: t(text),
});
const li = (text: string, children?: ListItem[], ordered = false): ListItem => ({
  inlines: t(text),
  ...(children ? { children: [{ type: "list", ordered, items: children }] } : {}),
});
const at = (date: string, time = "06:30") => `${date}T${time}:00+08:00`;

const LONG_POST: Post = {
  id: "fixture-long",
  title:
    "睡不好的那一週，我才發現身體一直在替我記帳：關於節奏、咖啡因、深夜的手機，還有一個工程師遲來的認輸",
  slug: "shuimian-yu-jiezou",
  date: "2026-10-05",
  topic: "body",
  status: "Published",
  publishedAt: at("2026-10-05"),
  updatedAt: at("2026-10-05", "09:10"),
  excerpt:
    "（測試稿）連續三天只睡四個多小時之後，我做了一件工程師最不想做的事：承認這不是意志力的問題，是系統設計的問題。這篇記下那一週我怎麼把睡眠當成一個要除錯的系統。",
  blocks: [
    p(
      "這是一篇測試稿，用來檢查長文在紙感閱讀層的排版：長標題、引文、經文、圖片、表格、程式碼與三層清單都會出現。內容是虛構的，請不要當成真實的健康建議。",
    ),
    p(
      "那一週的開頭很普通。週一晚上有個上線，週二補文件，週三臨時被拉去救另一個專案。等我回過神來，已經連續三天在凌晨兩點後才躺下，而且每一次都告訴自己：",
      { text: "明天就會補回來。", bold: true },
    ),
    p(
      "結果當然沒有。週四早上我在捷運上站著睡著，手機掉在地上，螢幕裂了一條線。那條裂痕後來成了我的提醒：",
      { text: "身體不會跟你吵架，它只會默默記帳，然後在你最沒空的時候來收。", italic: true },
    ),
    h2("h-debug", "把睡眠當成一個要除錯的系統"),
    p(
      "工程師的直覺是先看 log。我翻了手機裡的螢幕使用時間，發現問題不在「睡不著」，而在「不去睡」：每天晚上十一點到一點之間，我平均又滑了九十分鐘。這段時間沒有產出，也沒有真的休息。",
    ),
    {
      type: "image",
      src: sleepWeekChart,
      alt: "長條圖：週一到週日的睡眠時數依序為 5、4.5、4、5.5、6、7.25、7.5 小時，前五天都低於 7 小時的虛線。",
      caption: "那一週的睡眠時數。週三是最低點，週六開始才回到七小時以上。",
      width: 720,
      height: 360,
    },
    p("我把觀察到的事整理成三類，從最容易改的開始："),
    {
      type: "list",
      ordered: true,
      items: [
        li(
          "輸入：下午之後進到身體裡的東西",
          [
            li("咖啡因", [li("下午兩點後不再喝咖啡"), li("手搖改無糖茶，而且只喝半杯")]),
            li("晚餐時間往前挪到七點以前"),
          ],
          false,
        ),
        li("環境：臥室裡會發光、會響的東西", [
          li("手機充電座移到客廳"),
          li("床頭只留一盞暖色小燈"),
        ]),
        li("節奏：每天固定的收工訊號", [li("十點半設一個「關機」鬧鐘，響了就離開螢幕")]),
      ],
    },
    h3("h-caffeine", "咖啡因比我以為的更晚下班"),
    p(
      "我原本以為下午四點那杯拿鐵早就代謝完了。查了資料才知道咖啡因的半衰期因人而異，有些人到了半夜體內還剩不少。相關的整理可以看這份很長的參考連結：",
      {
        text: "https://example.com/research/sleep/caffeine-half-life-and-individual-differences?utm_source=fixture&ref=very-long-url-for-wrapping-test",
        href: "https://example.com/research/sleep/caffeine-half-life-and-individual-differences?utm_source=fixture&ref=very-long-url-for-wrapping-test",
      },
      "。",
    ),
    {
      type: "table",
      caption: "那一週我實際做的調整（測試資料）",
      hasHeader: true,
      rows: [
        [t("項目"), t("調整前"), t("調整後"), t("難度")],
        [t("最後一杯咖啡"), t("16:00"), t("13:30"), t("低")],
        [t("手機離手時間"), t("睡著為止"), t("22:30 放到客廳"), t("高")],
        [t("上床時間"), t("01:40 上下"), t("23:15 上下"), t("中")],
        [t("起床後第一件事"), t("看訊息"), t("拉開窗簾、喝一杯水"), t("低")],
      ],
    },
    h2("h-automation", "用自動化擋住半夜的自己"),
    p(
      "意志力在晚上十一點最不可靠，所以我把決定提前交給排程。手機用內建的專注模式，電腦則是一段很短的設定，時間到了就把通知關掉。行內程式碼像 ",
      { text: "launchctl", code: true },
      " 會長這樣，完整設定如下：",
    ),
    {
      type: "code",
      language: "bash",
      caption: "每天 22:30 開啟勿擾模式的排程（測試用，非完整設定）",
      code: '#!/bin/zsh\n# 每天 22:30 執行：關閉通知，並把螢幕色溫調暖\nshortcuts run "Wind Down" --input-path /dev/null\ndefaults write com.apple.ncprefs dnd_prefs -data "$(plutil -convert binary1 -o - ~/.config/wind-down/dnd.plist | base64)"\necho "$(date \'+%Y-%m-%d %H:%M\') wind-down ok" >> ~/Library/Logs/wind-down.log',
    },
    p(
      "老實說第一晚沒有用。我把手機拿回房間，理由是「怕漏接電話」。第二晚我請太太幫我把手機收走，才真的睡著。",
    ),
    {
      type: "quote",
      inlines: t("你不是輸給手機，你是太久沒有讓自己下班。"),
      source: "那天晚上太太說的話",
    },
    h2("h-rest", "休息不是獎勵，是設計的一部分"),
    p(
      "做系統的人都知道，沒有維護時段的服務遲早會出事。可是輪到自己，我卻一直把睡眠當成做完事情之後才配得的獎勵。那一週讓我重新讀了這段經文：",
    ),
    {
      type: "scripture",
      inlines: t(
        "你們清晨早起，夜晚安歇，吃勞碌得來的飯，本是枉然；惟有耶和華所親愛的，必叫他安然睡覺。",
      ),
      reference: "詩篇 127:2",
      version: "和合本",
    },
    p(
      "我不覺得這是在說努力沒有用。比較像是提醒：人不是靠把自己榨乾來證明價值的。能安心睡著，本身就是一種信任。",
    ),
    {
      type: "callout",
      inlines: t(
        "如果你也在連續熬夜，先別急著改全部。挑一件最小的事，例如把充電座移出房間，連續做三天就好。",
      ),
    },
    { type: "divider" },
    h2("h-after", "一週之後"),
    p(
      "到了週日，我睡了七個半小時。沒有奇蹟，白天還是會累，工作也沒有變少。但我第一次覺得，身體跟我是同一隊的。",
    ),
    p("下週一的主題還是身體。我想聊聊走路這件事，以及為什麼最好的點子常常不是在螢幕前出現的。"),
  ],
  source: "fixture",
};

const short = (
  id: string,
  date: string,
  topic: Post["topic"],
  slug: string,
  title: string,
  excerpt: string,
  blocks: Block[],
  extra: Partial<Post> = {},
): Post => ({
  id: `fixture-${id}`,
  title,
  slug,
  date,
  topic,
  status: "Published",
  publishedAt: at(date),
  updatedAt: at(date),
  excerpt,
  blocks,
  source: "fixture",
  ...extra,
});

export const FIXTURE_POSTS: Post[] = [
  LONG_POST,
  short(
    "society",
    "2026-10-03",
    "society",
    "ai-yidu-buhui",
    "當 AI 開始替我們回訊息，「已讀不回」還算是一種誠實嗎？",
    "（測試稿）自動回覆越來越像真人之後，沉默反而變成少數還能確定是本人的訊號。",
    [
      p(
        "（測試稿）上週我收到一則很得體的回覆，得體到我懷疑不是本人寫的。後來對方承認，那是助理功能幫他擬的。",
      ),
      p(
        "我沒有生氣，只是突然想到：如果每一句客氣話都可以外包，那一句遲來的、笨拙的「抱歉現在才回」會不會反而比較珍貴？",
      ),
      p("這一篇有關聯集數，用來檢查「聽這集」的呈現。集數關聯是測試資料。"),
    ],
    {
      // 測試用關聯：連結是節目真實存在的集數頁，但「這篇文章對應這一集」是虛構的
      episode: {
        url: "https://player.soundon.fm/p/58307692-4c89-43fa-b4e0-43f6e6fdc152/episodes/4421da79-5e39-412a-8966-495db3a46a58",
        label: "相關集數",
      },
    },
  ),
  short(
    "work",
    "2026-10-02",
    "work",
    "xiaban-guan-tongzhi",
    "下班後，把通知關掉",
    "（測試稿）十二個字的短標題，用來檢查列表與標題區在最短情況下的樣子。",
    [
      p("（測試稿）這是一篇很短的文章，沒有小標，也沒有圖。"),
      p("工作是呼召，不是戰場。戰場才需要二十四小時待命。"),
    ],
  ),
  short(
    "family",
    "2026-10-01",
    "family",
    "haizi-wen-daogao",
    "孩子問我為什麼要禱告，我答不出來的那三秒",
    "（測試稿）最近的人，最需要慢說。那三秒的沉默，比我後來講的任何道理都誠實。",
    [
      p("（測試稿）晚餐前他忽然問：「為什麼要跟看不見的人講話？」"),
      p("我張開嘴，發現準備好的答案都太像大人的答案。"),
      {
        type: "quote",
        inlines: t("我也還在學。我們今天一起問問看好不好？"),
      },
    ],
  ),
  short(
    "spirit",
    "2026-09-30",
    "spirit",
    "zaoyin-li-tiaopin",
    "在噪音裡調回頻率",
    "（測試稿）安靜不是沒有聲音，是知道自己在聽哪一台。",
    [
      p("（測試稿）這篇用來檢查沒有摘要以外任何裝飾的短文。"),
      p("週三是一週的中點。把收音機轉回原本的頻率，不需要很久，但需要先停下來。"),
    ],
  ),
  short("mood", "2026-09-29", "mood", "shengqi-shi-yibiaoban", "生氣不是壞掉，是儀表板亮燈", "", [
    p("（測試稿）這篇故意沒有填摘要，用來檢查摘要缺值時的列表與標題區。"),
    p("燈亮了不用急著把燈拔掉。先看一下是哪一個燈。"),
  ]),
  short(
    "walk",
    "2026-09-28",
    "body",
    "zoulu-shangban-30",
    "走路上班的第 30 天：a short note on walking, thinking & not checking Slack",
    "（測試稿）中英混排的標題，用來檢查換行與字距。",
    [p("（測試稿）三十天，每天四十分鐘。最大的改變不是體重，是我到公司的時候已經想完一件事了。")],
  ),
  // 以下三篇永遠不應該出現在任何頁面：用來驗證發布閘門
  short("draft", "2026-10-04", "mood", "gate-draft", "【不應出現】草稿", "", [p("草稿")], {
    status: "Draft",
  }),
  short("scheduled", "2099-01-01", "mood", "gate-scheduled", "【不應出現】排程未到", "", [
    p("排程"),
  ]),
  short("archived", "2026-10-04", "mood", "gate-archived", "【不應出現】已封存", "", [p("封存")], {
    archived: true,
  }),
];
