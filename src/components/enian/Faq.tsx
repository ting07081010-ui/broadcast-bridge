import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/lib/enian/constants";
import { CONTAINER, SECTION_Y } from "@/lib/enian/ui";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./primitives";

export default function Faq() {
  return (
    <section id="faq" className="border-b border-border">
      <div
        className={cn(
          CONTAINER,
          SECTION_Y,
          "grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16",
        )}
      >
        <SectionHeader
          eyebrow="常見問題"
          title="訂閱前常見問題。"
          lead="先把最常見的疑問看完，你會更容易判斷這個節目是不是你的菜。"
        />

        {/* 只留手風琴：原本的三張摘要卡與 Hero 信任條重複，已移除 */}
        <Accordion type="single" collapsible className="border-t border-border">
          {FAQ.map((item, idx) => (
            <AccordionItem key={item.q} value={`faq-${idx}`} className="border-b border-border">
              <AccordionTrigger
                data-event="click_faq"
                data-faq={item.q}
                className="gap-4 py-5 text-left text-base font-medium text-foreground transition-colors duration-200 hover:text-accent hover:no-underline sm:text-[17px]"
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 pr-8 text-[15px] leading-relaxed text-muted-foreground sm:text-base sm:leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
