import { useCallback, useEffect, useLayoutEffect, useState } from "react";

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
