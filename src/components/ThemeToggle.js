"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
    }
    setTheme(nextTheme);
    window.dispatchEvent(new Event("theme-change"));
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 sm:p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-1.5"
      aria-label="Toggle Theme"
      title={theme === "light" ? "Dark Mode" : "Light Mode"}
    >
      <span className="text-sm sm:text-base leading-none select-none">
        {theme === "light" ? "🌙" : "☀️"}
      </span>
      <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline-block select-none">
        {theme === "light" ? "Dark" : "Light"}
      </span>
    </button>
  );
}
