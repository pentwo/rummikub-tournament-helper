# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rummikub Tournament Helper - A web app for managing Rummikub tournaments with multiple tables, real-time scoring, and a TV dashboard for displaying live rankings.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS
- **State Sync**: Next.js API Routes + Polling (2-second intervals for TV page)
- **Data Storage**: Vercel KV (Redis)
- **Deployment**: Vercel

## Development Commands

```bash
# Install dependencies
npm install

# Development server (already running in background per user preference)
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## Architecture

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Admin dashboard - create tables, view status, leaderboard |
| `/tv` | TV display - auto-refreshing tournament overview for big screens |
| `/table/[id]` | Per-table interface - timer, player switching, scoring (mobile-friendly) |

### API Routes

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/tournament` | GET, POST | Tournament data (players, tables, rounds) |
| `/api/tables` | GET, POST | Table CRUD operations |
| `/api/tables/[id]` | GET, PUT | Single table operations |
| `/api/rounds` | POST | Record round results |

### Key Data Models

- **Player**: id, name, initial (avatar text), totalScore
- **Table**: id, players[], currentPlayerIndex, currentRound, status ('playing' | 'scoring' | 'finished'), timerStartedAt
- **Round**: id, tableId, roundNumber, winnerId, scores (Record<playerId, score>), timestamp
- **TournamentData**: date, players[], tables[], rounds[]

### Timer UI Color Scheme

| Remaining Time | Background Color |
|----------------|------------------|
| > 30 seconds | Green |
| 15-30 seconds | Yellow |
| < 15 seconds | Red |
| 0 seconds | Dark red (flashing) |

### File Organization

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (TableCard, PlayerAvatar, Timer, Leaderboard, ScoreInput, CreateTableModal)
- `src/hooks/` - Custom hooks (useTimer, useTournament, usePolling)
- `src/lib/` - Utilities and Vercel KV operations
- `src/types/` - TypeScript type definitions
