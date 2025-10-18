"use client";
import * as React from "react";
import { detectLang, setLang, type Lang } from "@/lib/i18n";

const labels: Record<Lang, string> = { en: "EN", ru: "RU", uz: "UZ" };

export default function LanguageSwitcher({
  onChange,
}: {
  onChange?: (lang: Lang) => void;
}) {
  const [lang, setL] = React.useState<Lang>(detectLang());
  React.useEffect(() => {
    onChange?.(lang);
  }, [lang, onChange]);
  function change(next: Lang) {
    setLang(next);
    setL(next);
  }
  return (
    <div className="inline-flex overflow-hidden rounded-md border">
      {(["en", "ru", "uz"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => change(l)}
          className={`px-2 py-1 text-xs ${
            l === lang
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
          aria-pressed={l === lang}
          aria-label={`Switch language to ${l}`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}

