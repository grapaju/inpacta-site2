"use client";

import { useEffect, useState } from "react";

const MIN = 87.5; // 14px base
const MAX = 118.75; // 19px base
const STEP = 6.25; // 1px em base 16

export default function AccessibilityControls() {
  const [size, setSize] = useState(100);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("font-size-root");
    if (stored) setSize(Number(stored));
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.style.setProperty("--font-size-root", `${size}%`);
      localStorage.setItem("font-size-root", String(size));
    }
  }, [size, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1" aria-label="Tamanho do texto">
      <button
        type="button"
        className="px-2 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--card)] ring-focus"
        onClick={() => setSize((v) => Math.max(MIN, v - STEP))}
        aria-label="Diminuir tamanho do texto"
      >
        A-
      </button>
      <button
        type="button"
        className="px-2 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--card)] ring-focus"
        onClick={() => setSize(100)}
        aria-label="Tamanho padrão"
      >
        A
      </button>
      <button
        type="button"
        className="px-2 py-1 text-xs rounded-md border border-[var(--border)] hover:bg-[var(--card)] ring-focus"
        onClick={() => setSize((v) => Math.min(MAX, v + STEP))}
        aria-label="Aumentar tamanho do texto"
      >
        A+
      </button>
    </div>
  );
}
