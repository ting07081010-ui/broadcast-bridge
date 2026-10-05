import type { TopicSlug } from "./types.ts";

export type TopicKey = TopicSlug | "rest";

export type TopicMeta = {
  slug: TopicKey;
  name: string;
  /** ISO 星期：1＝週一 … 7＝週日。這是編輯建議的節奏，不是發文日期的來源。 */
  isoWeekday: number;
  weekdayLabel: string;
  spirit: string;
};

// 單一來源：中文名、slug、星期與一句精神都從這裡取，不在各頁重寫。
// 顏色由 CSS 的 .topic-<slug> 類別提供（--topic-color／--topic-ink）。
export const TOPICS: Record<TopicKey, TopicMeta> = {
  body: {
    slug: "body",
    name: "身體",
    isoWeekday: 1,
    weekdayLabel: "週一",
    spirit: "把身體當第一個家",
  },
  mood: {
    slug: "mood",
    name: "心情",
    isoWeekday: 2,
    weekdayLabel: "週二",
    spirit: "為情緒留一個頻道",
  },
  spirit: {
    slug: "spirit",
    name: "靈命",
    isoWeekday: 3,
    weekdayLabel: "週三",
    spirit: "在噪音裡調回頻率",
  },
  family: {
    slug: "family",
    name: "家庭",
    isoWeekday: 4,
    weekdayLabel: "週四",
    spirit: "最近的人，最需要慢說",
  },
  work: {
    slug: "work",
    name: "事業",
    isoWeekday: 5,
    weekdayLabel: "週五",
    spirit: "工作是呼召，不是戰場",
  },
  society: {
    slug: "society",
    name: "社會",
    isoWeekday: 6,
    weekdayLabel: "週六",
    spirit: "看懂世界，仍選擇溫柔",
  },
  // rest 只作週索引的視覺標記，不是第七個主題頁。
  rest: {
    slug: "rest",
    name: "一週回顧",
    isoWeekday: 7,
    weekdayLabel: "週日",
    spirit: "停一下，才聽得見",
  },
};

export const WEEK_ORDER: TopicKey[] = [
  "body",
  "mood",
  "spirit",
  "family",
  "work",
  "society",
  "rest",
];
