"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cookie-consent");
    if (!saved) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ essential: true, analytics })
    );
    setVisible(false);
  }

  function reject() {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ essential: true, analytics: false })
    );
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
      role="dialog"
      aria-live="polite"
      aria-label="Preferências de cookies"
    >
      <div className="glass max-w-4xl mx-auto p-4 rounded-xl shadow-lg">
        <p className="text-sm">
          Usamos cookies essenciais para o funcionamento do site. Você pode
          permitir cookies analíticos opcionais para melhorar sua experiência.
          Não coletamos dados pessoais sem seu consentimento (LGPD).
        </p>
        <div className="mt-2 flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-[var(--accent)]"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            Ativar cookies analíticos
          </label>
          <div className="ml-auto flex gap-2">
            <button
              className="px-3 py-1.5 text-sm rounded-md bg-[var(--primary)] text-[var(--primary-contrast)] ring-focus"
              onClick={accept}
            >
              Aceitar selecionado
            </button>
            <button
              className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] ring-focus"
              onClick={reject}
            >
              Rejeitar analíticos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
