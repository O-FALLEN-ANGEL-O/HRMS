// Bindings declared in wrangler.jsonc. Regenerate with `npm run cf-typegen` after changing it.
interface CloudflareEnv {
  DB: D1Database;
  AI: Ai;
  ASSETS: Fetcher;
  WORKER_SELF_REFERENCE: Fetcher;
  DEMO_MODE: string;
}
