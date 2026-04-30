// 集中管理 E 人 I 碎念 Podcast 落地頁的所有常數
// 收到實際連結後直接替換以下 URL 即可

export const PODCAST = {
  name: "E 人 I 碎念",
  tagline: "一個有點宅、很愛講、但認真生活的 Podcast",
  hostName: "大E (Emmanuel)",
  frequency: "FM 92.1 MHz",
  avatarUrl: "https://www.supergalen.com/assets/img/guild/e_nian/avatar.webp",
  // 收到正式 RSS 後填入；空字串會 fallback 到範例集數
  rssFeedUrl:
    "https://feeds.soundon.fm/podcasts/58307692-4c89-43fa-b4e0-43f6e6fdc152.xml",
};

export type PlatformKey =
  | "spotify"
  | "apple"
  | "youtube"
  | "facebook"
  | "instagram";

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

// Hero 主 / 次 CTA 預設指向 Spotify / 最新一集 anchor
export const PRIMARY_CTA = {
  label: "立即訂閱 Podcast",
  href: "#tune-in",
};

export const SECONDARY_CTA = {
  label: "先聽最新一集",
  href: "#latest-episodes",
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

export const FIRST_LISTEN: Array<{
  epNo: string;
  title: string;
  desc: string;
  tags: string[];
}> = [
  {
    epNo: "EP001",
    title: "為什麼我開始碎念？",
    desc: "從一個腦袋停不下來的 E 人，聊到為什麼自言自語也可以是一種整理世界的方法。",
    tags: ["節目起點", "生活觀察"],
  },
  {
    epNo: "EP002",
    title: "資安其實離你很近",
    desc: "密碼、詐騙、個資外洩，不只是工程師的事，而是每個家庭都該懂一點的生活常識。",
    tags: ["資安", "科技生活"],
  },
  {
    epNo: "EP003",
    title: "在家庭與信仰之間，找到自己的節奏",
    desc: "工作、家人、信仰、興趣，怎麼擺都不夠用。一集講講我自己怎麼把節奏調回來。",
    tags: ["家庭", "信仰"],
  },
];

export const MISSION = {
  goal: 500,
  current: 0, // 之後可改為動態
  copy:
    "這不是單純的訂閱數字，而是一個小型廣播基地：集結 500 位願意一起思考、一起笑、一起認真生活的聽眾。如果你也喜歡科技、信仰、家庭與生活觀察，歡迎調頻進來。",
};
