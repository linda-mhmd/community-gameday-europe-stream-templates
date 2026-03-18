# AGENTS.md  -  AI Assistant Guide

## What is this project?

This is a Remotion/React project that generates video compositions for live streaming AWS Community GameDay events. It was first used for AWS Community GameDay Europe 2026 (March 17, 2026)  -  the first-ever pan-European edition, spanning 53+ AWS User Groups across 20+ countries.

The compositions provide countdowns, schedules, speaker information, tips, and closing ceremonies  -  ensuring every attendee can follow along even with bad audio or across multiple timezones.

## Architecture Overview

```
config/         Change these to adapt for your own event
  event.ts      Event metadata, timezone, FPS, timing offsets
  schedule.ts   Timeline segments (minute offsets from event start)
  participants.ts  Organizers, AWS supporters, user groups
  logos.ts      User group logo URLs (Notion CDN)

src/design/     Change these to retheme all compositions at once
  colors.ts     GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_ACCENT, GD_ORANGE, GD_GOLD
  typography.ts TYPOGRAPHY scale
  animations.ts springConfig presets
  index.ts      Re-exports all design tokens

src/components/ UI building blocks (React components)
  BackgroundLayer.tsx   Background image + darkening overlay
  HexGridOverlay.tsx    Subtle hex pattern overlay
  GlassCard.tsx         Frosted glass card container
  AudioBadge.tsx        Muted/Audio-On badge (bottom-right)
  index.ts              Re-exports all components

src/utils/      Pure logic (no React)
  timing.ts     staggeredEntry, formatTime, calculateCountdown
  phases.ts     getCardState, getActiveSegment, getPhaseInfo, ScheduleSegment
  closing.ts    All closing ceremony utilities (PODIUM_TEAMS, shuffle, reveal)

src/compositions/  The actual video compositions
  00-preshow/   Countdown.tsx (simple timer), InfoLoop.tsx (full rotating content)
  01-main-event/ MainEvent.tsx (30-min live intro)
  02-gameplay/  Gameplay.tsx (2-hour muted overlay)
  03-closing/   ClosingPreRendered.tsx (Part A), ClosingWinnersTemplate.tsx (Part B)
  marketing/    MarketingVideo.tsx (social media clip)
  inserts/      _TEMPLATE.tsx, StreamInterruption, GamemastersUpdate, QuestUpdate

public/assets/  Images, logos, videos (served by Remotion staticFile)
  faces/        Organizer face photos
  GameDay_Solid_Logo_for_swag/  GameDay logo variants
  background_landscape_colour.png  Main background
  europe-map.png  Map used in gameplay overlay
```

## How timing works

- All timings are frame-based at **30fps** (STREAM_FPS in config/event.ts)
- Compositions use frame offsets internally; absolute times are in `config/event.ts`
- The host timezone is **CET** (for the 2026 edition  -  Linda hosts from Vienna)
- All minute offsets in `config/schedule.ts` are relative to EVENT_START (17:30 CET)
- The event spans 4+ timezones  -  relative offsets are used so all locations stay in sync

Key timing constants (minutes from event start):
- EVENT_START_OFFSET_MINUTES = 0   (17:30 CET)
- STREAM_START_OFFSET_MINUTES = 30 (18:00 CET)
- GAME_START_OFFSET_MINUTES = 60   (18:30 CET)
- GAME_END_OFFSET_MINUTES = 180    (20:30 CET)
- EVENT_END_OFFSET_MINUTES = 210   (21:00 CET)

## How to create a new insert

1. Copy `src/compositions/inserts/_TEMPLATE.tsx` and rename it
2. Change `TITLE`, `MESSAGE`, and `ACCENT` at the top (3 values only)
3. Register in `src/Root.tsx`:
   ```tsx
   import { InsertTemplate } from "./compositions/inserts/YourInsert";
   <Composition id="YourInsert" component={InsertTemplate}
     durationInFrames={900} fps={30} width={1280} height={720} />
   ```
4. In Remotion Studio, select it and share your screen

See `src/compositions/inserts/README.md` for full details.

## How to adapt for a new event

Update only `config/` files:
1. `config/event.ts`  -  event name, date, timezone, host location, timing offsets
2. `config/schedule.ts`  -  segment labels and durations
3. `config/participants.ts`  -  organizers, supporters, user group list
4. `config/logos.ts`  -  user group logo URLs

No composition code needs to change for a new edition.

## Where logos come from

See the comment block at the top of `config/logos.ts`. Logos are sourced from a shared Notion database where each user group uploads their logo as an image attachment. The Notion CDN URL is copied into the map.

Fallback: if a logo URL is missing or unreachable, a flag-only card is shown.
Rendering requires internet access (Notion CDN must be reachable).

## Key technical constraints

- **Remotion renders frame-by-frame**  -  no side effects, no async in render path
- All data must be available at render time (no API calls during render)
- `staticFile()` resolves paths relative to `public/`  -  use `assets/...` for all assets
- TypeScript must compile cleanly  -  all imports must resolve

## Year / Edition

This repo tracks editions. **2026 = first edition** of AWS Community GameDay Europe.
If you see "2025" anywhere, it is a bug  -  this event ran on March 17, 2026.
