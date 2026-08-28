"use client";

import { useEffect, useState } from "react";
import { CircleHalf } from "@phosphor-icons/react/dist/ssr";

/** Light/dark toggle. The theme is a `light` class on <html> (default dark),
 *  set pre-paint by the inline script in the layout; this just flips it and
 *  remembers the choice. Deliberately not a sun/moon pill: a single contrast
 *  glyph that matches the sharp, bordered controls elsewhere. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("debrief-theme", next ? "light" : "dark");
    } catch {
      /* storage blocked: the toggle still works for this session */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${light ? "dark" : "light"} mode`}
      className={`flex size-9 items-center justify-center border border-line text-muted-ink transition-colors hover:border-amber hover:text-amber ${className}`}
    >
      <CircleHalf weight="bold" className="size-4" />
    </button>
  );
}
