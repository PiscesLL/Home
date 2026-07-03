"use client";

import { motion } from "framer-motion";

import { site, type NavCardItem } from "@/content/site";
import { useRuntime } from "@/systems/runtime";

export function Navigation() {
  const items = site.navigation;
  return (
    <section className="flex h-full flex-col justify-center bg-surface-bright p-6 sm:p-8 lg:w-2/3 lg:p-20">
      <div className="mx-auto w-full max-w-2xl">
        <h3 className="mb-8 text-center text-[12px] font-semibold uppercase tracking-widest text-text-muted/70">
          Navigation
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {items.map((item, i) => (
            <NavCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NavCard({ item, index }: { item: NavCardItem; index: number }) {
  const { prefersReducedMotion } = useRuntime();
  return (
    <motion.a
      href={item.url || "#"}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 0.16 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { y: 0 }}
      className="group/card flex items-center justify-between rounded-xl border border-border-soft/60 bg-surface-container-low p-5 sm:p-6 transition-all duration-300 hover:border-mint-accent/30 hover:bg-surface-container hover:shadow-glow-mint"
      style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg border border-border-soft bg-surface-bright text-primary shadow-sm transition-colors group-hover/card:text-tertiary">
          <CardIcon name={item.icon} />
        </div>
        <div className="flex flex-col">
          <span className="text-[18px] font-semibold text-on-surface">{item.title}</span>
          <span className="text-[13px] text-text-muted/60">{item.subtitle}</span>
        </div>
      </div>
      <ArrowIcon />
    </motion.a>
  );
}

function CardIcon({ name }: { name: NavCardItem["icon"] }) {
  const stroke = "currentColor";
  if (name === "terminal") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 10l3 2-3 2" />
        <path d="M12 15h5" />
      </svg>
    );
  }
  if (name === "doc") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.4">
      <path d="M3 7l9 4 9-4" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M3 7l9-4 9 4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="text-text-muted/30 transition-transform duration-300 group-hover/card:translate-x-1"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
