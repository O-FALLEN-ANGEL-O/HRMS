# Deploying HR+ to Cloudflare

HR+ runs as one Cloudflare Worker with a D1 database and the Workers AI binding. Everything fits in the free plan, and setup works from a phone browser. You never create or copy an API token.

The app sets up its own database: on first run it applies any pending migrations from `drizzle/migrations` and loads the demo company if the database is empty. So the database only has to exist; Cloudflare's built-in deploy token doesn't need D1 permissions.

## One-time setup

### 1. Create the database

dash.cloudflare.com → Storage & databases → D1 SQL database → Create → name it `hrplus` → Create. Put its Database ID into `database_id` in `wrangler.jsonc` and push to `master`.

### 2. Connect the repo

Workers & Pages → Create → Import a repository → connect GitHub and pick `O-FALLEN-ANGEL-O/HRMS`. Then:

| Setting           | Value                                             |
| ----------------- | ------------------------------------------------- |
| Project name      | `hr-plus` (must match `name` in `wrangler.jsonc`) |
| Production branch | `master`                                          |
| Build command     | `npx opennextjs-cloudflare build`                 |
| Deploy command    | `npx opennextjs-cloudflare deploy`                |

Save and deploy. Every push to `master` redeploys.

### 3. Add the domain

Open the `hr-plus` Worker → Settings → Domains & Routes → Add → Custom domain → `hr.praxel.space`. Cloudflare creates the DNS record and certificate.

## Check it

- Open https://hr.praxel.space. The first load takes a few seconds while the demo company is created.
- Sign in as Rohan and clock in.
- Ask the HR assistant a question: the source chip should say "Workers AI".
- The Worker's cron `30 20 * * *` (02:00 IST) resets the demo data nightly. Set the `DEMO_MODE` variable to `false` to keep data.

## Updating the schema

Edit `src/db/schema.ts`, run `npm run db:generate` (it also regenerates `src/db/migrations.gen.ts`), commit both, push. The app applies the new migration on its next request. `wrangler d1 migrations apply` uses the same `d1_migrations` table, so either way works.

## Deploying by hand

```bash
npx wrangler login
npm run deploy
```

## Vercel

The old Vercel project (hrms-five-alpha.vercel.app) can't run this version, which needs Cloudflare's runtime. Disconnect the repo in Vercel (or delete the project) once the Cloudflare deploy is up.

# Deploying HR+ to Vercel

The same code runs on Vercel. Outside Cloudflare, `src/db/node-runtime.ts` stands in for the Worker bindings, so nothing else changes.

| Setup                                            | Database                                                                           | AI features          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------- |
| No env vars                                      | SQLite in the function's `/tmp` (self-seeding, per instance, resets on cold start) | Rule-based fallbacks |
| `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` | The **same D1 database** as the Worker, over Cloudflare's REST API                 | Workers AI over REST |

With the Cloudflare variables set, the Vercel and Cloudflare deployments share one database. Use the second row for a demo people will click through: serverless instances don't share `/tmp`.

## Steps

1. vercel.com → Add New → Project → import `O-FALLEN-ANGEL-O/HRMS`. Framework: Next.js (from `vercel.json`). Leave build settings at their defaults.
2. Environment variables (Production and Preview):
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare dashboard → Workers & Pages → Account ID in the right sidebar.
   - `CLOUDFLARE_API_TOKEN`: My Profile → API Tokens → Create Token → Custom token with **Account · D1 · Edit** and **Account · Workers AI · Read**.
   - `D1_DATABASE_ID` (optional): defaults to the `database_id` in `wrangler.jsonc`.
   - `CRON_SECRET`: any long random string. Vercel's cron sends it to `/api/cron/reset`, which reseeds the demo nightly at 02:00 IST (`DEMO_MODE=false` turns that off).
3. Deploy. Every push to `master` redeploys.

Run the Node build locally with `npm run dev:node` or `npm run build && npm run start:node`. Without the Cloudflare variables it uses `.data/hr-plus.sqlite`.
