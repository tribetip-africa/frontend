# TribeTip Frontend

Next.js app for [TribeTip](https://tribetip.africa) — a Buy Me a Coffee–style creator tipping platform built for Africa.

The API lives in the sibling [`tribetip`](../tribetip) repository.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript + Tailwind CSS v4
- Jest (unit tests) and Playwright (live tests)

## App routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/sign-in`, `/sign-up` | Creator auth |
| `/[username]` | Public creator tip page |
| `/t/[token]` | Opaque share-link tip page |
| `/dashboard` | Creator home |
| `/dashboard/tips` | Tip history |
| `/dashboard/payouts` | Earnings, withdrawals, settlements |
| `/dashboard/public-page` | Profile + QR share code |
| `/dashboard/account` | Account settings |
| `/dashboard/accounts` | Admin tribe management |

## Development

1. Start the Rails API on port **3001** (Next.js uses 3000):

   ```bash
   cd ../tribetip
   bin/rails server -p 3001
   ```

   Or use Docker from the API repo: `bin/docker up --build` (API on `http://localhost:3001`).

2. Copy env and install dependencies:

   ```bash
   cp .env.local.example .env.local
   npm ci
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

### URLs by environment

| | Development | Production |
|--|--|--|
| App | `http://localhost:3000` | `https://tribetip.africa` |
| API | `http://localhost:3001` | `https://api.tribetip.africa` |

Override in `.env.local` with `NEXT_PUBLIC_TRIBETIP_PLATFORM_URL` and `NEXT_PUBLIC_API_URL`.

Region launch flags must match the API when overriding (`NEXT_PUBLIC_ENABLED_REGIONS`, `NEXT_PUBLIC_REGION_*_ENABLED`).

## Scripts

```bash
npm run dev            # Next.js dev server
npm run lint           # ESLint (--max-warnings 0)
npm run typecheck      # tsc --noEmit
npm test               # Jest unit tests
npm run test:watch     # Jest watch mode
npm run test:coverage  # Jest with coverage
npm run test:errors    # Error-handling unit tests only
npm run test:live      # Playwright against local API + web servers
npm run build          # Production build
npm run ci             # lint + typecheck + test + test:errors + build
```

## Caching (security-first)

| Route type | Policy | Behavior |
|------------|--------|----------|
| Auth (`/sign-in`, `/sign-up`, API auth) | `noStore` | Never cached |
| Dashboard | `noStore` | Private, no CDN cache |
| Share tip pages (`/t/*`) | `noStore` | Opaque links are not CDN-cached |
| Landing `/` | `staticPage` | Short public edge cache |
| Public creator API | `publicShort` | 60s revalidate |

Middleware sets `Cache-Control` headers. The API client uses `secureFetch()`.

Covered by Jest in `src/lib/cache-policy.test.ts` and `src/lib/secure-fetch.test.ts`.

## Live tests (Playwright)

Requires a running API and Next dev server:

```bash
npm run test:live
```

Set `LIVE_API_URL`, `LIVE_WEB_URL`, and `TRIBETIP_DIR` if your layout differs from the defaults in `scripts/run-live-tests.mjs`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`:

- Lint (ESLint)
- Typecheck
- Unit tests + error-handling tests
- Production build
- Security audit (`npm audit --audit-level=high --omit=dev`)
- Live tests (optional; see below)

Run the same checks locally:

```bash
npm run ci
```

### Run CI locally with act

```bash
act push -W .github/workflows/ci.yml --container-architecture linux/amd64 --concurrent-jobs 1
```

Use `--concurrent-jobs 1` so parallel Node setup jobs do not race inside act. Live tests are skipped unless `TRIBETIP_LIVE_CI=true` is set as a repository variable.

### Enabling live tests in GitHub Actions

The **Live tests** job checks out the private [`tribetip-africa/tribetip`](https://github.com/tribetip-africa/tribetip) API repo. GitHub’s default `GITHUB_TOKEN` cannot access other private repos, so you need a PAT plus a repo variable to opt in (workflow `if:` cannot reference `secrets`).

1. Create a fine-grained personal access token with **read** access to `tribetip-africa/tribetip` (or a classic PAT with `repo` scope for that repository).
2. In **tribetip-africa/frontend** → Settings → Secrets and variables → Actions:

   **Secret**

   | Name | Value |
   |------|--------|
   | `TRIBETIP_CHECKOUT_TOKEN` | your PAT |

   **Variable** (Repository variables tab)

   | Name | Value |
   |------|--------|
   | `TRIBETIP_LIVE_CI` | `true` |

3. Re-run the workflow. Without the variable, the live job is **skipped** and other CI jobs still pass.
