# 🏆 BPL — Bot Premiere League

A sleek, futuristic **esports tournament** single-page application to manage and display the
BPL (Bot Premiere League) — dashboard, schedule, player stats, leaderboard, and an admin panel for
updating results.

Built as a **monorepo** with two fully independent apps:

| App        | Stack                                              | Port   |
| ---------- | -------------------------------------------------- | ------ |
| `frontend` | React · TypeScript · Vite · TailwindCSS · Router   | `5173` |
| `backend`  | Node.js · Express · TypeScript                     | `3001` |

The frontend talks to the backend **only through REST APIs** (via a dedicated service layer). No
business logic is shared between the two.

---

## ✨ Features

- **Public dashboard** — hero banner, tournament counters, current leaderboard & upcoming matches.
- **Match schedule** — all 56 league matches grouped by day, with first-leg / revenge-arc stages and
  status filters. Completed matches show winner, kills & headshots.
- **Player stats** — per-player matches played, wins, losses, kills, headshots, win-rate % and rank.
- **Leaderboard** — auto-ranked by **wins → total kills → headshots**.
- **Admin panel** — update any match result; player stats and the leaderboard recalculate instantly,
  no page refresh.
- **Auth** — any `name@bot.com` account with the password `secret`. Protected admin routes, token
  persisted locally.
- Dark-mode-by-default esports theme: glassmorphism cards, neon purple/cyan/gold accents, smooth
  animations, fully mobile-responsive. Loading & error states throughout.

---

## 🗂 Project structure

```text
freefire-ipl/
├── backend/            # Express + TypeScript API
│   └── src/
│       ├── config/        env loader
│       ├── controllers/   request handlers
│       ├── data/          seed data + in-memory store (DB swap point)
│       ├── middleware/     auth, error, 404
│       ├── routes/        REST route definitions
│       ├── services/      business logic (auth, match, player, leaderboard)
│       ├── types/         domain types
│       ├── utils/         helpers (AppError, respond, asyncHandler)
│       ├── app.ts         express app factory
│       └── server.ts      entry point
│
└── frontend/           # React + Vite SPA
    └── src/
        ├── components/    layout, ui kit, cards, table, admin modal
        ├── context/       AuthContext (localStorage-backed)
        ├── hooks/         useAuth, useApi
        ├── pages/         Dashboard, Matches, PlayerStats, Leaderboard, Login, Admin
        ├── services/      apiClient + one service per domain
        └── types/         API contract types
```

---

## 🚀 Getting started

> Requires **Node 18+** and npm.

Open **two terminals** — one for each app.

### 1. Backend (port 3001)

```bash
cd backend
cp .env.example .env      # already provided; adjust if needed
npm install
npm run dev               # starts http://localhost:3001
```

Verify it's up: <http://localhost:3001/api/health>

### 2. Frontend (port 5173)

```bash
cd frontend
cp .env.example .env      # already provided; points at the backend
npm install
npm run dev               # starts http://localhost:5173
```

Open <http://localhost:5173>.

### 🔐 Admin login

| Field    | Value                                            |
| -------- | ------------------------------------------------ |
| Email    | any `name@bot.com` (e.g. `saurav@bot.com`)       |
| Password | `secret`                                         |

---

## 📜 npm scripts

### Backend (`/backend`)

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Run with hot-reload (`tsx watch`)            |
| `npm run build`     | Compile TypeScript → `dist/`                 |
| `npm start`         | Run the compiled production build            |
| `npm run seed`      | (Re)seed the data file — resets all results  |
| `npm run typecheck` | Type-check without emitting                  |

### Frontend (`/frontend`)

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Vite dev server (port 5173)                  |
| `npm run build`     | Type-check + production build → `dist/`      |
| `npm run preview`   | Preview the production build                 |
| `npm run typecheck` | Type-check without emitting                  |

---

## 🔌 API reference

Base URL: `http://localhost:3001/api`

All responses use a uniform envelope:

```jsonc
// success
{ "success": true, "data": <payload> }
// error
{ "success": false, "error": { "message": "...", "code": "..." } }
```

| Method | Endpoint                  | Auth | Description                                    |
| ------ | ------------------------- | ---- | ---------------------------------------------- |
| GET    | `/health`                 | —    | Health check                                   |
| POST   | `/auth/login`             | —    | `{ email, password }` → `{ token, user }`      |
| GET    | `/auth/me`                | ✅   | Current user from bearer token                 |
| GET    | `/matches`                | —    | All matches                                    |
| GET    | `/matches/grouped`        | —    | Matches grouped by day (with stage labels)     |
| GET    | `/matches/upcoming?limit` | —    | Next N scheduled matches                       |
| GET    | `/matches/summary`        | —    | Dashboard counters                             |
| GET    | `/matches/:id`            | —    | Single match                                   |
| PUT    | `/matches/:id`            | ✅   | Update result (recalculates stats/leaderboard) |
| GET    | `/players`                | —    | Player list (id + name)                        |
| GET    | `/players/stats`          | —    | Computed stats for all players                 |
| GET    | `/players/:name/stats`    | —    | Stats for one player                           |
| GET    | `/leaderboard`            | —    | Ranked leaderboard                             |

