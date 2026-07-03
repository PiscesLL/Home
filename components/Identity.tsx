import type { ReactNode } from "react";

import { site, type Keyword, type SocialLink } from "@/content/site";

export function Identity() {
  const { identity, keywords, techStack, social, site: meta } = site;

  return (
    <section className="relative flex flex-col justify-between border-b border-border-soft bg-surface-container-lowest p-6 sm:p-8 lg:w-1/3 lg:border-b-0 lg:border-r lg:p-10">
      <div className="space-y-7 sm:space-y-8 lg:overflow-y-auto lg:pr-2">
        <div className="pr-12 lg:pr-0">
          <h1 className="mb-2 font-serif text-[28px] font-semibold tracking-tight text-on-surface sm:text-[32px] lg:text-[48px] lg:leading-[1.1]">
            {identity.name}
          </h1>
          <p className="mb-4 font-serif text-[17px] tracking-wide text-on-surface sm:text-[18px] lg:text-[24px]">
            {identity.taglineZh}
          </p>
          <p className="mb-6 text-[14px] leading-relaxed text-secondary sm:text-[15px] lg:text-[16px]">
            {identity.bio}
          </p>
          <div className="flex flex-col gap-3 text-[13px] text-secondary">
            {identity.location && (
              <div className="flex items-center gap-2">
                <LocationIcon />
                <span>{identity.location}</span>
              </div>
            )}
            {identity.availability && (
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-mint-accent"
                  style={{ boxShadow: "0 0 6px rgb(var(--c-mint) / 0.65)" }}
                />
                <span>{identity.availability}</span>
              </div>
            )}
          </div>
        </div>

        {keywords.length > 0 && (
          <Block label="常折腾 KEYWORDS">
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <Tag key={k.label} tone={k.tone}>
                  {k.label}
                </Tag>
              ))}
            </div>
          </Block>
        )}

        {techStack.length > 0 && (
          <Block label="技术栈 TECH STACK">
            <div className="flex flex-col gap-2 rounded-lg border border-border-soft/40 bg-surface-container-low/50 p-3">
              {techStack.map((t, i) => (
                <div key={t.category}>
                  {i > 0 && <div className="mb-2 h-px w-full bg-border-soft/30" />}
                  <KV k={t.category} v={t.items} />
                </div>
              ))}
            </div>
          </Block>
        )}

        {social.length > 0 && (
          <Block label="到处逛逛 CONNECT">
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-primary">
              {social.map((s, i) => (
                <SocialEntry key={s.label} link={s} showSeparator={i > 0} />
              ))}
            </div>
          </Block>
        )}

        <div className="border-t border-border-soft/50 space-y-1.5 pt-6">
          <p className="text-[10px] uppercase tracking-wider text-text-muted/50">
            {meta.copyright}
          </p>
          {(site.beian.icp || site.beian.mps) && (
            <BeianFooter icp={site.beian.icp} mps={site.beian.mps} />
          )}
        </div>
      </div>
    </section>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted/70">
        {label}
      </h3>
      {children}
    </div>
  );
}

function Tag({ children, tone }: { children: ReactNode; tone: Keyword["tone"] }) {
  const cls =
    tone === "primary"
      ? "bg-mint-accent/[0.18] text-on-tertiary-fixed-variant border-mint-accent/30"
      : tone === "accent"
        ? "bg-mint-accent/[0.08] text-on-surface border-mint-accent/15"
        : "bg-surface-container text-primary border-border-soft/60";
  return (
    <span className={`rounded border px-2 py-0.5 text-[11px] font-medium ${cls}`}>{children}</span>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-sans text-[10px] font-semibold uppercase text-text-muted">{k}</span>
      <span className="font-serif text-[12px] text-on-surface">{v}</span>
    </div>
  );
}

function SocialEntry({ link, showSeparator }: { link: SocialLink; showSeparator: boolean }) {
  return (
    <>
      {showSeparator && <span className="text-border-soft">/</span>}
      <a
        href={link.url || "#"}
        className="transition-colors duration-300 hover:text-tertiary"
        style={{ transitionTimingFunction: "cubic-bezier(0.2,0.8,0.2,1)" }}
      >
        {link.label}
      </a>
    </>
  );
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-text-muted">
      <path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function BeianFooter({ icp, mps }: { icp: string; mps: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-text-muted/40">
      {icp && (
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-muted/70 transition-colors"
        >
          {icp}
        </a>
      )}
      {mps && (
        <a
          href="https://beian.mps.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-text-muted/70 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 32 32" fill="none" className="opacity-60">
            <path d="M16 2L4 6v10c0 7.2 5.1 13.8 12 15.2 6.9-1.4 12-8 12-15.2V6L16 2z" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M12 16l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          {mps}
        </a>
      )}
    </p>
  );
}
