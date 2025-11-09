"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    if (!theme || !mounted) return;
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-1" role="group" aria-label="Alternância de tema">
        <button
          type="button"
          className="px-2 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--card)] ring-focus"
          disabled
        >
          Claro
        </button>
        <button
          type="button"
          className="px-2 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--card)] ring-focus"
          disabled
        >
          Escuro
        </button>
        <button
          type="button"
          className="px-2 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--card)] ring-focus"
          disabled
        >
          Sistema
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label="Alternância de tema">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className="px-2 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--card)] ring-focus"
        aria-pressed={theme === "light"}
      >
        Claro
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className="px-2 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--card)] ring-focus"
        aria-pressed={theme === "dark"}
      >
        Escuro
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className="px-2 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--card)] ring-focus"
        aria-pressed={theme === "system"}
      >
        Sistema
      </button>
    </div>
  );
}
