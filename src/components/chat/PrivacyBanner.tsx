"use client";
import { detectLang, t } from "@/lib/i18n";
import { HIDE_DEMO_COPY } from "@/lib/config";

export default function PrivacyBanner() {
  if (HIDE_DEMO_COPY) return null;

  const lang = detectLang();
  return (
    <div className="mx-2 mt-2 rounded-md border bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
      {t(lang, "common.demo_disclaimer")}
    </div>
  );
}

