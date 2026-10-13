# Deploying HR+ to Cloudflare

HR+ runs as one Cloudflare Worker with a D1 database and the Workers AI binding, at `hr.praxel.space`. Everything fits in the free plan.

Deploys run from GitHub Actions (`.github/workflows/deploy.yml`) on every push to `master`. The workflow finds or creates the `hr-plus` D1 database, applies migrations, loads the demo company if the database is empty, builds and deploys. The custom domain is declared in `wrangler.jsonc`, so Cloudflare creates the DNS record and certificate on the first deploy.

## One-time setup (works from a phone browser)

### 1. Create a Cloudflare API token

dash.cloudflare.com → My Profile → API Tokens → Create Token → **Create Custom Token**, with these permissions:

| Scope   | Permission       | Access |
| ------- | ---------------- | ------ |
| Account | Workers Scripts  | Edit   |
| Account | D1               | Edit   |
| Account | Workers AI       | Read   |
| Account | Account Settings | Read   |
| Zone    | Workers Routes   | Edit   |
| Zone    | DNS              | Edit   |
| Zone    | Zone             | Read   |

Account resources: your account. Zone resources: `praxel.space`. Create it and copy the token (it's shown once).

Your **Account ID** is on the right-hand side of any zone's Overview page in the dashboard (or under Workers & Pages).

### 2. Add both as GitHub secrets

github.com/O-FALLEN-ANGEL-O/HRMS → Settings → Secrets and variables → Actions → New repository secret:

- `CLOUDFLARE_API_TOKEN`: the token
- `CLOUDFLARE_ACCOUNT_ID`: the account ID

### 3. Deploy

Merge the PR, or open Actions → "Check and deploy" → Run workflow on `master`. When it finishes, https://hr.praxel.space is live.

## Check it

- Sign in as Rohan and clock in.
- Ask the HR assistant a question: the source chip should say "Workers AI".
- The Worker's Triggers tab shows the cron `30 20 * * *` (02:00 IST), which resets the demo data nightly. Set the `DEMO_MODE` variable to `false` to keep data.

## Deploying by hand instead

```bash
npx wrangler login
npx wrangler d1 create hr-plus        # put the id into wrangler.jsonc
npm run db:migrate:remote && npm run db:seed:remote
npm run deploy
```

## Updating the schema

Edit `src/db/schema.ts`, run `npm run db:generate`, commit the new file in `drizzle/migrations/`, push to `master`. The workflow applies it before deploying.

## Vercel

The old Vercel project (hrms-five-alpha.vercel.app) can't run this version, which needs Cloudflare's runtime. Disconnect the repo in Vercel (or delete the project) after the first Cloudflare deploy.
