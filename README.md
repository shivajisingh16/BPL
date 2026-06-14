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
- **Auth** — admin-only sign-in restricted to seeded accounts (no self-registration). Passwords are
  bcrypt-hashed in MongoDB. Public pages stay open; only the admin panel and result writes require a
  bearer token (persisted locally).
- Dark-mode-by-default esports theme: glassmorphism cards, neon purple/cyan/gold accents, smooth
  animations, fully mobile-responsive. Loading & error states throughout.

---

## 🗂 Project structure

```text
freefire-ipl/
├── backend/            # Express + TypeScript API
│   └── src/
│       ├── config/        env loader + MongoDB connection
│       ├── controllers/   request handlers
│       ├── data/          seed data + MongoDB store (DataStore interface)
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
cp .env.example .env      # then paste your MongoDB Atlas URI into MONGODB_URI
npm install
npm run seed              # one-time: create collections + seed players/accounts
npm run dev               # starts http://localhost:3001
```

> A valid `MONGODB_URI` (set in `backend/.env`) is required. The database auto-seeds on first run
> if it's empty.

Verify it's up: <http://localhost:3001/api/health>

### 2. Frontend (port 5173)

```bash
cd frontend
cp .env.example .env      # already provided; points at the backend
npm install
npm run dev               # starts http://localhost:5173
```

Open <http://localhost:5173>.

---

## 📜 npm scripts

### Backend (`/backend`)

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Run with hot-reload (`tsx watch`)            |
| `npm run build`     | Compile TypeScript → `dist/`                 |
| `npm start`         | Run the compiled production build            |
| `npm run seed`      | (Re)seed the database — resets all results   |
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

## 💾 Data persistence (MongoDB)

Data lives in **MongoDB**. The app uses three collections:

| Collection | Contents                                                        |
| ---------- | --------------------------------------------------------------- |
| `players`  | the 8 tournament participants                                   |
| `matches`  | the 56 league fixtures + 4 playoff matches                      |
| `users`    | admin accounts (one per player + a dedicated super-admin), bcrypt-hashed |

- On first boot, if the database is empty, the backend seeds players, the schedule and the admin
  accounts automatically.
- Every result you save in the Admin panel is written through to MongoDB immediately.
- To reset everything (or after editing the schedule in `matches.seed.ts`), run `npm run seed` —
  this wipes and re-seeds all three collections.

All persistence sits behind the `DataStore` interface in
[`backend/src/data/store.ts`](backend/src/data/store.ts) (`MongoStore` is the default; an
`InMemoryStore` is provided for tests). Services, controllers, routes and the frontend depend only
on that interface.

---

## 🛠 Tech notes

- **Independent apps** — no shared package; the frontend mirrors the API types in its own
  `src/types`. Either app can run on its own.
- **Environment variables** — backend reads `PORT`, `CORS_ORIGIN`, `MONGODB_URI`/`MONGODB_DB` and
  auth settings; frontend reads `VITE_API_BASE_URL`.
- **Persistence** — MongoDB via the official `mongodb` driver, behind a `DataStore` interface.
- **Passwords** — bcrypt-hashed; only seeded accounts can sign in.
- **Auth tokens** — signed (HMAC-SHA256) and self-expiring; trivial to replace with real JWTs.
- **Strict TypeScript** everywhere, on both sides.
