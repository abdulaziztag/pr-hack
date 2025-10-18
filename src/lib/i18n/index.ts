import { LOCALES, type Lang } from "./locales";
import { formatInt } from "@/lib/intl/number";

const COOKIE = "fl-lang";
const STORAGE = "fl.lang";

export function detectLang(navigatorLang?: string): Lang {
  const fromStorage = safeStorageGet(STORAGE) as Lang | null;
  if (fromStorage) return fromStorage;
  const fromCookie = getCookie(COOKIE) as Lang | null;
  if (fromCookie) return fromCookie;
  const nav = (
    navigatorLang ||
    (typeof navigator !== "undefined" ? navigator.language : "en")
  ).toLowerCase();
  if (nav.startsWith("ru")) return "ru";
  if (nav.startsWith("uz") || nav.startsWith("uzb")) return "uz";
  return "en";
}

export function setLang(lang: Lang) {
  safeStorageSet(STORAGE, lang);
  setCookie(COOKIE, lang, 365);
}

export function t(lang: Lang, path: string): string {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = LOCALES[lang] ?? LOCALES.en;
  for (const p of parts) node = node?.[p];
  return typeof node === "string" ? node : path;
}

/**
 * @deprecated Use formatInt from @/lib/intl/number directly.
 * Number formatting is now fixed-locale to prevent hydration issues.
 * Language parameter is ignored.
 */
export function fmtNumber(_lang: Lang, n: number) {
  return formatInt(n);
}

/**
 * @deprecated Use formatInt from @/lib/intl/number directly.
 * Number formatting is now fixed-locale to prevent hydration issues.
 * Language parameter is ignored.
 */
export function fmtCurrencyUZS(_lang: Lang, n: number) {
  return formatInt(n);
}

function safeStorageGet(k: string): string | null {
  try {
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeStorageSet(k: string, v: string) {
  try {
    sessionStorage.setItem(k, v);
  } catch {
    // Fail silently
  }
}
function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const d = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${d}`;
}
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export type { Lang };

