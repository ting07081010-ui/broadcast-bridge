// 共用樣式字串：全站只有一種主 CTA 配方（紙白底＋深字），不使用 glow。
// TODO(host): 主 CTA 配方為規劃 0.6 的預設值（紙白底 #F4F1EA＋深字 #121214），待人工定案。

const BTN_BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-semibold leading-none transition-[background-color,border-color,color,filter] duration-200 ease-out";

/** 主按鈕：高 48px、圓角 12px、紙白底＋深字。 */
export const BTN_PRIMARY = `${BTN_BASE} bg-foreground text-background hover:brightness-[0.94]`;

/** 次按鈕：同高、1px 邊框、透明底。 */
export const BTN_SECONDARY = `${BTN_BASE} border border-border text-foreground hover:border-muted-foreground hover:bg-surface`;

/** 導覽列等窄空間用的小尺寸（搭配 cn() 覆寫高度）。 */
export const BTN_SM = "min-h-10 px-4 text-sm";

/** 文字連結：琥珀色，hover 才出現底線。 */
export const TEXT_LINK =
  "inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 transition-colors duration-200 hover:underline";

/** 區塊共用的水平留白與最大內容寬。 */
export const CONTAINER = "mx-auto w-full max-w-6xl px-5 sm:px-8";
