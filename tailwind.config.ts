import type { Config } from "tailwindcss";

const rgb = (token: string) => `rgb(var(${token}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./systems/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: rgb("--c-page"),
        surface: rgb("--c-surface"),
        "surface-bright": rgb("--c-surface-bright"),
        "surface-container-lowest": rgb("--c-surface-container-lowest"),
        "surface-container-low": rgb("--c-surface-container-low"),
        "surface-container": rgb("--c-surface-container"),
        "surface-container-high": rgb("--c-surface-container-high"),
        "on-surface": rgb("--c-on-surface"),
        "on-surface-variant": rgb("--c-on-surface-variant"),
        primary: rgb("--c-primary"),
        secondary: rgb("--c-secondary"),
        tertiary: rgb("--c-tertiary"),
        "on-tertiary-fixed-variant": rgb("--c-on-tertiary-fixed-variant"),
        "border-soft": rgb("--c-border-soft"),
        "text-muted": rgb("--c-text-muted"),
        "mint-accent": rgb("--c-mint"),
      },
      fontFamily: {
        serif: ["var(--font-serif)", '"PingFang SC"', "serif"],
        sans: ["var(--font-inter)", '"PingFang SC"', '"Microsoft YaHei"', "sans-serif"],
      },
      maxWidth: {
        "container-max": "720px",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "glow-mint": "var(--shadow-glow-mint)",
      },
    },
  },
  plugins: [],
};

export default config;
