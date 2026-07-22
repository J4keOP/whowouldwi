// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // Use a fresh module graph for the recovery branch. This prevents Lovable's preview
    // from hydrating current SSR HTML with a stale client-side route module.
    // Bump this whenever Lovable's preview hydrates a newly rendered route with
    // an older client bundle. The hierarchy redesign changes the component
    // shape substantially, so it needs a fresh client module graph.
    cacheDir: "node_modules/.vite-lovable-v3-explained-finishers-20260721",
    optimizeDeps: {
      force: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
