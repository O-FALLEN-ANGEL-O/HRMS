import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;

// Exposes the bindings from wrangler.jsonc to `next dev`. D1 runs locally.
// Workers AI is remote-only, so it's enabled only when you opt in (and are
// logged in to Cloudflare); otherwise AI features use their rule-based fallbacks.
// Skipped on Vercel and other Node hosts, which use src/db/node-runtime.ts instead.
if (process.env.VERCEL !== "1" && process.env.HRP_RUNTIME !== "node") {
  initOpenNextCloudflareForDev({ remoteBindings: process.env.HRP_REMOTE_AI === "1" });
}
