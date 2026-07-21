"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext({
  lang: "si",
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("si");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("app_lang") || "si";
      setLangState(stored);
    }
  }, []);

  const setLang = (newLang) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_lang", newLang);
      window.dispatchEvent(new CustomEvent("lang-changed", { detail: newLang }));
    }
  };

  useEffect(() => {
    const handleLangEvent = (e) => {
      if (e.detail) {
        setLangState(e.detail);
      }
    };
    window.addEventListener("lang-changed", handleLangEvent);
    return () => window.removeEventListener("lang-changed", handleLangEvent);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { lang: "si", setLang: () => {} };
  }
  return context;
}
