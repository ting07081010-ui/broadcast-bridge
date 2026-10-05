import { useEffect, useRef, type RefObject } from "react";

/**
 * 閱讀進度條：只計算正文開始到結束，不把頁尾算進去。
 * 用 rAF 節流＋transform 更新，不觸發 React 重繪。短文（不到兩個螢幕高）不顯示。
 */
export default function ReadingProgress({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const target = targetRef.current;
    if (!bar || !target) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const isLongRead = rect.height > window.innerHeight * 2;
      bar.hidden = !isLongRead;
      if (!isLongRead) return;
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      bar.style.setProperty("--progress", progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [targetRef]);

  return (
    <div className="pointer-events-none sticky top-14 z-40 h-0 md:top-16" aria-hidden="true">
      <div ref={barRef} hidden className="reading-progress h-0.5 w-full" />
    </div>
  );
}
