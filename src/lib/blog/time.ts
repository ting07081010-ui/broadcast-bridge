// 台北時間（UTC+8，無日光節約）與 ISO 週的唯一計算來源。
// 「今天」與週界都從這裡算，避免各頁各寫一套。

const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

/** 把時間點換算成台北日期字串 YYYY-MM-DD。 */
export function taipeiDate(at: Date | string): string {
  const ms = (typeof at === "string" ? new Date(at) : at).getTime() + TAIPEI_OFFSET_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

function utcFromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** ISO 星期：1＝週一 … 7＝週日。 */
export function isoWeekday(ymd: string): number {
  return utcFromYmd(ymd).getUTCDay() || 7;
}

export function weekdayLabel(ymd: string): string {
  return WEEKDAY_LABELS[utcFromYmd(ymd).getUTCDay()];
}

export function addDays(ymd: string, days: number): string {
  return new Date(utcFromYmd(ymd).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** 該日期所屬 ISO 週的週一。 */
export function weekStart(ymd: string): string {
  return addDays(ymd, 1 - isoWeekday(ymd));
}

/**
 * ISO week-year 與週碼，例如 2026-W41。
 * 跨年時週四落在哪一年就算哪一年，所以不能直接用日曆年。
 */
export function isoWeekKey(ymd: string): string {
  const thursday = utcFromYmd(addDays(ymd, 4 - isoWeekday(ymd)));
  const weekYear = thursday.getUTCFullYear();
  const yearStart = Date.UTC(weekYear, 0, 1);
  const week = Math.floor((thursday.getTime() - yearStart) / DAY_MS / 7) + 1;
  return `${weekYear}-W${String(week).padStart(2, "0")}`;
}

/** 全站一致的日期顯示：2026.10.05。 */
export function formatDate(ymd: string): string {
  return ymd.replaceAll("-", ".");
}

const WEEK_KEY_PATTERN = /^(\d{4})-W(\d{2})$/;

/**
 * 把 ISO 週碼（例如 2026-W41）換回該週的週一。
 * 格式錯誤或該年沒有這一週（例如 2026-W54）回傳 null。
 */
export function weekKeyToMonday(weekKey: string): string | null {
  const match = WEEK_KEY_PATTERN.exec(weekKey);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  // 1 月 4 日一定落在該 ISO 年的第 1 週
  const firstMonday = weekStart(`${year}-01-04`);
  const monday = addDays(firstMonday, (week - 1) * 7);
  // 再算回去比對，擋掉不存在的週碼
  return isoWeekKey(monday) === weekKey ? monday : null;
}

/** 「2026 年第 41 週」 */
export function formatWeekKey(weekKey: string): string {
  const match = WEEK_KEY_PATTERN.exec(weekKey);
  return match ? `${match[1]} 年第 ${Number(match[2])} 週` : weekKey;
}

/** 「2026 年 10 月」 */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  return `${year} 年 ${Number(month)} 月`;
}
