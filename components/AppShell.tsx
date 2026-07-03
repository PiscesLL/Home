"use client";

import { Cosmos } from "@/components/cosmos/Cosmos";
import { Identity } from "@/components/Identity";
import { Navigation } from "@/components/Navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InputProvider } from "@/systems/input";
import { RuntimeProvider } from "@/systems/runtime";
import { ThemeProvider } from "@/systems/theme";

/**
 * Page shell — composes runtime + input + theme providers, then the cosmos
 * layer underneath the editorial card. The card sits at z-20 so cursor
 * still gravitates the bg behind/around it.
 */
export function AppShell() {
  return (
    <ThemeProvider>
      <RuntimeProvider>
        <InputProvider>
          <Cosmos />
          <main
            className="
              relative z-20 flex w-full
              min-h-[100svh] lg:min-h-screen
              items-stretch justify-center
              p-3 pt-[max(0.75rem,env(safe-area-inset-top))]
              pb-[max(0.75rem,env(safe-area-inset-bottom))]
              sm:p-6
              lg:items-center lg:p-8
            "
          >
            <article
              className="
                relative flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl
                border border-border-soft bg-surface-bright shadow-card
                h-auto
                lg:h-[min(800px,calc(100vh-2rem))] lg:flex-row
              "
            >
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-mint-accent/40 to-transparent"
              />
              <ThemeToggle />
              <Identity />
              <Navigation />
            </article>
          </main>
        </InputProvider>
      </RuntimeProvider>
    </ThemeProvider>
  );
}
