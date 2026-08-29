# Kart Points

A Mario Kart tournament tracker for game nights: create teams, run races, record
per-player finishing places, and watch team + individual standings update live.
Built with Next.js (App Router), Prisma, and Postgres.

## Features

- Landing page → tournament list → per-tournament setup, live dashboard, and
  final stats screen.
- Pick the game per tournament (Mario Kart 64, 8 Deluxe, or World) — each uses
  its own official points-per-place table, including DNF (0 pts).
- Teams with any number of racers; solo teams are automatically named after
  their racer.
- Move racers between teams any time; moving mid-tournament resets their
  points to zero on the new team. Emptied teams are removed automatically.
- Race entry is a big-button, scrollable place-picker — one racer at a time,
  team-by-team, with a team locked out once its racers are recorded.
- "Start Race!" unlocks every team for the next race once all teams have
  recorded the current one.
- A read-only, auto-refreshing `/display` view per tournament, meant to be
  opened on a projector/TV; keeps the screen awake via the Wake Lock API.
- Ending a tournament locks in a final stats screen (team + individual
  leaderboards), and you can spin up a new tournament pre-populated with the
  same teams/racers.

## Local development

Requires Node 20.9+ (project pins Node 24 via `.nvmrc`).

```bash
npm install
npx prisma dev --detach   # local Postgres for development
npx prisma migrate dev    # apply migrations
npm run dev
```

## Database

Uses Prisma 7 with the `pg` driver adapter against Postgres. Set
`mktt_DATABASE_URL` (see `.env.example`). For production, use a Neon/Vercel
Postgres database — prefer the pooled connection string for serverless
compatibility.

The `build` script already runs `prisma generate && prisma migrate deploy`
before `next build`, so migrations apply automatically on every deploy.

## Deploying to Vercel

1. Create a Postgres database (Vercel Postgres / Neon integration) and copy
   its connection string.
2. Set `mktt_DATABASE_URL` in the Vercel project's Environment Variables.
3. Import the GitHub repo into Vercel; it will build with `next build`.
