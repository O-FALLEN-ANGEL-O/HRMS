# HR+

An HRMS for a small Indian company, built as a working demo: attendance, time off, expenses, Indian payroll, hiring, onboarding, goals, a helpdesk and an HR assistant that answers from the company's own policies.

Pick a person on the landing page (admin, HR, manager, employee or recruiter) and the app shows what that role can see and do. Everything is real: requests flow up the reporting line, approvals change balances, payroll reads approved leave and expenses, and every change is stored in Cloudflare D1. The fictional company, Northwind Labs, resets every night.

## What's in it

| Area | What works |
| --- | --- |
| Workday | Clock in/out (office, remote, field, optional location), monthly attendance heatmap, corrections with manager approval, CSV export |
| Time off | Balances per leave type, half days, holiday-aware day counts, overlap and balance checks, team calendar, cancel |
| Approvals | One inbox for leave, attendance and expenses, with who-else-is-off context and bulk approve |
| Expenses | Claims with policy limits (internet ₹1,000, 30-day window), learning budget, paid through payroll |
| Payroll | Salary structures from CTC, PF, ESI, Karnataka PT, new-regime TDS estimate, LOP and joiner proration, reimbursements, payroll check, finalize and printable payslips |
| People | Directory, profiles with reporting line, editable org chart, add employee, start exit |
| Joiners & leavers | Onboarding/offboarding checklists created automatically; status updates when the last step is done |
| Recruitment | Roles, drag-and-drop pipeline, resume match scores with interview questions, hiring creates the employee and onboarding checklist |
| Goals & reviews | OKRs with key results, team and company goals, manager reviews with an AI-drafted summary |
| Helpdesk | Tickets sorted into IT/HR/Payroll/Facilities and prioritised automatically, routed, threaded replies |
| HR assistant | Chat answers grounded in the policies in Settings plus your own leave balance |
| Engagement | Announcements, kudos, eNPS and pulse surveys (anonymous totals) |
| Analytics | Headcount, attrition, tenure, attendance and leave trends, each chart with a table view |
| Admin | Policies (the assistant's knowledge), leave types, holidays, activity log, demo reset |

## Stack

- Next.js 16 (App Router, server actions) and React 19, TypeScript
- Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare)
- Cloudflare D1 (SQLite) with Drizzle ORM and migrations
- Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) for resume matching, ticket triage, review drafts, payroll checks and the assistant. Each feature has a rule-based fallback and the UI says which one answered.
- Tailwind CSS 4, Radix primitives, Motion, Recharts, cmdk, dnd-kit
- Vitest for the payroll engine and AI fallbacks

## Run it locally

Needs Node 20+.

```bash
npm install
npm run db:migrate:local     # create the local D1 database
npm run db:seed:local        # load Northwind Labs
npm run dev                  # http://localhost:3000
```

Local D1 runs on your machine with no Cloudflare account. Workers AI only runs on Cloudflare, so locally the AI features use their fallbacks. To use the real models in dev, log in with `npx wrangler login` and start with `HRP_REMOTE_AI=1 npm run dev`.

Other scripts: `npm test`, `npm run typecheck`, `npm run format`, `npm run preview` (production build in the Workers runtime), `npm run db:generate` (new migration after editing `src/db/schema.ts`).

## Deploy

See [DEPLOY.md](DEPLOY.md) for Cloudflare setup, Git-based deploys and the custom domain.

## Project layout

```
src/app/              routes; (app)/ is everything behind sign-in
src/app/actions/      server actions, one file per area, all validated with zod
src/db/               schema, client, seed and reset
src/lib/              auth and permissions, payroll engine, AI helpers, queries
worker.ts             Worker entry: the Next.js app plus the nightly reset cron
drizzle/migrations/   SQL migrations applied by wrangler
```

Built by [Prajwal DL](https://praxel.space/).
