import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://example.com",
  compressHTML: true,
  vite: {
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },
});
