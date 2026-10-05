// 集中管理 E 人 I 碎念 Podcast 落地頁的所有常數
// 收到實際連結後直接替換以下 URL 即可

import avatarImg from "@/assets/enian-avatar.jpg";

export const PODCAST = {
  name: "E 人 I 碎念",
  tagline: "一個有點宅、很愛講、但認真生活的 Podcast",
  hostName: "大E (Emmanuel)",
  frequency: "FM 92.1 MHz",
  avatarUrl: avatarImg,
  rssFeedUrl: "https://feeds.soundon.fm/podcasts/58307692-4c89-43fa-b4e0-43f6e6fdc152.xml",
};

export type PlatformKey = "spotify" | "apple" | "youtube" | "facebook" | "instagram" | "threads";

export type SocialLink = {
  key: Extract<PlatformKey, "threads" | "instagram" | "facebook" | "youtube">;
  name: string;
  handle: string;
  url: string;
  description: string;
};

// 跨平台社群追蹤（與訂閱用 PLATFORMS 區分；用於 SocialFollow 區塊）
export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: "threads",
    name: "Threads",
    handle: "@emmanuel_love_sharing",
    url: "https://www.threads.net/@emmanuel_love_sharing",
    description: "短碎念、節目幕後、即時想法",
  },
  {
    key: "instagram",
    name: "Instagram",
    handle: "@emmanuel_love_sharing",
    url: "https://www.instagram.com/emmanuel_love_sharing/",
    description: "節目花絮、生活快照",
  },
  {
    key: "facebook",
    name: "Facebook",
    handle: "E 人 I 碎念",
    url: "https://www.facebook.com/profile.php?id=61560657516667",
    description: "公告、長文討論、社群互動",
  },
  {
    key: "youtube",
    name: "YouTube",
    handle: "@EmingLife",
    url: "https://www.youtube.com/channel/UC59PKXHHazdIDsLn-9EJ6jQ/",
    description: "完整影片版節目",
  },
];

export const PLATFORMS: Array<{
  key: PlatformKey;
  name: string;
  url: string;
  description: string;
}> = [
  {
    key: "spotify",
    name: "Spotify",
    url: "https://open.spotify.com/show/2w7JIM47VMQZ3dyCVwvpAF",
    description: "在 Spotify 收聽 / 訂閱",
  },
  {
    key: "apple",
    name: "Apple Podcasts",
    url: "https://podcasts.apple.com/tw/podcast/e%E4%BA%BAi%E7%A2%8E%E5%94%B8/id1752405503",
    description: "在 Apple Podcasts 收聽 / 訂閱",
  },
  {
    key: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com/channel/UC59PKXHHazdIDsLn-9EJ6jQ/",
    description: "在 YouTube 觀看 / 訂閱",
  },
  {
    key: "facebook",
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61560657516667",
    description: "在 Facebook 追蹤主持人",
  },
  {
    key: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com/emmanuel_love_sharing/",
    description: "@emmanuel_love_sharing",
  },
];

// Hero 主 / 次 CTA：首頁轉換路徑為「先聽一集 → 選平台訂閱」
export const PRIMARY_CTA = {
  label: "選平台訂閱",
  href: "#tune-in",
};

export const SECONDARY_CTA = {
  label: "先聽一集",
  href: "#first-listen",
};

export const WHO_FOR: string[] = [
  "想用輕鬆方式跟上科技與資安趨勢的人",
  "在家庭、工作、信仰之間找平衡的爸媽",
  "喜歡聽人把複雜事情講白話的通勤族",
  "對基督信仰生活有共鳴或好奇的聽眾",
  "想一邊大笑一邊被認真內容餵飽的宅宅",
];

