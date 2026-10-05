import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Link2, Moon, Sun } from "lucide-react";

export type ReaderTheme = "paper" | "night-read";

const STORAGE_KEY = "enian-reader-theme";
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * 伺服器一律輸出 paper；這段在首次繪製前把使用者手動存過的偏好套上，避免閃色。
 * 只讀自己存的偏好，不跟隨 prefers-color-scheme（初訪固定紙感是人工定案）。
 */
export const READER_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(t==="night-read")document.currentScript.parentElement.setAttribute("data-theme",t)}catch(e){}})()`;

function readStoredTheme(): ReaderTheme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "night-read" ? "night-read" : "paper";
  } catch {
    return "paper";
  }
}

export function useReaderTheme(): [ReaderTheme, () => void] {
  const [theme, setTheme] = useState<ReaderTheme>("paper");
  useIsomorphicLayoutEffect(() => setTheme(readStoredTheme()), []);
  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === "paper" ? "night-read" : "paper";
      try {
        // 只保存閱讀偏好，不含任何個人資料
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // 無法儲存時本次仍可切換，只是下次回到紙感
      }
      return next;
    });
  }, []);
  return [theme, toggle];
}

const TOOL_BUTTON =
  "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-ink-muted transition-colors duration-200 hover:bg-paper-surface hover:text-ink";

export default function ReaderTools({
  theme,
  onToggleTheme,
  canonicalUrl,
  children,
}: {
  theme: ReaderTheme;
  onToggleTheme: () => void;
  canonicalUrl: string;
  children?: React.ReactNode;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 4000);
  };

  const isNight = theme === "night-read";
  return (
    <div className="-mx-3 flex flex-wrap items-center gap-x-1 gap-y-1">
      <button
        type="button"
        onClick={onToggleTheme}
        aria-pressed={isNight}
        aria-label={isNight ? "切換為紙感閱讀" : "切換為夜間閱讀"}
        className={TOOL_BUTTON}
      >
        {isNight ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )}
        {isNight ? "紙感閱讀" : "夜間閱讀"}
      </button>
      <button type="button" onClick={copyLink} className={TOOL_BUTTON}>
        {copyState === "copied" ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
        {/* 文字回饋放在按鈕內，不用 toast 擋住文章 */}
        <span aria-live="polite">
          {copyState === "copied"
            ? "已複製連結"
            : copyState === "failed"
              ? "複製失敗，請從網址列複製"
              : "複製連結"}
        </span>
      </button>
      {children}
    </div>
  );
}
