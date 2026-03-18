# 0. Pre-Show (Muted)  -  `00-GameDayStreamPreShow-Muted.tsx`

## Overview

The Pre-Show is a **looping countdown composition** that plays on screen at every participating User Group location before the live stream begins. It runs for 10 minutes per loop and is designed to loop 3 times (30 minutes total, from 17:30 to 18:00 CET).

The pre-show has two phases:
- **17:30 - 17:50**  -  Countdown to teams being formed, showing basic event information and schedule
- **17:50 - 18:00**  -  Countdown to stream start with reminders (turn on audio, audio test at 17:55)

Local User Groups can do whatever they want during this time  -  the pre-show is just a visual backdrop. Its job is simple: tell attendees what is about to happen, show them the schedule, and count down to the stream start and game start.

## What Attendees See

When you walk into your local User Group meetup and look at the screen, you see:

1. A large **"AWS Community GameDay Europe"** title with "2025 · First Edition" subtitle
2. Two countdown timers side by side:
   - **Stream Starts In** (pink)  -  counting down to when the live host appears
   - **GameDay Countdown** (violet)  -  counting down to when the actual game begins
3. An **Event Schedule** at the bottom showing the 4 phases: Pre-Show (30 min), Introductions (30 min), Gameplay (2 hours), Closing (30 min)
4. An **Audio Badge** in the bottom-right showing "MUTED" (the pre-show has no audio)
5. In the final 2 minutes: an **Audio Cue Banner** warning attendees to prepare their speakers

## Technical Details

| Property | Value |
|----------|-------|
| Duration | 18,000 frames (10 minutes at 30 fps) |
| Resolution | 1280 × 720 |
| FPS | 30 |
| Loop count | 3 (controlled by `loopIteration` prop: 0, 1, 2) |
| Total play time | 30 minutes |

### Props

```typescript
interface PreShowProps {
  loopIteration?: number; // 0, 1, or 2  -  adjusts countdown offsets
}
```

The `loopIteration` prop shifts the countdown calculations so that each 10-minute loop shows the correct remaining time. Loop 0 starts at 30:00, loop 1 at 20:00, loop 2 at 10:00.

### Layer Stack

| Layer | Element | Position | Visible |
|-------|---------|----------|---------|
| 1 | BackgroundLayer + HexGridOverlay | Full screen | Always |
| 2 | AudioBadge (muted) | Bottom-right | Always |
| 3 | Event Title | Top center | Always |
| 4 | Countdown Timers (Stream + Game) | Center | Always |
| 5 | Schedule Preview (4 phases) | Bottom center | Always |
| 6 | Audio Cue Banner | Top center | Frame ≥ 14400 (last 2 min) |

### Timeline Chapters (Remotion Studio)

| Chapter | Frames | Duration |
|---------|--------|----------|
| Title & Countdowns | 0 - 5399 | 3 min |
| Schedule Preview | 5400 - 10799 | 3 min |
| Community Info | 10800 - 14399 | 2 min |
| Audio Cue  -  Prepare Speakers | 14400 - 17999 | 2 min |

### Animations

- All elements use `staggeredEntry` for sequential reveal on composition start
- Countdown timers have a subtle `timerPulse` (scale 1.0 → 1.02 → 1.0 every 2 seconds)
- Audio Cue Banner springs in at frame 14400 with a gentle pulse effect
- Schedule cards slide in from right with staggered delays

### Key Function

```typescript
export function isAudioCueBannerVisible(frame: number): boolean {
  return frame >= 14400; // Last 2 minutes of each 10-min loop
}
```

This is exported for property-based testing.

## Design Decisions

- **No audio**  -  The pre-show is a visual-only loop. Attendees are still arriving and setting up.
- **Relative durations only**  -  The schedule shows "30 min", "2 hours" etc. instead of clock times, because the event spans 4+ timezones.
- **Loop-aware countdowns**  -  The `loopIteration` prop ensures countdowns are accurate across all 3 loops.
- **Audio cue at the end**  -  Warns attendees to connect speakers before the live stream starts.
