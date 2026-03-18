# 2. Gameplay (Muted)  -  `02-GameDayStreamGameplay-Muted.tsx`

## Overview

The Gameplay composition is the **muted overlay** that displays during the 2-hour competitive game (18:30 - 20:30 event time). The stream audio is muted  -  teams are playing the AWS GameDay challenges at their local User Group locations.

This composition is intentionally minimal. Its job is to:
- Show a countdown to game end
- Indicate the current gameplay quarter
- Warn teams when time is running low
- Alert everyone to prepare speakers for the closing ceremony

## What Attendees See

For most of the 2 hours, the screen shows:

1. A **Time Left** countdown (top-right, compact GlassCard) counting down from 120:00
2. A **Phase Indicator** (bottom-left) showing the current quarter (e.g., "Hour 1  -  Q2")
3. An **Audio Badge** showing "MUTED"
4. The background with minimal darkening (0.25) so it feels lighter than other compositions

### Final 30 Minutes (Frame 162000+)

- The countdown label stays "Time Left" but the timer color shifts to **GD_ORANGE**
- A **"Final 30 Minutes"** text appears bottom-right with a subtle pulse
- The timer gets a gentle scale pulse (1.0 → 1.04 → 1.0)

### Final 5 Minutes (Frame 207000+)

- The countdown shifts to **GD_PINK** with an urgency glow
- The label changes to **"Almost Done!"**
- A pulsing pink box-shadow creates visual urgency
- An **Audio Cue Banner** appears at the top: "Audio will be needed for Closing Ceremony  -  Prepare your speakers"

## Technical Details

| Property | Value |
|----------|-------|
| Duration | 216,000 frames (120 minutes at 30 fps) |
| Resolution | 1280 × 720 |
| FPS | 30 |
| Countdown target | GAME_END (20:30 event time) |

### Gameplay Phases (8 quarters)

| Phase | Frames | Duration |
|-------|--------|----------|
| Hour 1  -  Q1 (0 - 15 min) | 0 - 26999 | 15 min |
| Hour 1  -  Q2 (15 - 30 min) | 27000 - 53999 | 15 min |
| Hour 1  -  Q3 (30 - 45 min) | 54000 - 80999 | 15 min |
| Hour 1  -  Q4 (45 - 60 min) | 81000 - 107999 | 15 min |
| Hour 2  -  Q1 (60 - 75 min) | 108000 - 134999 | 15 min |
| Hour 2  -  Q2 (75 - 90 min) | 135000 - 161999 | 15 min |
| Hour 2  -  Q3 (90 - 105 min) | 162000 - 188999 | 15 min |
| Hour 2  -  Final Q (105 - 120 min) | 189000 - 215999 | 15 min |

### Exported Helper Functions

These are exported for property-based testing:

```typescript
// Audio cue banner visible in final 5 minutes
export function isGameplayAudioCueBannerVisible(frame: number): boolean {
  return frame >= 207000;
}

// Final 30 minutes  -  orange urgency
export function isFinal30MinutesActive(frame: number): boolean {
  return frame >= 162000;
}

// Final 5 minutes  -  pink urgency glow
export function isUrgencyGlowActive(frame: number): boolean {
  return frame >= 207000;
}
```

### Layer Stack

| Layer | Element | Position | Visible |
|-------|---------|----------|---------|
| 1 | BackgroundLayer (darken 0.25) | Full screen | Always |
| 2 | AudioBadge (muted) | Bottom-right | Always |
| 3 | Time Left Countdown | Top-right | Always |
| 4 | Phase Indicator | Bottom-left | Always |
| 5 | "Final 30 Minutes" text | Bottom-right | Frame ≥ 162000 |
| 6 | Audio Cue Banner | Top center | Frame ≥ 207000 |

## Design Decisions

- **Minimal overlay**  -  Teams are focused on their AWS consoles, not the stream. The overlay should be unobtrusive.
- **Light background**  -  Only 25% darkening (vs 60 - 70% in other compositions) to feel less heavy during the long gameplay period.
- **No sidebar**  -  No schedule needed during gameplay. Just the timer and phase.
- **Progressive urgency**  -  Visual intensity increases gradually: normal → orange (30 min) → pink glow (5 min) to naturally draw attention as time runs out.
- **Audio cue**  -  Critical reminder since the closing ceremony requires audio and teams may have disconnected speakers.

## Key Gameplay Moments

| Time (CET) | Frame | What Happens |
|-------------|-------|-------------|
| 19:30 | 108000 | Half-time  -  leaderboard shown, QR code for self-check |
| 19:45 - 20:00 | 135000 - 162000 | Survey quest unhidden (5000 bonus points) |
| 20:00 | 162000 | Final 30 minutes  -  orange urgency begins |
| 20:25 | 207000 | Final 5 minutes  -  pink urgency glow + audio cue banner |
| 20:30 | 216000 | Game ends |

All information during gameplay is visual only  -  no voice communication from the stream during this phase. The leaderboard will be shown periodically, and a QR code is provided so attendees can check it on their own devices.
