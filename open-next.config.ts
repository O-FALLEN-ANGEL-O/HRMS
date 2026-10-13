import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page is per-user and rendered on demand, so no incremental cache is configured.
export default defineCloudflareConfig({});
