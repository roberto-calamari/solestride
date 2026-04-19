# Solestride

**Your running history, rebuilt as an RPG character codex.**

Solestride is a mobile-first PWA that connects to Strava, imports your full outdoor GPS run history, and reconstructs your complete skill and build evolution from your very first logged run. View yourself as an old-school RPG character with deterministic builds, deep transparent skill tracking, and event-based build evolution.

## Stack

| Layer | Tech | Why |
|-------|------|-----|
| Framework | Next.js 14 (App Router) | SSR + API routes for secure OAuth, React UI, PWA support |
| Database | SQLite (better-sqlite3) | Zero-cost, single file, deterministic, fast |
| Styling | Tailwind CSS | Rapid mobile-first styling |
| Auth | iron-session | Encrypted stateless cookies, no external auth service |
| Deploy | Vercel / Railway / Render | Free tier compatible |

## Quick Start

### 1. Register a Strava App

1. Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Create a new application
3. Set **Authorization Callback Domain** to `localhost` (for dev) or your production domain
4. Note your **Client ID** and **Client Secret**

### 2. Clone & Configure

```bash
git clone https://github.com/YOUR_USER/solestride.git
cd solestride
cp .env.example .env.local
```

Edit `.env.local`:
```
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=your_secret_here
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/strava/callback
SESSION_SECRET=$(openssl rand -hex 32)
```

### 3. Install & Initialize

```bash
npm install
npm run db:init    # Creates SQLite database
npm run dev        # Start dev server at http://localhost:3000
```

### 4. Test with Real User

1. Open `http://localhost:3000` on your phone or desktop
2. Click "Connect with Strava"
3. Authorize the app
4. Click "Sync with Strava" to import your full history
5. Explore your build, skills, and history

## Production Deployment

### Option A: Railway (Recommended for SQLite)

Railway supports persistent file storage, which is needed for SQLite.

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

Set environment variables in Railway dashboard:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REDIRECT_URI=https://your-app.railway.app/api/auth/strava/callback`
- `SESSION_SECRET` (generate with `openssl rand -hex 32`)
- `DATABASE_PATH=/app/data/solestride.db`

Update your Strava app's callback domain to match.

### Option B: Render

1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Build command: `npm install && npm run db:init && npm run build`
4. Start command: `npm start`
5. Add environment variables
6. Enable persistent disk at `/app/data`

### Option C: Vercel

Note: Vercel's serverless functions don't support persistent SQLite. You'd need to swap to a hosted database (Turso, PlanetScale) for production Vercel deployment. For development/demo, it works fine.

## Database

SQLite database at `./data/solestride.db`. Tables:

- **users** — Strava identity, tokens, preferences
- **activities** — Normalized run data from Strava
- **activity_metrics** — Computed per-run metrics
- **skill_snapshots** — Point-in-time skill ratings
- **build_history** — Event-based build evolution
- **sync_jobs** — Import progress tracking
- **overrides** — User manual overrides

### Migrations

```bash
npm run db:init    # Creates/updates schema
```

## The 8 Skills

| Skill | Domain | Inputs | Ceiling |
|-------|--------|--------|---------|
| **Velocity** | Speed | WA-scored cross-distance performance | World record 5K equivalent |
| **Endurance** | Distance | Longest runs, pace decay, volume | 50km long run, 400km/mo |
| **Ascent** | Climbing | Elev/km, total climbing, GAP | 80m/km gain rate |
| **Stamina** | Cardiac | Efficiency factor, pace÷HR, zones | 2.2 EF (requires HR) |
| **Cadence** | Form | Optimal targeting, consistency | 180-185 spm (requires cadence) |
| **Fortitude** | Discipline | Frequency, consistency, streaks | 7 runs/week, 100% active weeks |
| **Resilience** | Recovery | Back-to-back performance, variance | Zero pace decay on consecutive days |
| **Ranging** | Exploration | Unique locations, routes, terrain | 15+ locations, 70%+ unique routes |

All skills scored 0–100 against universal human ceilings. No age/sex adjustment. Nonlinear progression (elite scores are brutally hard to achieve).

## Build System

Builds are deterministic identities generated from skill profiles:

- **24 Archetypes** based on skill shape (Tempest, Marathon, Summit, Hearth, Sentinel, Nomad, etc.)
- **7 Tiers** based on overall magnitude (Nascent → Mythic)
- **20+ Modifiers** based on secondary patterns (Ironbound, Restless, Crowned, etc.)
- **= 3,000+ unique builds**

Format: `[Modifier] [Archetype] [Tier Suffix]`
Example: "Ironbound Tempest Walker" or "Hollow Drift Nomad"

Same stats always produce the same build. Each build has deterministic pixel art, lore text, and full explanation.

## Activity Inclusion Rules

**Included:** Run and TrailRun with GPS data, distance ≥ 500m, duration ≥ 2 min
**Excluded:** Treadmill, trainer, manual entries, VirtualRun, indoor, very short

If a run lacks HR → excluded from Stamina only
If a run lacks cadence → excluded from Cadence only
If a run lacks GPS → excluded from Ranging and geography metrics

## Inactivity Regression

| Threshold | Effect |
|-----------|--------|
| 14+ days | Mild regression begins |
| 28+ days | Moderate regression |
| 56+ days | Severe regression |
| 90+ days | Near-full regression on volatile skills |

Regression rates vary by skill. Fortitude and Resilience regress fastest. Ranging and Ascent regress slowest.

## Privacy

- All data is private by default
- No public profiles
- No social features
- No maps in UI or share output
- Geography used internally only (coarsened to ~1km grid)
- Users can: disconnect Strava, delete all data, export data
- Sensitive viewing mode available

## Tests

```bash
npm test                    # Run all tests
npm run test:scoring        # Scoring determinism
npm run test:builds         # Build determinism
npm run test:determinism    # Full determinism suite
```

## License

MIT

---

*Solestride — Every stride writes history.*
