import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/lib/enian/constants";

export default function Faq() {
  return (
    <section
      id="faq"
      className="border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-6 py-20"
    >
      <div className="mx-auto max-w-3xl">
        <p
          className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-amber)]"
          style={{ fontFamily: "var(--font-mono-display)" }}
          aria-hidden="true"
        >
          // FREQUENT_QUESTIONS
        </p>
        <h2 className="text-3xl font-bold text-[var(--studio-text)] sm:text-4xl">
          常見問題 FAQ
        </h2>
        <p className="mt-3 text-[var(--studio-text-muted)]">
          訂閱前想先了解的事，這裡都有答案。
        </p>

        <Accordion
          type="single"
          collapsible
          className="mt-8 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] px-2"
        >
          {FAQ.map((item, idx) => (
            <AccordionItem
              key={item.q}
              value={`faq-${idx}`}
              className="border-b border-[var(--studio-border)] last:border-b-0"
            >
              <AccordionTrigger
                data-event="click_faq"
                data-faq={item.q}
                className="px-3 text-left text-base font-semibold text-[var(--studio-text)] hover:text-[var(--neon-cyan)]"
              >
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="px-3 text-sm leading-relaxed text-[var(--studio-text-muted)]">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
