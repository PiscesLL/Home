"use client";

/**
 * Unified input layer (mouse + touch + pointer events).
 *
 * Exposes a stable ref-based snapshot — never goes through React state —
 * so subscribers (shader, fish) read live values inside their own ticker.
 *
 * Coordinates are in NDC (-1..1, y up) of the viewport. That keeps shader
 * sampling and on-screen fish coordinates in the same space.
 */

import { createContext, useContext, useEffect, useMemo, useRef } from "react";

import { lerp } from "@/lib/math";
import { ticker } from "@/systems/ticker";

export type InputState = {
  // Live, unsmoothed pointer in NDC. (0,0) center, x right, y up.
  raw: { x: number; y: number };
  // Smoothed (lerped) pointer in NDC — what consumers should usually read.
  position: { x: number; y: number };
  // Per-second velocity in NDC units.
  velocity: { x: number; y: number };
  // True while a finger / button is down.
  active: boolean;
  // True if pointer is currently over the page at all.
  present: boolean;
  // Time since last meaningful movement, seconds. Used to fade gravity.
  idleTime: number;
};

type InputRef = { current: InputState };

const makeState = (): InputState => ({
  raw: { x: 0, y: 0 },
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  active: false,
  present: false,
  idleTime: 999,
});

const InputContext = createContext<InputRef | null>(null);

export function InputProvider({ children }: { children: React.ReactNode }) {
  const stateRef = useRef<InputState>(makeState());

  useEffect(() => {
    const state = stateRef.current;
    let lastSmoothed = { x: 0, y: 0 };

    const toNdc = (clientX: number, clientY: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      return {
        x: (clientX / w) * 2 - 1,
        y: -((clientY / h) * 2 - 1),
      };
    };

    const updateRaw = (clientX: number, clientY: number) => {
      const p = toNdc(clientX, clientY);
      state.raw.x = p.x;
      state.raw.y = p.y;
      state.present = true;
      state.idleTime = 0;
    };

    const onMouseMove = (e: MouseEvent) => updateRaw(e.clientX, e.clientY);
    const onMouseDown = () => {
      state.active = true;
    };
    const onMouseUp = () => {
      state.active = false;
    };
    const onMouseLeave = () => {
      state.present = false;
    };
    const onMouseEnter = () => {
      state.present = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      updateRaw(t.clientX, t.clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      updateRaw(t.clientX, t.clientY);
      state.active = true;
    };
    const onTouchEnd = () => {
      state.active = false;
      // Keep last position; touch leaves screen but shouldn't snap.
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // High priority — input must update before consumers read.
    const unsubscribe = ticker.subscribe((dt) => {
      // Smoothing factor: heavier smoothing for slower devices is fine,
      // here we use a frame-rate-independent lerp.
      const k = 1 - Math.exp(-dt * 12);
      const prevX = state.position.x;
      const prevY = state.position.y;
      state.position.x = lerp(state.position.x, state.raw.x, k);
      state.position.y = lerp(state.position.y, state.raw.y, k);

      // Velocity in NDC units / second.
      if (dt > 0) {
        state.velocity.x = (state.position.x - prevX) / dt;
        state.velocity.y = (state.position.y - prevY) / dt;
      }

      // Decay idle once raw stops moving.
      state.idleTime += dt;

      lastSmoothed = state.position;
      void lastSmoothed;
    }, -100);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      unsubscribe();
    };
  }, []);

  const value = useMemo<InputRef>(() => ({ current: stateRef.current }), []);
  return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
}

export function useInput(): InputRef {
  const ctx = useContext(InputContext);
  if (!ctx) throw new Error("useInput must be used inside <InputProvider>");
  return ctx;
}
