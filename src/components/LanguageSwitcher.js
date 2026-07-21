"use client";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher({ onLangChange, direction = "down" }) {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: "si", label: "සිංහල", flag: "🇱🇰" },
    { code: "ta", label: "தமிழ்", flag: "🇱🇰" },
    { code: "en", label: "English", flag: "🇬🇧" }
  ];

  const handleSelectLanguage = (code) => {
    setLang(code);
    setIsOpen(false);
    if (onLangChange) {
      onLangChange(code);
    }
  };

  const currentLangObj = languages.find(l => l.code === lang) || languages[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold px-2.5 py-1.5 rounded-xl text-xs shadow-sm transition cursor-pointer shrink-0"
      >
        <span>{currentLangObj.flag}</span>
        <span>{currentLangObj.label}</span>
        <span className="text-[10px] opacity-60">{direction === "up" ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className={`absolute right-0 ${direction === "up" ? "bottom-full mb-2" : "top-full mt-2"} w-36 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden py-1`}>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelectLanguage(l.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-left transition cursor-pointer ${
                lang === l.code
                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-extrabold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
