import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 區塊眉題：短中文標籤＋一小段琥珀刻度線（取代原本的 `// CODE_LABEL`）。 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mb-3 flex items-center gap-2.5 text-[13px] font-medium tracking-[0.08em] text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-5 bg-accent" />
      {children}
    </p>
  );
}
