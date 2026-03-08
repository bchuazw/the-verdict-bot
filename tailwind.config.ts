import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: "hsl(var(--gold))",
        "gold-dim": "hsl(var(--gold-dim))",
        burgundy: "hsl(var(--burgundy))",
        "burgundy-light": "hsl(var(--burgundy-light))",
        "verdict-nta": "hsl(var(--verdict-nta))",
        "verdict-yta": "hsl(var(--verdict-yta))",
        "verdict-esh": "hsl(var(--verdict-esh))",
        "verdict-nah": "hsl(var(--verdict-nah))",
        "gold-bright": "hsl(var(--gold-bright))",
        "navy-mid": "hsl(var(--navy-mid))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gavel-slam": {
          "0%": { transform: "rotate(-30deg) translateY(-20px)", opacity: "0" },
          "60%": { transform: "rotate(5deg) translateY(2px)" },
          "100%": { transform: "rotate(0deg) translateY(0)", opacity: "1" },
        },
        "meter-fill": {
          from: { width: "0%" },
          to: { width: "var(--meter-width)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "typewriter": {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 10px hsl(43 80% 55% / 0.2)" },
          "50%": { boxShadow: "0 0 30px hsl(43 80% 55% / 0.4)" },
        },
        "stamp": {
          "0%": { transform: "scale(3) rotate(-15deg)", opacity: "0" },
          "50%": { transform: "scale(1.1) rotate(2deg)", opacity: "0.8" },
          "70%": { transform: "scale(0.95) rotate(-1deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gavel-slam": "gavel-slam 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "meter-fill": "meter-fill 1.5s ease-out forwards",
        "fade-up": "fade-up 0.6s ease-out",
        "typewriter": "typewriter 2s steps(40) forwards",
        "pulse-gold": "pulse-gold 2s infinite",
        "stamp": "stamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