export const TOPICS: Array<{
  code: string;
  title: string;
  desc: string;
}> = [
  { code: "INFOSEC", title: "資安觀察", desc: "駭客手法、防護常識，講給每個家庭都聽得懂。" },
  { code: "FAMILY", title: "家庭經營", desc: "親子、夫妻、生活節奏，碎念裡有溫度。" },
  { code: "FAITH", title: "基督信仰", desc: "信仰怎麼落在日常選擇裡，不說教、認真聊。" },
  { code: "SOCIAL", title: "社會時事", desc: "科技、文化、社會新聞，多一個視角看世界。" },
];

export const SCHEDULE: Array<{
  day: string;
  unit: string;
  topic: string;
}> = [
  { day: "MON", unit: "職場開播日", topic: "職場 / 專業分享" },
  { day: "TUE", unit: "生活亂入中", topic: "生活 / 家庭 / 趣事" },
  { day: "WED", unit: "信仰對頻時間", topic: "信仰 / 心靈對話" },
  { day: "THU", unit: "宅宅科技局", topic: "科技 / AI / 宅文化" },
  { day: "FRI", unit: "來賓亂入時段", topic: "來賓 / 訪談特輯" },
  { day: "SAT", unit: "週末碎念包", topic: "一週總結 / 輕鬆收尾" },
];

// (FIRST_LISTEN 已移除：第一次來推薦集數現在直接從 RSS 取最新 3 集，避免 hard-coded 文案。)

export const MISSION = {
  // 顯示文案；數字進度條已移除，避免冷啟動時呈現 0/500 的負面觀感
  copy: "這不是單純的訂閱數字，而是一個小型廣播基地：集結願意一起思考、一起笑、一起認真生活的聽眾。如果你也喜歡科技、信仰、家庭與生活觀察，歡迎調頻進來，成為早期共建者。",
};

// 「訂閱」不放在文字連結裡：頂欄只保留一顆訂閱按鈕（見 TopNav）。
export const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "#who-for", label: "適合誰" },
  { href: "#schedule", label: "節目單" },
  { href: "#latest-episodes", label: "最新集數" },
  { href: "#faq", label: "FAQ" },
];

export const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "節目多久更新一次？",
    a: "每週一到週六、每天一個固定單元；週日休息充電。實際更新時間以各平台 RSS 為準。",
  },
  {
    q: "在哪些平台可以聽？",
    a: "Spotify、Apple Podcasts、YouTube 都有上架。FB 與 IG 同步發布幕後與短內容。捲到下方「選擇你的收聽平台」即可一鍵訂閱。",
  },
  {
    q: "想當來賓 / 投稿議題怎麼聯絡？",
    a: "歡迎來信 contact@emting.life，或在 Instagram @emmanuel_love_sharing 私訊。請簡述背景、想聊的主題與聯絡方式即可。",
  },
  {
    q: "節目會講宗教嗎？會不會很硬？",
    a: "會聊基督信仰，但用日常生活角度切入，不說教、不強推；非信仰背景的聽眾也常常覺得有共鳴。",
  },
  {
    q: "為什麼叫「E 人 I 碎念」？",
    a: "主持人是 MBTI 的 E 人，能量需要靠講話釋放；但內容常常是 I 人式的觀察與內省。一邊吵一邊安靜，剛剛好。",
  },
];

export const CONTACT = {
  email: "contact@emting.life",
  instagramDm: "https://www.instagram.com/emmanuel_love_sharing/",
  channels: [
    {
      title: "來賓邀約",
      desc: "想上節目聊聊你的專業 / 故事 / 觀點，歡迎來信。",
      action: "寄信給我們",
      href: "mailto:contact@emting.life?subject=%5B來賓邀約%5D",
    },
    {
      title: "品牌合作",
      desc: "業配、聯名、活動、課程合作皆可洽談。",
      action: "洽談合作",
      href: "mailto:contact@emting.life?subject=%5B品牌合作%5D",
    },
    {
      title: "聽眾回饋",
      desc: "想許願主題、回應某一集、純粹打招呼都可以。",
      action: "IG 私訊",
      href: "https://www.instagram.com/emmanuel_love_sharing/",
    },
  ],
};
