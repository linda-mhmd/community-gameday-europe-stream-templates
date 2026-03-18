# AWS Community GameDay Europe  -  Stream Visuals

> **LIVE WINNERS TEMPLATE**  -  The closing ceremony winners must be updated with real data before rendering. See **[TEMPLATE.md](TEMPLATE.md)** for instructions.

Remotion-powered stream overlay compositions for the first-ever **AWS Community GameDay Europe**, a competitive cloud event spanning **53+ AWS User Groups** across **20+ countries** and multiple timezones.

These compositions are the visual layer of a live stream that plays at every participating User Group location simultaneously. They provide countdowns, schedules, speaker information, and key instructions  -  ensuring every attendee can follow along even with bad audio or no idea who is on screen.

## Preview

### Pre-Show Countdown
![Pre-Show](screenshots/readme-preshow-frame-150.png)

### Main Event  -  Speaker & Schedule
![Main Event](screenshots/readme-mainevent-frame-900.png)

### Gameplay Overlay
![Gameplay](screenshots/readme-gameplay-frame-3600.png)

### Closing  -  Shuffle Phase (Part A)
![Closing Shuffle](screenshots/readme-closing-shuffle-frame-2000.png)

### Closing  -  Bar Chart Reveal (Part B)
![Bar Chart Reveal](screenshots/readme-winners-reveal-frame-3500.png)

### Closing  -  1st Place Reveal (Part B)
![1st Place](screenshots/readme-winners-1st-place-frame-5800.png)

### Closing  -  Podium (Part B)
![Podium](screenshots/readme-winners-podium-frame-7258.png)

### Thank You
![Thank You](screenshots/readme-winners-thankyou-frame-8200.png)

---

## What is this?

This repository contains Remotion video compositions (in `src/compositions/`) that together form the full ~3-hour GameDay stream experience:

| Composition ID | File | Duration | Purpose |
|---|------|----------|---------|
| **Countdown** | `src/compositions/00-preshow/Countdown.tsx` | 10 min (loop ×3) | Simple countdown timer loop before the stream goes live |
| **InfoLoop** | `src/compositions/00-preshow/InfoLoop.tsx` | 30 min | Rotating content (user groups, organizers, schedule)  -  used for GameDay Europe 2026 |
| **MainEvent** | `src/compositions/01-main-event/MainEvent.tsx` | 30 min | Live introductions, speaker info, instructions, code distribution |
| **Gameplay** | `src/compositions/02-gameplay/Gameplay.tsx` | 120 min | Muted overlay during the 2-hour game |
| **ClosingPreRendered** | `src/compositions/03-closing/ClosingPreRendered.tsx` | ~2.5 min | Hero intro, fast scroll, shuffle countdown  -  pre-rendered |
| **ClosingWinnersTemplate** | `src/compositions/03-closing/ClosingWinnersTemplate.tsx` | ~5 min | Bar chart reveal, podium, thank you  -  **updated live with real scores** |
| **MarketingVideo** | `src/compositions/marketing/MarketingVideo.tsx` | 15 sec | Social media clip for organizers |
| **StreamInterruption** | `src/compositions/inserts/StreamInterruption.tsx` | 30 sec | Quick update during gameplay |
| **GamemastersUpdate** | `src/compositions/inserts/GamemastersUpdate.tsx` | 30 sec | Gamemasters have an announcement |
| **QuestUpdate** | `src/compositions/inserts/QuestUpdate.tsx` | 30 sec | Quest fixed / new quest available |

> **Pre-Event note**: Two options  -  use `Countdown` alone (timer only) or followed by `InfoLoop` (full rotating content). For GameDay Europe 2026 we used both: Countdown for the early setup window, InfoLoop for the 30 minutes before stream start.

