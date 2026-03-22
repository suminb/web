import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(repoRoot, "data");

/** YAML/MD under data/ is read with fs, so Vite never invalidates those deps — force full reload in dev. */
function isInsideDataDir(filePath) {
  const rel = path.relative(dataDir, path.resolve(filePath));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

function watchDataDirFullReload() {
  return {
    name: "watch-data-full-reload",
    configureServer(server) {
      server.watcher.add(dataDir);
      const reload = (file) => {
        if (isInsideDataDir(file)) {
          server.hot.send({
            type: "full-reload",
            path: "*",
            triggeredBy: file,
          });
        }
      };
      server.watcher.on("change", reload);
      server.watcher.on("add", reload);
      server.watcher.on("unlink", reload);
    },
  };
}

export default defineConfig({
  site: "https://example.com",
  compressHTML: true,
  vite: {
    plugins: [watchDataDirFullReload()],
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },
});
