/**
 * Single global RAF ticker.
 *
 * All systems (input / fish / shader) subscribe here instead of running their
 * own requestAnimationFrame loop. This guarantees a single browser scheduling
 * point, predictable subscriber order, and a clean pause when the tab is
 * hidden.
 */

export type TickFn = (dt: number, t: number) => void;

type Subscriber = { fn: TickFn; priority: number };

class Ticker {
  private subs: Subscriber[] = [];
  private rafId: number | null = null;
  private last = 0;
  private start = 0;
  private running = false;

  subscribe(fn: TickFn, priority = 0) {
    const sub = { fn, priority };
    this.subs.push(sub);
    this.subs.sort((a, b) => a.priority - b.priority);
    if (!this.running) this.play();
    return () => {
      const idx = this.subs.indexOf(sub);
      if (idx >= 0) this.subs.splice(idx, 1);
      if (this.subs.length === 0) this.pause();
    };
  }

  private loop = (now: number) => {
    if (!this.running) return;
    if (this.last === 0) {
      this.last = now;
      this.start = now;
    }
    // Cap dt to avoid huge jumps when tab returns from background.
    const dt = Math.min((now - this.last) / 1000, 1 / 30);
    const t = (now - this.start) / 1000;
    this.last = now;
    for (const s of this.subs) s.fn(dt, t);
    this.rafId = requestAnimationFrame(this.loop);
  };

  play() {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.rafId = requestAnimationFrame(this.loop);
  }

  pause() {
    this.running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.last = 0;
  }
}

export const ticker = new Ticker();

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) ticker.pause();
    else if ((ticker as unknown as { subs: unknown[] }).subs.length > 0) ticker.play();
  });
}
