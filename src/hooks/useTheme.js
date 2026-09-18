import { useEffect, useState } from "react";

/* Shared light/dark preference for the .pcd-page dashboards (Panchshil,
   Rustomjee, Kalpataru usage dashboards). One storage key so switching
   theme on one dashboard is remembered on the others too - same behaviour
   as the reference wireframe's panchshil-theme toggle. */
const STORAGE_KEY = "pcd-theme";

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* localStorage unavailable (private mode, etc.) - fall through */
  }
  return getSystemTheme();
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* best-effort persistence only */
    }
  }, [theme]);

  // Follow the OS preference live, but only until the user picks explicitly.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      let saved = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch {
        /* treat as unsaved */
      }
      if (!saved) setTheme(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}
