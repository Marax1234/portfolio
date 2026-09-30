// Unit-Tests (B25 S-07): nur reine Logik aus src/lib, ohne DB, ohne Payload-Boot, ohne Netz.
// Aliase wie in tsconfig.json; "@" greift nur für "@/…", nicht für "@payload-config".
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@payload-config": fileURLToPath(new URL("./src/payload.config.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
