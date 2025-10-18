"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { sseIterator } from "@/lib/ai/sse";
import { extractText } from "@/lib/ai/extract";
import type { ChatMessage } from "@/lib/ai/types";
import { routeIntent, suggestionsFor } from "@/lib/ai/intent-router";
import type { Intent } from "@/lib/ai/intent-types";
import { tryParseBlocks, type BlocksEnvelope } from "@/lib/ai/blocks";
import { buildControl, truncateAnswer } from "@/lib/ai/orchestrator";
import { stripDangerousHtml } from "@/lib/ai/sanitize";
import type { ToolResult } from "@/lib/tools/types";
import { detectLang, t, type Lang } from "@/lib/i18n";
import { track } from "@/lib/analytics/client";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import RenderBlocks from "./RenderBlocks";
import InlineCitations from "./InlineCitations";
import ActionBar from "./ActionBar";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  blocks?: BlocksEnvelope;
  tools?: ToolResult[];
};
const uid = () => Math.random().toString(36).slice(2, 10);

export default function ChatDock({ className = "" }: { className?: string }) {
  const [lang, setLang] = React.useState<Lang>(detectLang());
  const [messages, setMessages] = React.useState<Msg[]>(() => {
    // Try to restore from sessionStorage
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("chat.history");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // Ignore errors
      }
    }
    return [
      {
        id: uid(),
        role: "assistant",
        content:
          "Hi! I can explain APR, compare offers, and clarify fees. What would you like to know?",
      },
    ];
  });
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [lastIntent, setLastIntent] = React.useState<Intent>("unknown");
  const viewRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Persist messages to sessionStorage
  React.useEffect(() => {
    try {
      sessionStorage.setItem("chat.history", JSON.stringify(messages.slice(-30)))
    } catch {
      // Ignore storage errors
    }
  }, [messages])

  React.useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (viewRef.current && viewRef.current.scrollTo) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      viewRef.current.scrollTo({
        top: viewRef.current.scrollHeight,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      })
    }
  }, [messages.length])

  async function onSend() {
    const q = input.trim();
    if (!q || busy) return;

    const userMsg: Msg = { id: uid(), role: "user", content: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);

    // Track analytics
    track("send_message", { len: q.length, lang });

    // Route intent and extract slots
    const intentResult = routeIntent(q);
    setLastIntent(intentResult.intent);

    // Build control envelope with plan, tools, RAG, etc.
    const ctrl = buildControl(intentResult, q);

    // Control system message with structured context
    const control: ChatMessage = {
      role: "system",
      content:
        `You are FairLend Assistant.\n` +
        `INTENT=${intentResult.intent} CONF=${intentResult.confidence.toFixed(2)}\n` +
        `SLOTS=${JSON.stringify(intentResult.slots)}\n` +
        `PLAN=${JSON.stringify(ctrl.plan)}\n` +
        `STYLE=${ctrl.style}\n` +
        `SNAPSHOT=${JSON.stringify(ctrl.snapshot)}\n` +
        `TOOLS=${JSON.stringify(ctrl.tools)}\n` +
        `RAG_SNIPPETS=${JSON.stringify(ctrl.rag)}\n` +
        `LANG=${lang}\n` +
        `When generating examples/phrases, prefer language=LANG for prose; numbers remain plain without currency symbols inside fljson.\n` +
        `Follow PLAN sections in order; use bullets; include fljson when wantTable=true; keep total under ${ctrl.plan.maxChars} chars (soft).\n` +
        `Use [^id] citations when grounded. If data missing, say so and propose a next action.`,
    };

    // Build chat payload
    const chatPayload: ChatMessage[] = [
      control,
      ...messages
        .filter((m) => m.role !== "system")
        .map<ChatMessage>((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: q },
    ].slice(-26) // Keep last 26 turns (including control)

    let assistant = ""
    const assistantId = uid()
    setMessages((m) => [
      ...m,
      { id: assistantId, role: "assistant", content: "" },
    ])

    try {
      for await (const frame of sseIterator("/api/chat", {
        messages: chatPayload,
      })) {
        try {
          const json = JSON.parse(frame)
          const piece = extractText(json)
          if (!piece) continue
          assistant += piece
          setMessages((m) =>
            m.map((x) =>
              x.id === assistantId ? { ...x, content: assistant } : x
            )
          )
        } catch {
          // Ignore keepalive lines or malformed JSON
        }
      }

      // After streaming finishes, sanitize, truncate, and parse blocks
      assistant = stripDangerousHtml(assistant);
      assistant = truncateAnswer(assistant, ctrl.plan.maxChars);
      const parsed = tryParseBlocks(assistant);

      // Track analytics
      track("stream_complete", { chars: assistant.length, intent: intentResult.intent });
      if (ctrl.tools && ctrl.tools.length > 0) {
        ctrl.tools.forEach((tool) => {
          track("tool_used", { tool: tool.tool, ok: tool.ok });
        });
      }

      setMessages((m) =>
        m.map((x) =>
          x.id === assistantId
            ? { ...x, content: assistant, blocks: parsed, tools: ctrl.tools }
            : x
        )
      );
    } catch (e: unknown) {
      const err = e as Error;
      track("error", { where: "chat_stream", msg: String(err?.message || e) });
      setMessages((m) =>
        m.map((x) =>
          x.id === assistantId
            ? { ...x, content: `⚠️ ${err?.message || "Network error"}` }
            : x
        )
      );
    } finally {
      setBusy(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void onSend()
    }
  }

  return (
    <section className={`flex h-full flex-col bg-background ${className}`}>
      <header className="sticky top-0 z-10 border-b bg-background/70 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t(lang, "chat.assistant")}</h2>
          <LanguageSwitcher onChange={(newLang) => setLang(newLang)} />
        </div>
        {busy && (
          <div className="mt-1 text-xs text-brand">
            {t(lang, "chat.streaming")}
          </div>
        )}
      </header>

      <div
        ref={viewRef}
        className="flex-1 space-y-2 overflow-y-auto px-3 py-2"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex max-w-[75%] flex-col">
              <div
                className={`whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "self-end bg-brand text-white"
                    : "self-start bg-muted text-foreground"
                }`}
              >
                {m.role === "assistant" ? (
                  <InlineCitations text={m.content} />
                ) : (
                  m.content
                )}
              </div>
              {m.role === "assistant" && m.blocks ? (
                <div className="mt-2">
                  <RenderBlocks data={m.blocks} />
                </div>
              ) : null}
              {m.role === "assistant" && m.tools && m.tools.length > 0 ? (
                <ActionBar
                  tools={m.tools}
                  onAction={(a) => {
                    track("chip_click", { type: a.type, arg: a.arg || "" });
                    if (a.type === "filter" && a.arg) {
                      track("nav_filter", { rail: a.arg });
                    }
                    // TODO: connect to real navigation later
                    console.log("action", a);
                  }}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Quick suggestion chips */}
      {!busy && messages.length > 1 && (
        <div className="flex flex-wrap gap-2 border-t px-3 py-2">
          {suggestionsFor(lastIntent)
            .slice(0, 3)
            .map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInput(suggestion)}
                className="pill bg-muted hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-brand"
              >
                {suggestion}
              </button>
            ))}
        </div>
      )}

      <form
        className="sticky bottom-0 flex items-end gap-2 border-t bg-background p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void onSend();
        }}
      >
        <textarea
          ref={textareaRef}
          className="min-h-[44px] max-h-32 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          placeholder={t(lang, "common.placeholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={busy}
          aria-label="Message to assistant"
          rows={1}
        />
        <button
          type="submit"
          className="btn-brand flex h-[44px] w-[44px] items-center justify-center rounded-md disabled:opacity-50"
          disabled={busy || !input.trim()}
          aria-label={t(lang, "common.send_message")}
        >
          {busy ? (
            <span className="text-xs">…</span>
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </form>
    </section>
  );
}
