import type { Config } from "tailwindcss";
import tokens from "./data/design-tokens.json";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: tokens.colors.primary,
          light: tokens.colors.primaryLight,
          dark: tokens.colors.primaryDark,
        },
        announcement: tokens.colors.announcement,
        surface: tokens.colors.surface,
        border: tokens.colors.border,
        "border-light": tokens.colors.borderLight,
        sale: tokens.colors.sale,
        "epic-deal": tokens.colors.tagEpicDeal,
        success: tokens.colors.success,
        "footer-bg": tokens.colors.footer,
        "rating-stars": tokens.colors.ratingStars,
        "checkout-complete": tokens.colors.checkoutComplete,
        "input-text": tokens.colors.inputText,
        "input-border": tokens.colors.inputBorder,
        "text-primary": tokens.colors.text.primary,
        "text-secondary": tokens.colors.text.secondary,
        "text-muted": tokens.colors.text.muted,
      },
      fontFamily: {
        heading: ["Currys Sans Headline", "CurrysSans-Regular", "sans-serif"],
        body: ["Currys Sans", "CurrysSans-Regular", "sans-serif"],
      },
      fontSize: {
        xs: tokens.typography.sizes.xs,
        sm: tokens.typography.sizes.sm,
        base: tokens.typography.sizes.base,
        lg: tokens.typography.sizes.lg,
        xl: tokens.typography.sizes.xl,
        "2xl": tokens.typography.sizes["2xl"],
        "3xl": tokens.typography.sizes["3xl"],
      },
      maxWidth: {
        container: tokens.spacing.containerMaxWidth,
      },
      borderRadius: {
        sm: tokens.borderRadius.sm,
        md: tokens.borderRadius.md,
        lg: tokens.borderRadius.lg,
        pill: tokens.borderRadius.pill,
        input: tokens.borderRadius.input,
      },
      boxShadow: {
        card: tokens.components.card.shadow,
      },
      screens: {
        sm: tokens.breakpoints.sm,
        md: tokens.breakpoints.md,
        lg: tokens.breakpoints.lg,
        xl: tokens.breakpoints.xl,
      },
    },
  },
  plugins: [],
};
export default config;
