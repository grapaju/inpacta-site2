"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = stored || (systemDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return <>{children}</>;
}
