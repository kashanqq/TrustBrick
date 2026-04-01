"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ru";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "nav.marketplace": "Marketplace",
    "nav.portfolio": "Portfolio",
    "nav.exchange": "Exchange",
    "nav.admin": "Admin",
    "hero.subtitle": "Institutional Grade Asset Ledger",
    "hero.title": "Make concrete liquid",
    "hero.desc": "Secure fractional ownership in premier architectural developments. Instant liquidity for heavy assets powered by Solana.",
    "hero.btn.explore": "Explore Properties",
    "hero.btn.whitepaper": "Technical Whitepaper",
    "stats.tvl": "Total Value Locked",
    "stats.tps": "Network Capacity",
    "stats.investors": "Active Investors",
    "stats.yield": "Real-time Yield",
    "trending.title": "Institutional Hot-List",
    "trending.hot": "Hot Property",
    "trending.new": "New Listing",
    "trending.stable": "Stable Income",
    "trending.unitPrice": "Unit Price",
    "ledger.title": "Investment Ledger",
    "ledger.all": "All Markets",
    "ledger.residential": "Residential",
    "ledger.commercial": "Commercial",
    "ledger.industrial": "Industrial",
    "ledger.col.project": "Project Name",
    "ledger.col.apy": "Target APY",
    "ledger.col.price": "Price/Share",
    "ledger.col.progress": "Minting Progress",
    "ledger.col.action": "Action",
    "ledger.btn.mint": "Mint Units",
    "ledger.btn.more": "View More Markets",
    
    // Custom Strings for dynamic project
    "project.investButton": "Invest 1 SOL",
    "project.investing": "Processing...",
    "project.collected": "Collected",
    "project.goal": "Goal",
    "project.status": "Construction Status",
  },
  ru: {
    "nav.marketplace": "Рынок",
    "nav.portfolio": "Портфель",
    "nav.exchange": "Биржа",
    "nav.admin": "Админ",
    "hero.subtitle": "Реестр Активов Институционального Класса",
    "hero.title": "Сделай бетон ликвидным",
    "hero.desc": "Получите частичное владение лучшими архитектурными объектами. Мгновенная ликвидность тяжелых активов благодаря Solana.",
    "hero.btn.explore": "Изучить Объекты",
    "hero.btn.whitepaper": "Техническая Бумага",
    "stats.tvl": "Общий Объем Средств",
    "stats.tps": "Пропускная Способность",
    "stats.investors": "Активные Инвесторы",
    "stats.yield": "Доходность",
    "trending.title": "Институциональный Хот-Лист",
    "trending.hot": "Горячий Объект",
    "trending.new": "Новый Листинг",
    "trending.stable": "Стабильный Доход",
    "trending.unitPrice": "Цена Доли",
    "ledger.title": "Инвестиционный Реестр",
    "ledger.all": "Все Рынки",
    "ledger.residential": "Жилые",
    "ledger.commercial": "Коммерческие",
    "ledger.industrial": "Промышленные",
    "ledger.col.project": "Название Проекта",
    "ledger.col.apy": "Целевая APY",
    "ledger.col.price": "Цена Доли",
    "ledger.col.progress": "Прогресс Выпуска",
    "ledger.col.action": "Действие",
    "ledger.btn.mint": "Купить Долю",
    "ledger.btn.more": "Показать Все Рынки",
    
    // Custom
    "project.investButton": "Инвестировать 1 SOL",
    "project.investing": "ऑформление...",
    "project.collected": "Собрано",
    "project.goal": "Цель",
    "project.status": "Статус Строительства",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("trustbrick-lang") as Language;
    if (saved && (saved === "en" || saved === "ru")) {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const newLang = prev === "en" ? "ru" : "en";
      localStorage.setItem("trustbrick-lang", newLang);
      return newLang;
    });
  };

  const t = (key: string) => {
    const value = translations[language][key as keyof typeof translations["en"]];
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
