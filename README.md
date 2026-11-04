# Insaan (इंसान) — Self-Mastery System & Sovereign Offline PWA

> *"Waste no more time arguing what a good person should be. Be one."* — Marcus Aurelius

**Insaan** is a production-quality, offline-first Progressive Web Application (PWA) with a sovereign, zero-knowledge cloud sync backend. It is designed to cultivate inner discipline, moral character, mental tranquility, and physical vitality through classical philosophy, book study, atomic habits, mindful wealth management, and a custom biomechanical pedometer engine.

The frontend operates **100% offline in Guest Mode** using local IndexedDB (Dexie). An optional cloud account enables end-to-end encrypted multi-device synchronization, automated backup, and cross-device session management without ever compromising the offline-first experience.

---

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (PWA / Browser)                             │
│                                                                             │
│  React 18 (Vite)  ·  Zustand  ·  Framer Motion  ·  Tailwind CSS (Spatial)   │
│                                                                             │
│  ┌───────────────────────┐   Single Source of   ┌────────────────────────┐  │
│  │   UI Components &     │ ◄──── of Truth ────► │  IndexedDB (Dexie v2)  │  │
│  │   Biomechanical Sens. │                      │  17 Local Sync Tables  │  │
│  └───────────────────────┘                      └───────────┬────────────┘  │
│                                                             │               │
│  ┌───────────────────────┐                      ┌───────────▼────────────┐  │
│  │  Web Crypto (AES-GCM) │                      │   Offline Sync Engine  │  │
│  │  Zero-Knowledge E2EE  │ ◄──────────────────► │   - Outbox Pattern     │  │
│  │  PBKDF2 600,000 rds   │  Encrypted Journal   │   - 3-Way LWW Merge    │  │
│  └───────────────────────┘                      └───────────┬────────────┘  │
└─────────────────────────────────────────────────────────────┼───────────────┘
                                                              │ HTTPS /api/*
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             CLOUDFLARE PAGES FUNCTION PROXY (First-Party Domain)            │
│  functions/api/[[path]].ts                                                  │
│  - Forwards /api/* to BACKEND_URL                                           │
│  - Preserves HttpOnly, Secure, SameSite=Lax cookies on iOS Safari & PWAs     │
└─────────────────────────────────────────────────────────────┬───────────────┘
                                                              │ Proxied Request
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 BACKEND SERVER (/server) — Node 20 + Hono                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Middleware: Pino Logger · Request-ID · Secure Headers · Strict CORS   │  │
│  │ Rate Limiter (Sliding Window + Lockout) · 1MB Body Limit · CSRF Check │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────┐     ┌─────────────────────────────────┐  │
│  │   Auth Engine                 │     │   Sync Engine (/services/sync)  │  │
│  │   - Argon2id Password Hashing │     │   - Atomic Push Transaction     │  │
│  │   - 15m Memory JWT Access     │     │   - Cursor Pull Pagination      │  │
│  │   - 30d Rotated Refresh Token │     │   - Last-Write-Wins Resolution  │  │
│  │   - Family Reuse Breach Detect│     │   - User Authorization Scoping  │  │
│  └───────────────────────────────┘     └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┬───────────────┘
                                                              │ SSL Pool
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             DATABASE — Neon Serverless PostgreSQL (Drizzle ORM)             │
│                                                                             │
│  Tables: users, refresh_tokens, email_tokens                                │
│  17 Sync Tables: user_profile, steps_daily, hourly_steps, custom_books,     │
│  user_book_notes, reading_progress, habits, habit_logs, schedule_tasks,     │
│  pomodoro_sessions, transactions, budgets, savings_goals, virtue_ratings,   │
│  journal_entries (E2EE ciphertext), mood_logs, achievements                 │
│                                                                             │
│  Indices: Composite cursor index (user_id, server_updated_at, id)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Monorepo Structure

```text
/
├── functions/                    # Cloudflare Pages Functions
│   └── api/[[path]].ts           # First-party cookie proxy to backend
├── public/                       # PWA icons, manifest, favicon assets
├── server/                       # Node 20 + Hono + Drizzle backend
│   ├── drizzle/                  # Committed SQL migrations
│   ├── src/
│   │   ├── config/env.ts         # Boot-time Zod environment validation
│   │   ├── db/                   # Drizzle schema, connection pool & registry
│   │   ├── middleware/           # Security headers, CORS, rate-limiting, auth
│   │   ├── routes/               # /auth (14 endpoints) and /sync (push/pull/export)
│   │   ├── services/             # Auth logic, email service, sync repository
│   │   ├── test/                 # Vitest test suite with in-memory PGlite
│   │   └── index.ts              # Hono application entry & graceful shutdown
│   ├── Dockerfile                # Multi-stage production container build
│   └── package.json
├── shared/                       # Shared contracts package
│   ├── src/index.ts              # Zod schemas & TypeScript types for client & server
│   └── package.json
├── src/                          # Vite React Frontend
│   ├── components/               # Spatial glass UI components, TopHeader, Sidebar
│   ├── db/                       # Dexie schema v2, seed data, offline queries
│   ├── features/                 # Philosophy, Books, Steps, Habits, Schedule, Wealth, Character, Account
│   ├── services/                 # API client, sync engine, Web Crypto E2EE
│   ├── store/                    # Zustand stores (useAppStore, useAuthStore, usePedometerStore)
│   └── utils/                    # Pedometer DSP, date utilities, sound effects
├── .github/workflows/ci.yml      # Automated GitHub Actions test & build pipeline
├── package.json                  # Monorepo workspaces: ["shared", "server"]
└── vite.config.js                # Vite build, PWA manifest, Workbox, and dev proxy
```

---

## 🌟 Key Features

### 1. 🏛️ Western Philosophy Library
- **12 Great Thinkers**: Marcus Aurelius, Seneca, Epictetus, Socrates, Plato, Aristotle, Epicurus, Kant, Nietzsche, Kierkegaard, Camus, Schopenhauer, Spinoza.
- **Biographies & Historical Context**: Key inflection points and philosophical lineages.
- **Core Teachings & Maxims**: The Inner Citadel, Premeditatio Malorum, Eudaimonia, Tetrapharmakos, Categorical Imperative, Amor Fati, Absurdism, and Compassion.
- **"How to Apply Today"**: Practical, daily actionable exercises to implement philosophical wisdom immediately.
- **Foundational Concepts**: Expandable deep-dives into *Dichotomy of Control*, *Amor Fati*, *Memento Mori*, *The Golden Mean*, and *Categorical Imperative*.
- **Daily Philosophical Examination**: Morning intention and evening reflection prompts committed to your encrypted journal vault.

### 2. 📚 Books Reader & Original Summaries
- **Public Domain Full-Text Classics**: Complete unabridged texts for Marcus Aurelius's *Meditations* (Books 1–4), Epictetus's *Enchiridion*, Seneca's *Letters from a Stoic*, and Plato's *The Republic (Allegory of the Cave)*.
- **Synthesized Chapter Summaries**: Original chapter-by-chapter takeaway breakdowns for modern bestsellers (*Atomic Habits*, *The Obstacle Is the Way*, *Deep Work*, *Man's Search for Meaning*, *The 7 Habits*, *Can't Hurt Me*, *Ikigai*, *Thinking Fast & Slow*, *The Power of Now*, *The Alchemist*).
- **Custom Books**: Add your own books, chapters, and study notes.
- **Distraction-Free Reader**: Dynamic font sizing (S/M/L/XL), themes (Dark, Sepia, Light), reading progress tracking, chapter navigation.
- **"My Summary" Feature**: User-authored chapter notes auto-saved in IndexedDB, exportable to Markdown and JSON.

### 3. 👟 High-Precision Pedometer & Vehicle Rejection Engine
- **Orientation-Independent Sensor Vector**: Computes $a_{mag} = \sqrt{x^2 + y^2 + z^2}$ from `DeviceMotionEvent`, working reliably in hand, pocket, or bag.
- **Adaptive Threshold & Bandpass Filter**: Continuously recalibrates peak and valley thresholds based on user impact force.
- **False Bump Buffer**: Requires 4 consecutive rhythmic steps within 0.25s–2.0s intervals before committing steps, eliminating accidental shakes.
- **Intelligent Vehicle Detection**:
  - Uses Geolocation speed combined with accelerometer autocorrelation ($R_{xx}$).
  - Pauses step counting when sustained speed > 7 km/h without rhythmic human cadence, or speed > 25 km/h.
  - Hysteresis debounce ensures red-light stops and traffic halts do not trigger false step accumulation.
  - Live motion state badges: `STILL`, `WALKING`, `RUNNING`, `VEHICLE`.
- **Calibration Mode**: Guided 20-step walk mode to adapt sensitivity and height-based stride calculations ($height \times 0.414$).
- **Live Diagnostics Oscilloscope**: Real-time canvas oscilloscope showing filtered magnitude wave, dynamic threshold, raw acceleration, and GPS speed.
- **Screen Wake Lock API**: Prevents browser sleep while counting steps.

### 4. ⚡ Atomic Habits Architecture
- **Identity-First Habits**: Rooted in James Clear's framework ("I am the type of person who...").
- **The 4 Laws of Behavior Change**: Define the Cue (Obvious), Craving (Attractive), Response (2-Minute Rule Version), and Reward (Satisfying).
- **7-Day Visual Check-In Matrix**: Track active streaks, milestone celebrations, and weekly completion rates.

### 5. 📅 Schedule & Pomodoro Focus
- **Intentional Time-Blocking**: Create chronological daily and recurring routine blocks.
- **Pomodoro Focus Timer**: 25m/50m deep work sessions and 5m breaks with custom Web Audio synthesized singing bowl chime.
- **XP Progression**: Every completed focus block awards character XP.

### 6. 💰 Mindful Wealth & Budgeting
- **Transaction Ledger**: Track income and expenses with categories, payment methods, and notes (default INR ₹, customizable to $, €, £, AED).
- **Category Spending Ceilings**: Monthly budget meters with automated overspend alerts.
- **Category Allocation Chart**: Visual pie chart of resource deployment.
- **Noble Savings Goals**: Progress rings toward emergency funds and long-term targets.
- **CSV Data Portability**: Export transactions directly to standard CSV.

### 7. 🧘 Virtues, Memento Mori & Character
- **Daily Virtue Standings**: 1–5 star ratings on the 6 cardinal virtues (Wisdom, Discipline, Courage, Kindness, Gratitude, Humility).
- **Stoic Evening Accounting**: Seneca's 3 reflection prompts (What went well? Where did I falter? How will I improve tomorrow?).
- **Memento Mori Cosmic Clock**: Interactive 80-year (4,160 weeks) life-in-weeks grid based on your birthdate to conquer procrastination and petty grievances.
- **Mindful Respiration Orb**: Interactive breathing exercises (Box Breathing 4-4-4-4, 4-7-8 Relaxing, Resonant 5-5) with calming harmonic audio cues.
- **Soul Matrix Radar**: 6-dimension character radar (Wisdom, Discipline, Health, Finance, Kindness, Focus).

### 8. 🔐 Sovereign Offline-First Sync & Security
- **Guest Mode (Default)**: Full app operates 100% offline with Dexie IndexedDB. No account required.
- **Guest-to-Account Migration**: When creating an account, existing guest data is merged seamlessly into the cloud without loss.
- **Last-Write-Wins Sync**: Push outbox + cursor pull pagination on `(server_updated_at, id)`. Local un-synced edits always take priority over older server data.
- **Zero-Knowledge E2EE**: Client-side AES-GCM (256-bit) encryption with PBKDF2 (600,000 iterations) for personal reflections and journal entries. Encryption keys exist strictly in volatile memory and are never written to disk or transmitted to the server.
- **Argon2id & Token Family Rotation**: Passwords hashed with RFC 9106 Argon2id. Refresh tokens use family rotation with automatic breach detection (reusing a revoked token revokes the entire family).
- **GDPR Compliance**: Single-click full JSON export of all 17 tables from cloud or local storage, plus permanent account hard-deletion.

---

## ⚙️ Environment Variables Reference

### Backend (`server/.env`)

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (Neon with SSL) | `postgresql://user:pass@ep-cool-fog.neon.tech/insaan?sslmode=require` |
| `JWT_ACCESS_SECRET` | **Yes** | Cryptographic secret for 15-minute JWT access tokens (min 32 chars) | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for cookie signing / refresh operations (min 32 chars) | `openssl rand -hex 32` |
| `FRONTEND_ORIGIN` | **Yes** | Allowed origin for strict CORS and CSRF verification | `https://insaan.pages.dev` or `http://localhost:5173` |
| `APP_URL` | No | Base application URL for emails | `https://insaan.pages.dev` |
| `RESEND_API_KEY` | No | API key from Resend for transactional emails (logs to console if omitted) | `re_abc123...` |
| `PORT` | No | Backend HTTP listening port (defaults to 3001) | `3001` |
| `NODE_ENV` | No | Environment mode | `production` or `development` |

### Cloudflare Pages Function (`functions/`)

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `BACKEND_URL` | **Yes** | Public HTTPS address of your deployed backend | `https://insaan-api.onrender.com` |

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Provision Neon PostgreSQL Database (Free)
1. Sign up at [neon.tech](https://neon.tech) (free tier includes 0.5 GB storage and auto-suspend).
2. Create a new project called `insaan-db`.
3. In the Neon Console Dashboard, locate **Connection Details** > select **Connection string** > check **Pooled connection**.
4. Ensure the connection string ends with `?sslmode=require`.

### Step 2: Run Database Migrations
Run the committed Drizzle migration to create all 20 tables, check constraints, and composite indices:
```bash
# In server directory or root workspace
npm --workspace=server run db:migrate
```

### Step 3: Configure Transactional Emails (Resend)
1. Sign up at [resend.com](https://resend.com) (free tier allows 100 emails/day, 3,000/month).
2. Generate an API Key in the Resend dashboard.
3. *Note*: In local development or testing, omitting `RESEND_API_KEY` will safely log verification and password reset links directly to the terminal without failing.

### Step 4: Deploy Backend to Render (Free Web Service)
1. Sign up at [render.com](https://render.com).
2. Click **New +** > **Web Service** > Connect your GitHub repository.
3. Configure the service:
   - **Name**: `insaan-api`
   - **Root Directory**: Leave blank if using Docker (`server/Dockerfile`), or `server` if using native Node
   - **Environment**: `Docker` (recommended for full environment isolation) or `Node`
   - **Dockerfile Path**: `server/Dockerfile`
   - If using native Node:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `node dist/index.js`
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon connection string from Step 1.
   - `JWT_ACCESS_SECRET`: Generated secret (`openssl rand -hex 32`).
   - `JWT_REFRESH_SECRET`: Generated secret (`openssl rand -hex 32`).
   - `FRONTEND_ORIGIN`: Your Cloudflare Pages URL (e.g. `https://insaan.pages.dev`).
   - `RESEND_API_KEY`: Your Resend API key from Step 3.
   - `NODE_ENV`: `production`
5. Under **Health Check Path**, enter: `/health`.
6. Click **Create Web Service**. Note the deployed URL (e.g. `https://insaan-api.onrender.com`).

### Step 5: Deploy Frontend to Cloudflare Pages (Free)
1. Sign up at [cloudflare.com](https://cloudflare.com).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository and configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Under **Settings** > **Environment variables** (Production):
   - Add `BACKEND_URL`: `https://insaan-api.onrender.com` (from Step 4).
5. Click **Save and Deploy**.
   - Cloudflare Pages will automatically compile the frontend PWA and execute `functions/api/[[path]].ts`, proxying all `/api/*` traffic to your Render backend while maintaining first-party cookies.

---

## 🧪 Testing Multi-Device Sync Between Two Browsers

To test real-time cloud synchronization locally:

1. **Start the backend server**:
   ```bash
   npm --workspace=server run dev
   ```
   *(Listening on `http://localhost:3001`)*

2. **Start the frontend application**:
   ```bash
   npm run dev
   ```
   *(Running on `http://localhost:5173`)*

3. **Open Browser Window A (e.g. Google Chrome)**:
   - Open `http://localhost:5173`.
   - Add a few habits, log some steps in the Pedometer, or create a book note.
   - Click the **Guest** pill in the top header > click **Sign up free**.
   - Create an account (e.g. `seeker@insaan.app` / password with 10+ characters).
   - When the **Sanctuary Sync Options** modal appears, click **Merge Guest Data to Account (Recommended)**.
   - The top header pill will immediately transition to **Synced (Just now)**.

4. **Open Browser Window B (e.g. Firefox or Safari Private Window)**:
   - Open `http://localhost:5173`.
   - Click the **Guest** pill > enter `seeker@insaan.app` and your password.
   - Click **Sign In**.
   - Watch as your steps, habits, books, and schedule from Window A automatically sync and populate in Window B!

5. **Test Conflict Resolution & Offline Outbox**:
   - Disconnect your internet (or set Browser B to Offline in DevTools Network tab).
   - Complete a habit in Browser B while offline.
   - Re-enable the connection.
   - The sync engine will automatically detect network restoration, flush the outbox, and update both devices.

---

## ⚠️ Platform Constraints & Technical Notes

1. **Browser Sensor Limitations in Standalone PWA Background Mode**:
   - Modern mobile operating systems (particularly iOS Safari) suspend JavaScript execution and sensor polling when the screen is locked or the app is minimized.
   - Insaan mitigates this by integrating the **Screen Wake Lock API**, keeping the display active during dedicated walking sessions, and displaying a transparent notice explaining operating system sensor boundaries.
   - The pedometer algorithm uses a 4-step rhythmic debounce buffer to ensure zero false steps from vehicle vibrations or pocket bumps.

2. **Render Free Tier Standby Wakeup ("Cold Starts")**:
   - Render's free tier spins down backend services after 15 minutes of inactivity.
   - Insaan's `apiClient` monitors cold-start latency and triggers a responsive **"Waking Cloud..."** visual indicator in the top header.
   - Because the PWA is strictly offline-first with Dexie IndexedDB, the application remains 100% interactive and functional even while the cloud server wakes up. No user edits are ever blocked or lost.

---

## 📋 Manual Deployment Checklist

- [ ] Create Neon PostgreSQL database and copy connection string with `?sslmode=require`.
- [ ] Generate two 64-character hex strings for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` using `openssl rand -hex 32`.
- [ ] Run migrations against Neon database: `npm --workspace=server run db:migrate`.
- [ ] Obtain Resend API key (optional for development; required for production verification emails).
- [ ] Deploy backend on Render with environment variables and `/health` health check.
- [ ] Deploy frontend on Cloudflare Pages with `BACKEND_URL` environment variable.
- [ ] Verify `/health` returns `{"status":"ok","database":"connected"}`.
- [ ] Perform end-to-end signup and test sync across two devices.

---

## 🛠️ Developer Commands

| Action | Command |
| :--- | :--- |
| **Start Frontend Dev Server** | `npm run dev` |
| **Start Backend Dev Server** | `npm --workspace=server run dev` |
| **Run All Backend Tests (PGlite)** | `npm --workspace=server test` |
| **Run All Frontend Tests** | `npm test` |
| **Run Full Test Suite** | `npm run test:all` |
| **Typecheck Backend** | `npm --workspace=server run typecheck` |
| **Build Backend Server** | `npm --workspace=server run build` |
| **Build Frontend PWA** | `npm run build` |
| **Preview Built PWA** | `npm run preview` |
| **Build Docker Container** | `docker build -f server/Dockerfile -t insaan-api .` |
| **Run Docker Container** | `docker run --env-file server/.env -p 3001:3001 insaan-api` |
| **Generate Drizzle Migrations** | `npm --workspace=server run db:generate` |
| **Execute Migrations** | `npm --workspace=server run db:migrate` |

---

*Insaan — Forged with reason, dedicated to virtue.*
