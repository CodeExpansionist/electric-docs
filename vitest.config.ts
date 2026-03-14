import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const alias = { "@": path.resolve(__dirname, "./src") };

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          exclude: ["tests/component/**", "e2e/**"],
          environment: "node",
        },
      },
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: "component",
          include: ["tests/component/**/*.test.tsx"],
          exclude: ["tests/unit/**", "e2e/**"],
          environment: "jsdom",
          globals: true,
          setupFiles: ["./tests/setup.ts"],
          css: false,
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.{ts,tsx}"],
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
    },
  },
});
