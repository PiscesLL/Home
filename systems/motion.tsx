"use client";

/**
 * Motion primitives.
 *
 * The system favors restraint: small offsets (8px), long-ish durations
 * (450–650ms), Apple-style "soft" cubic-bezier. Hover states never change
 * geometry — only background / border / lift via translateY(-1px).
 *
 * All primitives respect prefers-reduced-motion via the runtime.
 */

import { motion, type HTMLMotionProps, type Transition, type Variants } from "framer-motion";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";

import { useRuntime } from "@/systems/runtime";

export const SOFT_EASE = [0.2, 0.8, 0.2, 1] as const;
export const ENTER_EASE = [0.16, 1, 0.3, 1] as const;

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function FadeInUp({
  children,
  delay = 0,
  className,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const { prefersReducedMotion } = useRuntime();
  const transition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.65, ease: ENTER_EASE, delay };
  return (
    <motion.div
      className={className}
      variants={fadeUpVariants}
      initial="hidden"
      animate="show"
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  step = 0.08,
  baseDelay = 0,
  className,
}: {
  children: ReactNode;
  step?: number;
  baseDelay?: number;
  className?: string;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <div className={className}>
      {items.map((child, i) => {
        const delay = baseDelay + i * step;
        // If child is already a FadeInUp, just inject delay; else wrap.
        if (isValidElement(child) && child.type === FadeInUp) {
          return cloneElement(child as React.ReactElement<{ delay?: number }>, {
            key: i,
            delay,
          });
        }
        return (
          <FadeInUp key={i} delay={delay}>
            {child}
          </FadeInUp>
        );
      })}
    </div>
  );
}

/**
 * Card with a subtle "lift + glow" on hover. Geometry is preserved —
 * we only animate translateY a tiny amount and let CSS handle the
 * border/background hover state.
 */
export function HoverLift({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  const { prefersReducedMotion } = useRuntime();
  return (
    <motion.div
      className={className}
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { y: 0 }}
      transition={{ duration: 0.35, ease: SOFT_EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
