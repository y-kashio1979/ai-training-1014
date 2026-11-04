import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // lib/ の関数だけをテストする。画面のテストはしないので DOM は不要。
    environment: "node",
    include: ["lib/**/*.test.ts"],
    passWithNoTests: true,
  },
});