Additional files:
- `config/`  -  All event-specific data: timing, participants, logos
- `src/design/`  -  Shared colors, typography, animation presets
- `src/components/`  -  Shared UI components (BackgroundLayer, GlassCard, etc.)
- `src/utils/`  -  Pure utility functions (timing, phases, closing logic)
- `TEMPLATE.md`  -  Instructions for updating Part B with real winner data
- `AGENTS.md`  -  Architecture guide for AI coding assistants

## What is Remotion?

[Remotion](https://www.remotion.dev/) is a framework for creating videos programmatically using React. Instead of editing in a video tool, you write React components that render frame-by-frame. This gives you:

- **Pixel-perfect control** over every element at every frame
- **Data-driven visuals**  -  countdowns, schedules, and speaker info come from code
- **Remotion Studio**  -  a browser-based preview where you can scrub through the timeline, inspect frames, and see chapter markers
- **Rendering**  -  export to MP4/WebM at any resolution

You don't need video editing experience. If you know React, you can read and modify these compositions.

## Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** or **pnpm**
- A modern browser (Chrome recommended for Remotion Studio)

### Installation

This repo is a complete Remotion project  -  everything you need is included.

```bash
# 1. Clone the repo
git clone <repo-url>
cd community-gameday-europe-stream

# 2. Install dependencies
npm install

# 3. Start Remotion Studio
npx remotion studio
```

That's it. Open `http://localhost:3000` in your browser and you'll see all compositions listed on the left.

### Using Remotion Studio

Once running, open `http://localhost:3000` in your browser. You will see:

- A **composition list** on the left  -  click any composition to preview it
- A **timeline** at the bottom  -  scrub to any frame, see chapter markers
- **Play/pause** controls  -  watch the composition in real-time
- **Frame counter**  -  jump to specific frames (e.g., frame 1800 = 1 minute mark)

Useful keyboard shortcuts:
- `Space`  -  Play/Pause
- `←` / `→`  -  Step one frame back/forward
- `J` / `L`  -  Slow down / speed up playback
- `Home` / `End`  -  Jump to start/end

### Rendering to Video

```bash
# Render a specific composition to MP4
npx remotion render MainEvent out/main-event.mp4

# Render at specific frame range (e.g., just the intro)
npx remotion render MainEvent out/intro-only.mp4 --frames=0-1799
```

## Project Structure

```
├── package.json                              # Dependencies (remotion, react)
├── tsconfig.json                             # TypeScript config
├── remotion.config.ts                        # Remotion entry point config
├── TEMPLATE.md                               # Live winners template instructions
├── AGENTS.md                                 # Architecture guide for AI assistants
├── CONTRIBUTING.md                           # How to adapt and contribute
├── LESSONS_LEARNED.md                        # Post-event retrospective
│
├── config/
│   ├── event.ts                              # Event metadata + timezone
│   ├── schedule.ts                           # Timeline segments
│   ├── participants.ts                       # Organizers, AWS supporters, user groups
│   └── logos.ts                              # User group logo URLs
│
├── src/
│   ├── index.ts                              # Remotion entry point
│   ├── Root.tsx                              # Composition registry
│   │
│   ├── design/
│   │   ├── colors.ts                         # GD_DARK, GD_PURPLE, GD_VIOLET, etc.
│   │   ├── typography.ts                     # TYPOGRAPHY scale
│   │   ├── animations.ts                     # springConfig presets
│   │   └── index.ts                          # Re-exports all design tokens
│   │
│   ├── components/
│   │   ├── BackgroundLayer.tsx               # Background image + darkening overlay
│   │   ├── HexGridOverlay.tsx                # Subtle hex pattern
│   │   ├── GlassCard.tsx                     # Frosted glass card
│   │   ├── AudioBadge.tsx                    # Muted / Audio On badge
│   │   └── index.ts                          # Re-exports all components
│   │
│   ├── utils/
│   │   ├── timing.ts                         # staggeredEntry, formatTime, calculateCountdown
│   │   ├── phases.ts                         # getCardState, getActiveSegment, getPhaseInfo
│   │   └── closing.ts                        # Closing ceremony utilities + PODIUM_TEAMS
│   │
│   └── compositions/
│       ├── 00-preshow/
│       │   ├── Countdown.tsx                 # Simple countdown timer
│       │   └── InfoLoop.tsx                  # Full rotating content loop
│       ├── 01-main-event/
│       │   └── MainEvent.tsx                 # 30-min live intro
│       ├── 02-gameplay/
│       │   └── Gameplay.tsx                  # 2-hour muted overlay
│       ├── 03-closing/
│       │   ├── ClosingPreRendered.tsx         # Part A  -  pre-rendered
│       │   └── ClosingWinnersTemplate.tsx     # Part B  -  live winners
│       ├── marketing/
│       │   └── MarketingVideo.tsx             # Social media clip
│       └── inserts/
│           ├── _TEMPLATE.tsx                  # Copy this to create a new insert
│           ├── StreamInterruption.tsx
│           ├── GamemastersUpdate.tsx
│           ├── QuestUpdate.tsx
│           └── README.md                      # How to create an insert in <2 minutes
│
└── public/
    └── assets/                               # Logos, backgrounds, speaker avatars
        ├── faces/                            # Organizer face photos
        ├── GameDay_Solid_Logo_for_swag/      # GameDay logo variants
        ├── background_landscape_colour.png
        └── europe-map.png
```

## Main Event Schedule (Source of Truth)

The Main Event composition (30 min) follows this exact schedule. All times are CET (stream host timezone for this edition).

| Time (CET) | Segment | Duration | Who |
|-------------|---------|----------|-----|
| 18:00 - 18:01 | Linda  -  Welcome & Intro | 1 min | Linda |
| 18:01 - 18:05 | Jerome & Anda  -  Community GameDay | ~4 min | Jerome & Anda |
| 18:05 - 18:06 | Linda  -  Transition | ~1 min | Linda |
| 18:06 - 18:07 | Support Process Video | 1 min | Mihaly |
| 18:07 - 18:13 | Special Guest | 6 min |  -  |
| 18:13 - 18:14 | AWS Gamemasters Intro | 1 min | Linda |
| 18:14 - 18:25 | GameDay Instructions | 11 min | Arnaud & Loïc |
| 18:25 - 18:30 | Distribute Codes | 5 min | Locally at UGs |

## Gameplay Key Moments

| Time (CET) | What Happens |
|-------------|-------------|
| 18:30 | Game starts  -  stream muted, gameplay overlay active |
| 19:30 | Half-time  -  leaderboard shown, QR code for self-check |
| 19:45 - 20:00 | Survey quest unhidden (5000 bonus points) |
| 20:30 | Game ends  -  closing ceremony begins |

## Closing Ceremony

The closing ceremony is split into two compositions for live flexibility:

- **ClosingPreRendered**  -  Pre-rendered. Hero intro showcasing all user groups, fast scroll, and a shuffle countdown building suspense.
- **ClosingWinnersTemplate**  -  **Updated live** with real scores. Bar chart reveal (6th → 1st), podium cards, and thank you. See [TEMPLATE.md](TEMPLATE.md) for setup instructions.

| Time (CET) | What Happens |
|-------------|-------------|
| 20:30 | ClosingPreRendered plays  -  shuffle countdown builds suspense |
| ~20:33 | ClosingWinnersTemplate plays  -  bar chart reveals winners 6th → 1st |
| ~20:38 | Podium + Thank You |
| 20:30 - 21:00 | Local winner ceremonies  -  UG leaders hand out medals and take photos |
| 21:00 | Stream ends with music |

## User Group Logos

The 53+ user group logos are not stored locally  -  they are loaded at render time from a shared Notion database hosted at `awscommunitydach.notion.site`. The URL-to-name mapping lives in `config/logos.ts` as `LOGO_MAP`.

[![Notion Gallery  -  AWS User Groups](screenshots/readme-notion-gallery.png)](https://awscommunitydach.notion.site/89ae998ccfc941f8a4ebf3e7b6586045?v=11f535253b02470f963a6d844ca671d4)
> Click the image to open the public Notion gallery.

This means:
- Rendering requires internet access (Notion image CDN must be reachable)
- If a logo URL is missing or unreachable, a flag-only card is shown
- The `LOGO_MAP` keys must match the group names in `config/participants.ts` exactly
- Speaker/organizer photos (`public/assets/faces/`) are local  -  only UG logos are remote

## Design System

All compositions share a unified design system in `src/design/`:

**Colors** (`src/design/colors.ts`):
| Name | Hex | Usage |
|------|-----|-------|
| `GD_DARK` | `#0c0820` | Background |
| `GD_PURPLE` | `#6c3fa0` | Hex grid, subtle accents |
| `GD_VIOLET` | `#8b5cf6` | Active states, speaker glow |
| `GD_PINK` | `#d946ef` | Highlights, urgency |
| `GD_ACCENT` | `#c084fc` | Labels, secondary text |
| `GD_ORANGE` | `#ff9900` | Warnings, final countdown |
| `GD_GOLD` | `#fbbf24` | Closing ceremony, celebration |

**Shared Components** (`src/components/`):
- `BackgroundLayer`  -  Dark gradient over the landscape image
- `HexGridOverlay`  -  Subtle hexagonal grid pattern
- `GlassCard`  -  Frosted-glass card with blur, border, and shadow
- `AudioBadge`  -  Muted/unmuted indicator (bottom-right)

**Animation Presets** (`src/design/animations.ts`):
- `springConfig.entry`  -  Smooth element entrance
- `springConfig.exit`  -  Gentle element exit
- `springConfig.emphasis`  -  Bouncy attention-grabbing

## Event Timeline (CET Reference)

The event spans 4+ timezones across Europe. All times below are CET  -  local times vary by city. The compositions use frame-based countdowns that are timezone-independent.

```
17:30  EVENT_START      -  Pre-Show begins (optional, local UG setup)
       17:30 - 17:50     Countdown + basic info (teams forming, schedule)
       17:50 - 18:00     Countdown to stream start + audio reminder
18:00  STREAM_START     -  Live stream begins, Main Event composition
       18:00 - 18:06     Community Intro (Linda, Jerome & Anda)
       18:06 - 18:07     Support Process video
       18:07 - 18:13     Special Guest
       18:13 - 18:14     AWS Gamemasters Intro
       18:14 - 18:25     GameDay Instructions (Arnaud & Loïc)
       18:25 - 18:30     Distribute team codes
18:30  GAME_START       -  Gameplay begins (stream muted)
       19:30           Half-time (leaderboard shown)
       19:45 - 20:00     Survey quest unhidden (5000 points)
20:30  GAME_END         -  Closing Ceremony begins (audio back on)
       20:30 - 21:00     Global winners, local ceremonies, wrap-up
21:00  EVENT_END        -  Stream ends with music
```

## The People

- **Linda**  -  Stream Host, AWS Community Hero, AWS & Women's UG Vienna (Austria)
- **Jerome**  -  Co-organizer, AWS User Group Belgium (Brussels)
- **Anda**  -  Co-organizer, AWS User Group Geneva (Switzerland)
- **Mihaly**  -  Support Process, AWS User Group Budapest (Hungary)
- **Arnaud & Loïc**  -  AWS Gamemasters (gameplay instructions)

## For the Community

This project was built entirely by community volunteers for **AWS Community GameDay Europe 2026** (March 17, 2026  -  first edition). If you want to understand how the stream visuals work, modify them for your own event, or learn Remotion  -  you are welcome to explore, fork, and adapt.

See `AGENTS.md` for architecture guidance, `CONTRIBUTING.md` for how to adapt and contribute back, and `docs/` for detailed per-composition documentation.

## License

[CC BY-NC-SA 4.0](LICENSE)  -  Non-commercial community use only. Built by volunteers for the AWS Community GameDay Europe 2026.
