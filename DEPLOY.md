# Deploying HR+ to Cloudflare

HR+ runs as one Cloudflare Worker with a D1 database and the Workers AI binding. Everything below fits in the free plan.

## 1. Create the database (once)

On your computer, in this repo:

```bash
npm install
npx wrangler login
npx wrangler d1 create hr-plus
```

Copy the `database_id` it prints into `wrangler.jsonc` (replace the `00000000-…` placeholder), commit and push.

Then create the tables and load the demo company:

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

## 2. Connect the repo (Workers Builds)

1. Cloudflare dashboard → Workers & Pages → Create → Import a repository → pick `O-FALLEN-ANGEL-O/HRMS`.
2. Project name: `hr-plus` (must match `name` in `wrangler.jsonc`).
3. Production branch: `master`.
4. Build command: `npx opennextjs-cloudflare build`
5. Deploy command: `npx wrangler d1 migrations apply DB --remote && npx opennextjs-cloudflare deploy`
6. Save and deploy.

Every push to `master` now builds and deploys; pushes to other branches get preview URLs. New migrations in `drizzle/migrations/` are applied before each deploy. If the build token lacks D1 permission, the migration step fails; then run `npm run db:migrate:remote` yourself and use `npx opennextjs-cloudflare deploy` as the deploy command.

## 3. Custom domain

Worker → Settings → Domains & Routes → Add → Custom domain → `hr.praxel.space`. This works because `praxel.space` is already a zone on your Cloudflare account; the DNS record and certificate are created for you.

## 4. Check it

- Open https://hr.praxel.space and sign in as Rohan; clock in.
- Ask the HR assistant a question: the source chip should say "Workers AI".
- Worker → Settings → Triggers shows the cron `30 20 * * *` (02:00 IST), which resets the demo data nightly. Remove it, or set the `DEMO_MODE` variable to `false`, to keep data.

## Updating the schema

Edit `src/db/schema.ts`, run `npm run db:generate`, commit the new file in `drizzle/migrations/`, push. The deploy command applies it.
