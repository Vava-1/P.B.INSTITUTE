# Pacemaker Institute

A full-stack web application for Pacemaker Institute, a vocational training center in Kigali, Rwanda.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS, shadcn/ui
- **Backend:** Hono, tRPC v11, Drizzle ORM, MySQL
- **Auth:** OAuth 2.0 with JWT sessions (separate JWT secret for sessions vs. OAuth client secret)
- **Payments:** MTN MoMo API integration (server-side amount verification, webhook, idempotency)
- **Email:** Resend (HTML-escaped templates)

## Getting Started (Local)

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your real values (DATABASE_URL, AUTH_URL, APP_ID, APP_SECRET, SESSION_SECRET, JWT_SECRET, etc.)

# Run database migrations
npm run db:push:dev

# Seed the database (creates the first admin from SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD)
npm run db:seed

# Start development server (Vite + Hono dev server on http://localhost:3000)
npm run dev
```

## Project Structure

```
app/
├── api/          # Backend API (Hono + tRPC)
│   ├── lib/      # Infra (env, jwt, cookies, rate-limiter, mtn-momo, email, vite)
│   ├── auth/     # OAuth/JWT
│   ├── queries/  # Data access
│   └── *-router.ts  # tRPC routers (public, auth, admin)
├── contracts/    # Shared types and constants
├── db/           # Database schema (Drizzle ORM)
├── public/       # Static assets (logo, sitemap, robots, manifest)
├── scripts/      # Maintenance scripts (backup)
└── src/          # Frontend React application
    ├── components/  # UI components (shadcn/ui primitives + layout)
    ├── hooks/       # Custom hooks
    ├── pages/       # Route pages
    └── providers/   # tRPC provider
```

## Deployment — Railway

This app is configured for one-click Railway deployment via the included `Dockerfile` and `railway.toml`.

### 1. Create a new Railway project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Select the `P.B.INSTITUTE` repo.
3. Railway auto-detects the `Dockerfile` and builds it.

### 2. Add a MySQL database

1. In the Railway project, click **+** → **Database** → **Add MySQL**.
2. Railway creates a MySQL instance and exposes connection variables (`MYSQL_URL`, `MYSQLHOST`, etc.).
3. In your **web service** → **Variables**, set `DATABASE_URL=${{ MySQL.MYSQL_URL }}` (or `${{ MySQL.MYSQL_PUBLIC_URL }}` if you need external access).

### 3. Configure environment variables

In the web service → **Variables** → **Raw Editor**, paste from `.env.example` and fill in:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${{ MySQL.MYSQL_URL }}` (reference) |
| `AUTH_URL` | Your OAuth IdP URL |
| `OPEN_URL` | Your Open Platform URL |
| `APP_ID` | OAuth app ID |
| `APP_SECRET` | OAuth client secret |
| `SESSION_SECRET` | `openssl rand -hex 32` (different from APP_SECRET) |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `SEED_ADMIN_EMAIL` | First admin's email |
| `SEED_ADMIN_PASSWORD` | A strong password |
| `VITE_AUTH_URL` | Same as `AUTH_URL` |
| `VITE_APP_ID` | Same as `APP_ID` |
| `RESEND_API_KEY` | (optional) Resend key |
| `MTN_MOMO_SUBSCRIPTION_KEY` | From MTN MoMo portal |
| `MTN_MOMO_API_USER` | From MTN MoMo portal |
| `MTN_MOMO_API_KEY` | From MTN MoMo portal |
| `MTN_MOMO_ENVIRONMENT` | `sandbox` or `production` |
| `MTN_MOMO_CALLBACK_HOST` | Your Railway public URL (e.g. `https://your-app.up.railway.app`) |

> ⚠️ **Security:** Never commit real secrets. The `SEED_ADMIN_PASSWORD` is only read during `npm run db:seed`; rotate it after the first admin is created.

### 4. Run database migrations

Railway's `railway.toml` runs `npm run db:migrate:prod` automatically as a preDeploy hook. If you'd rather run it manually:

```bash
# In Railway → your web service → Settings → "Railway CLI"
railway run npm run db:push:dev   # first deploy, creates tables
railway run npm run db:seed       # creates the first admin
```

### 5. Configure the public URL

1. In Railway → your web service → **Settings** → **Networking** → **Generate Domain**.
2. Copy the generated `https://your-app.up.railway.app` URL.
3. Set `MTN_MOMO_CALLBACK_HOST` to that URL.
4. Update your OAuth IdP's allowed redirect URIs to include `https://your-app.up.railway.app/api/oauth/callback`.

### 6. Configure MTN MoMo webhook

In the MTN MoMo Developer Portal, set the callback URL for your subscription to:

```
https://your-app.up.railway.app/api/momo/webhook
```

This enables payment status to be finalized even if the user closes their browser after paying.

### 7. Auto-deploy

Railway auto-deploys on every push to your default branch (usually `main`). To disable, go to **Settings** → **Deployments** → turn off "Automatic Deployments".

## Health Check

- **Endpoint:** `GET /health`
- **Response:** `{ "status": "ok", "db": "connected", "uptime": <seconds>, "version": "<version>" }`
- Railway uses this to know when the container is ready (configured in `Dockerfile` + `railway.toml`).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (frontend + Hono API on port 3000) |
| `npm run build` | Build SPA (`vite build`) + server bundle (`esbuild api/boot.ts`) |
| `npm start` | Start production server (`node dist/boot.js`) |
| `npm run lint` | Run ESLint |
| `npm run check` | TypeScript type-check (no emit) |
| `npm run format` | Prettier write |
| `npm test` | Run Vitest |
| `npm run db:push:dev` | Push schema to dev DB (creates/alters tables) |
| `npm run db:migrate:prod` | Run generated migrations against prod DB |
| `npm run db:seed` | Seed the database (creates admin from `SEED_ADMIN_*` env vars) |

## Security Notes

- **Admin credentials** are sourced from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars at seed time. They are never committed.
- **OAuth `state`** is a random nonce bound to a cookie — protects against login-CSRF.
- **Session cookies** are `httpOnly`, `SameSite=Lax`, `Secure` (in production), 30-day expiry.
- **Admin JWT** is separate from the OAuth client secret (`JWT_SECRET` vs. `APP_SECRET`), 8h expiry.
- **RBAC** is enforced: `super_admin` only for user management + site settings; `content_manager` for courses/news/testimonials; `finance` for enrollments.
- **Payments** verify server-side: amount is fetched from `courses.feeRwf` (not client-supplied), payment ownership is checked by phone number, status is verified against MTN before linking, and the payment+enrollment update is wrapped in a DB transaction.
- **MTN MoMo webhook** finalizes payment status asynchronously (no reliance on client polling).
- **Rate limiting** on admin login, contact form, enrollment, payment, certificate verification.
- **Email templates** HTML-escape all user input.
- **Security headers** (X-Content-Type-Options, X-Frame-Options, etc.) via `hono/secure-headers`.
- **CORS** allowlist restricted to `OPEN_URL`.
- **Body limit** 1 MB (was 50 MB).

## License

Proprietary — Pacemaker Institute.
