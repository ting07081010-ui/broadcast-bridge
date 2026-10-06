import {
  BookMarked,
  BriefcaseBusiness,
  Heart,
  House,
  PersonStanding,
  RadioTower,
  Waypoints,
} from "lucide-react";
import { TOPICS, type TopicKey } from "@/lib/blog/topics";
import { cn } from "@/lib/utils";

// 同一套線條圖示：24×24、stroke 1.5
const TOPIC_ICONS: Record<TopicKey, typeof Heart> = {
  body: PersonStanding,
  mood: Heart,
  spirit: RadioTower,
  family: House,
  work: BriefcaseBusiness,
  society: Waypoints,
  rest: BookMarked,
};

export function TopicIcon({ topic, className }: { topic: TopicKey; className?: string }) {
  const Icon = TOPIC_ICONS[topic];
  return <Icon strokeWidth={1.5} aria-hidden="true" className={cn("h-5 w-5", className)} />;
}

/** 主題標籤：色點＋中文名。顏色不是唯一辨識，永遠同時顯示中文。 */
export function TopicTag({ topic, className }: { topic: TopicKey; className?: string }) {
  return <span className={cn("topic-tag", `topic-${topic}`, className)}>{TOPICS[topic].name}</span>;
}

/** 列表用的低重量主題標記：色點＋文字，不帶底色。 */
export function TopicMark({ topic, className }: { topic: TopicKey; className?: string }) {
  return (
    <span className={cn(`topic-${topic}`, "inline-flex items-center gap-2", className)}>
      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-topic" />
      {TOPICS[topic].name}
    </span>
  );
}

/** 只在開發模式會出現：標示這是測試稿，不是真實發文。 */
export function FixtureBadge({ source }: { source: "notion" | "fixture" }) {
  if (source !== "fixture") return null;
  return (
    <span className="rounded-md border border-dashed border-current px-1.5 text-xs leading-5">
      測試稿
    </span>
  );
}
