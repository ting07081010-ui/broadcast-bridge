import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eyebrow } from "./primitives";
import { FAQ } from "@/lib/enian/constants";

export default function Faq() {
  const assurances = [
    "每週一到週六固定更新",
    "Spotify、Apple Podcasts、YouTube 都能收聽",
    "非信仰背景也能輕鬆聽懂",
  ];

  return (
    <section id="faq" className="border-b border-border bg-background px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <Eyebrow>常見問題</Eyebrow>
        <h2 className="text-3xl font-medium text-foreground sm:text-4xl">訂閱前常見問題。</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">
          先把最常見的疑問看完，你會更容易判斷這個節目是不是你的菜。
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {assurances.map((item, idx) => (
            <div key={item} className="rounded-[1.25rem] border border-border bg-surface p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                FAQ 0{idx + 1}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{item}</p>
            </div>
          ))}
        </div>

        <Accordion
          type="single"
          collapsible
          className="mt-8 rounded-[1.5rem] border border-border bg-surface px-3"
        >
          {FAQ.map((item, idx) => (
            <AccordionItem
              key={item.q}
              value={`faq-${idx}`}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger
                data-event="click_faq"
                data-faq={item.q}
                className="px-3 text-left text-base font-semibold text-foreground hover:text-accent-2"
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="px-3 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
