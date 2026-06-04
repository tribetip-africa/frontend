# TribeTip Frontend

Next.js app for [TribeTip](https://tribetip.africa) — a Buy Me a Coffee–style creator tipping platform built for Africa.

## Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS v4

## API routes wired

| Action | Rails endpoint |
|--------|----------------|
| Health check | `GET /up` |
| Sign up | `POST /tribes.json` |
| Sign in | `POST /tribes/sign_in.json` |
| Sign out | `DELETE /tribes/sign_out.json` |

## Development

1. Start the Rails API on port **3001** (so Next.js can use 3000):

   ```bash
   cd ../tribetip
   bin/rails server -p 3001
   ```

2. Copy env and start the frontend:

   ```bash
   cp .env.local.example .env.local
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

Platform URLs default by environment:

| | Development | Production |
|--|--|--|
| App | `http://localhost:3000` | `https://tribetip.africa` |
| API | `http://localhost:3001` | `https://api.tribetip.africa` |

Override via `.env.local` (`NEXT_PUBLIC_TRIBETIP_PLATFORM_URL`, `NEXT_PUBLIC_API_URL`).

## Tests (Jest)

```bash
npm test              # run all unit tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

## Caching (security-first)

| Route type | Policy | Behavior |
|------------|--------|----------|
| Auth (`/sign-in`, `/sign-up`, API auth) | `noStore` | Never cached |
| Dashboard | `noStore` | Private, no CDN cache |
| Landing `/` | `staticPage` | Short public edge cache |
| Public creator API | `publicShort` | 60s revalidate |

Middleware sets `Cache-Control` headers. API client uses `secureFetch()`.

Covered by Jest in `src/lib/cache-policy.test.ts` and `src/lib/secure-fetch.test.ts`.

## Live tests (Playwright)

Run against local API + Next dev servers:

```bash
npm run test:live
```

## CI — live job secret

The **Live tests** workflow job checks out the private [`tribetip-africa/tribetip`](https://github.com/tribetip-africa/tribetip) API repo. GitHub’s default `GITHUB_TOKEN` only has access to this frontend repository, so cross-repo checkout returns **Not Found** unless you add a PAT.

1. Create a fine-grained personal access token with **read** access to `tribetip-africa/tribetip` (or a classic PAT with `repo` scope for that repository).
2. In **tribetip-africa/frontend** → Settings → Secrets and variables → Actions, add:

   | Name | Value |
   |------|--------|
   | `TRIBETIP_CHECKOUT_TOKEN` | your PAT |

3. Re-run the workflow. Without this secret, the live job fails immediately with a clear error instead of `Not Found` on checkout.
