"use client";

/**
 * Device adaptive rendering tier.
 *
 *   desktop-full  — pointer:fine, dpr ok, hw concurrency >= 4   → all systems
 *   mobile-lite   — coarse pointer or narrow viewport            → trimmed
 *   low-end       — reduced-motion, tiny dpr, slow CPU heuristic → cheapest
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type DeviceTier = "desktop-full" | "mobile-lite" | "low-end";

export type RuntimeProfile = {
  tier: DeviceTier;
  starDensity: number; // multiplier 0..1.5
  gravityIntensity: number; // 0..1
  fishComplexity: 0 | 1 | 2; // count basically
  flowLayer: boolean;
  prefersReducedMotion: boolean;
  isTouch: boolean;
  dpr: number;
};

const DEFAULT_PROFILE: RuntimeProfile = {
  tier: "desktop-full",
  starDensity: 1,
  gravityIntensity: 1,
  fishComplexity: 2,
  flowLayer: true,
  prefersReducedMotion: false,
  isTouch: false,
  dpr: 1,
};

const RuntimeContext = createContext<RuntimeProfile>(DEFAULT_PROFILE);

function detect(): RuntimeProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  const isTouch = coarse || "ontouchstart" in window;
  const cores = navigator.hardwareConcurrency ?? 4;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let tier: DeviceTier = "desktop-full";
  if (reduced || cores <= 2) tier = "low-end";
  else if (coarse || narrow) tier = "mobile-lite";

  if (tier === "desktop-full") {
    return {
      tier,
      starDensity: 1,
      gravityIntensity: 1,
      fishComplexity: 2,
      flowLayer: true,
      prefersReducedMotion: false,
      isTouch,
      dpr,
    };
  }
  if (tier === "mobile-lite") {
    return {
      tier,
      starDensity: 0.55,
      gravityIntensity: 0.6,
      fishComplexity: 2,
      flowLayer: false,
      prefersReducedMotion: false,
      isTouch,
      dpr: Math.min(dpr, 1.5),
    };
  }
  return {
    tier: "low-end",
    starDensity: 0.3,
    gravityIntensity: 0.25,
    fishComplexity: 1,
    flowLayer: false,
    prefersReducedMotion: reduced,
    isTouch,
    dpr: 1,
  };
}

export function RuntimeProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<RuntimeProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    setProfile(detect());
    const onResize = () => setProfile(detect());
    window.addEventListener("resize", onResize);
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMql = () => setProfile(detect());
    mql.addEventListener?.("change", onMql);
    return () => {
      window.removeEventListener("resize", onResize);
      mql.removeEventListener?.("change", onMql);
    };
  }, []);

  const value = useMemo(() => profile, [profile]);
  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export const useRuntime = () => useContext(RuntimeContext);