Authenticated requests send `Authorization: Bearer <token>`.

---

## 🧮 How stats & points work

A `Match` records a single `kills` / `headshots` figure, credited to the match **winner**.
Standings use an IPL-style points system (league matches only):

| Outcome     | Points        | Notes                                              |
| ----------- | ------------- | -------------------------------------------------- |
| Win         | **2**         | +1 win; kills/headshots credited to the winner     |
| Abandoned   | **1 each**    | no winner; counts as played, no win/loss           |
| Loss        | **0**         | +1 loss                                             |

From the league matches the backend derives, on every request: points, played, wins, losses,
abandoned, total kills/headshots, win rate %, and **rank** — ordered by **points → kills →
headshots** (ties broken by seed order). Nothing is stored pre-computed, so updating one result
consistently updates player stats, the leaderboard, and the playoff seeding.

### 🏆 Playoffs

Four knockout matches sit on top of the league, with participants resolved automatically:

| Round        | Player 1            | Player 2             |
| ------------ | ------------------- | -------------------- |
| Qualifier 1  | Rank 1              | Rank 2               |
| Eliminator   | Rank 3              | Rank 4               |
| Qualifier 2  | Loser Qualifier 1   | Winner Eliminator    |
| Final        | Winner Qualifier 1  | Winner Qualifier 2   |

The bracket seeds from the **final** league standings (it stays locked until every league match is
decided), then each match unlocks as its feeders complete. Playoff results **do not** affect the
league points table. `GET /api/matches/playoffs` returns the resolved bracket; playoff matches
cannot be abandoned.

---

## ☁️ Deploy (free, one service)

The repo ships a [`render.yaml`](render.yaml) blueprint that deploys the **whole app as a single
free web service** on [Render](https://render.com): the backend builds the React frontend and
serves it alongside the API, so everything runs on **one URL** — no CORS, no separate frontend host,
nothing to wire up.

**Steps**

1. Push this project to a GitHub repo (Render deploys from Git).
2. On Render: **New + → Blueprint → select the repo → Apply**.
3. Wait for the build; open the generated `https://bpl-….onrender.com` URL. Done.

Admin login works as usual (`name@bot.com` / `secret` — change `AUTH_PASSWORD` in the Render
dashboard if you want).

**Free-tier notes (fine for a draft):**

- The service **sleeps after ~15 min idle**; the first request after that cold-starts in ~30s.
- The free filesystem is **ephemeral** — `bpl-db.json` resets (re-seeds) on each redeploy/restart.
  To keep results permanently, add a Render **persistent disk** mounted at `backend/data`, or
  migrate the store to a managed database (see below).

> Prefer drag-and-drop with no Git? You can drop `frontend/dist` (after `npm run build`) onto
> [Netlify Drop](https://app.netlify.com/drop) for an instant **UI-only** preview — but the
> dashboard/admin need the API, so the single-service Render deploy above is the way to get a
> fully working app.

### How single-service mode works

When `CLIENT_DIR` is set (it is, in `render.yaml`), the Express app serves the built frontend from
that folder plus an SPA fallback for client routes, with the API still under `/api`. Locally the
two apps run separately on ports 5173/3001; in production they're one. The production frontend build
uses [`frontend/.env.production`](frontend/.env.production) (`VITE_API_BASE_URL=/api`, i.e.
same-origin).

## 💾 Data persistence

Data **persists across restarts** via a JSON-file store — no database server required.

- On first run the backend seeds the hardcoded players + schedule and writes them to
  `backend/data/bpl-db.json` (configurable via `DATA_FILE`).
- Every result you save in the Admin panel is written through to that file immediately.
- On subsequent boots it loads the file as-is — your results are kept.
- To start over (or after editing the schedule in `matches.seed.ts`), run `npm run seed` — or
  just delete `backend/data/bpl-db.json`.

The file is git-ignored. For ephemeral runs/tests, swap `new JsonFileStore()` for
`new InMemoryStore()` in [`store.ts`](backend/src/data/store.ts).

## 🛢 Migrating to a database

The JSON-file store is intentionally a stepping stone; the app is structured for an easy DB
migration:

1. All persistence lives behind the `DataStore` interface in
   [`backend/src/data/store.ts`](backend/src/data/store.ts).
2. Implement that same interface with a real driver (PostgreSQL / Prisma, MongoDB / Mongoose, …).
3. Swap the exported `store` instance for your implementation.

Services, controllers, routes and the entire frontend remain **unchanged** — they depend only on
the interface, never the in-memory implementation.

---

## 🛠 Tech notes

- **Independent apps** — no shared package; the frontend mirrors the API types in its own
  `src/types`. Either app can be deployed on its own.
- **Environment variables** — backend reads `PORT`, `CORS_ORIGIN`, auth settings; frontend reads
  `VITE_API_BASE_URL`.
- **Auth tokens** — signed (HMAC-SHA256) and self-expiring; trivial to replace with real JWTs.
- **Strict TypeScript** everywhere, on both sides.
