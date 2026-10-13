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
