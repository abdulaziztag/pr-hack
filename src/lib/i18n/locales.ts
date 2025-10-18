export type Lang = "uz" | "ru" | "en";

export const LOCALES = {
  en: {
    common: {
      offers: "Offers",
      chat: "Chat",
      send: "Send",
      send_message: "Send message",
      placeholder: "Ask about APR, fees, eligibility, or P2P…",
      demo_disclaimer: "Demo only — no real funds, no PII storage.",
      retry: "Retry",
    },
    home: {
      headline: "Compare bank and P2P offers by true APR",
    },
    chat: {
      assistant: "AI Assistant",
      streaming: "Streaming…",
      ready: "Ready",
      actions: "Next steps",
    },
  },
  ru: {
    common: {
      offers: "Предложения",
      chat: "Чат",
      send: "Отправить",
      send_message: "Отправить сообщение",
      placeholder: "Спросите про APR, комиссии, доступность или P2P…",
      demo_disclaimer: "Демо — без реальных средств, без хранения ПД.",
      retry: "Повторить",
    },
    home: {
      headline: "Сравнивайте банковские и P2P по честному APR",
    },
    chat: {
      assistant: "AI-ассистент",
      streaming: "Стриминг…",
      ready: "Готово",
      actions: "Следующие шаги",
    },
  },
  uz: {
    common: {
      offers: "Takliflar",
      chat: "Chat",
      send: "Yuborish",
      send_message: "Xabar yuborish",
      placeholder: "APR, to'lovlar, moslik yoki P2P haqida so'rang…",
      demo_disclaimer: "Demo — real mablag' yo'q, PII saqlanmaydi.",
      retry: "Qayta urinish",
    },
    home: {
      headline: "Bank va P2P takliflarini haqiqiy APR bo'yicha solishtiring",
    },
    chat: {
      assistant: "AI Yordamchi",
      streaming: "Striming…",
      ready: "Tayyor",
      actions: "Keyingi qadamlar",
    },
  },
} as const;

