"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";

import { useTheme } from "@/systems/theme";

const SWITCH_CLASS = "theme-switching";
const SWITCH_DURATION = 280;

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();

  const onClick = useCallback(() => {
    const root = document.documentElement;
    root.classList.add(SWITCH_CLASS);
    toggle();
    window.setTimeout(() => root.classList.remove(SWITCH_CLASS), SWITCH_DURATION);
  }, [toggle]);

  const isDark = resolved === "dark";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      aria-pressed={isDark}
      whileHover={{ y: -1 }}
      whileTap={{ y: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className="
        absolute right-3 top-3 z-30
        flex h-9 w-9 items-center justify-center
        rounded-full border border-border-soft
        bg-surface-container-lowest text-on-surface-variant
        shadow-sm
        hover:border-mint-accent/40 hover:text-tertiary
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent/40
        sm:right-4 sm:top-4
        lg:right-6 lg:top-6
      "
    >
      <span className="relative block h-4 w-4">
        <SunIcon active={!isDark} />
        <MoonIcon active={isDark} />
      </span>
    </motion.button>
  );
}

function SunIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="absolute inset-0 h-full w-full transition-opacity duration-300"
      style={{ opacity: active ? 1 : 0, transform: active ? "rotate(0deg)" : "rotate(-90deg)" }}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="absolute inset-0 h-full w-full transition-opacity duration-300"
      style={{ opacity: active ? 1 : 0, transform: active ? "rotate(0deg)" : "rotate(90deg)" }}
    >
      <path d="M21 12.8A8.4 8.4 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" />
    </svg>
  );
}
