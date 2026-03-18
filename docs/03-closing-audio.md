# 3. Closing Ceremony (Audio)  -  `03-GameDayStreamClosing-Audio.tsx`

## Overview

The Closing Ceremony is the **final 30 minutes** of the GameDay stream (20:30 - 21:00 CET). Audio is back on. This is where results are revealed, global winners are announced (via slides, not on camera), local UG leaders run their own award ceremonies, and the community celebrates together. The stream ends with music.

The visual style shifts from violet/pink to **gold/violet** to signal celebration mode.

## What Attendees See

1. An **"Event Ends In"** countdown (top-left) in gold, counting down from 30:00
2. A **Closing Ceremony sidebar** (right, 42% width) with 7 ceremony segments
3. A **Phase Marker** (bottom-left) with gold/violet progress bar
4. An **Audio Badge** showing "AUDIO ON"
5. **Segment transition flashes**  -  a brief gold/violet screen flash when moving between ceremony segments
6. A **"Thank You"** message in the final segment (frame 41400+)
7. A **fade-to-black** in the last 3 seconds (frames 53910 - 53999)

## Technical Details

| Property | Value |
|----------|-------|
| Duration | 54,000 frames (30 minutes at 30 fps) |
| Resolution | 1280 × 720 |
| FPS | 30 |
| Countdown target | EVENT_END (21:00 CET) |

### Closing Segments

| Segment | Frames | Duration |
|---------|--------|----------|
| Results Reveal | 0 - 5399 | 3 min |
| Global Winner Announcement | 5400 - 12599 | 4 min |
| Local Winner Ceremonies | 12600 - 23399 | 6 min |
| Community Highlights | 23400 - 30599 | 4 min |
| Organizer Shoutouts | 30600 - 37799 | 4 min |
| Sponsor Thanks | 37800 - 41399 | 2 min |
| Thank You & Wrap-Up | 41400 - 53999 | 7 min |

Note: Global top 3 winners are announced via slides only (not shown on camera) due to local setup limitations. Local UG leaders handle their own medal ceremonies and photos.

### Layer Stack

| Layer | Element | Position | Visible |
|-------|---------|----------|---------|
| 1 | BackgroundLayer (darken 0.65) + HexGridOverlay | Full screen | Always |
| 2 | AudioBadge (unmuted) | Bottom-right | Always |
| 3 | Segment Transition Flash | Full screen overlay | On segment change (60 frames) |
| 4 | Event Ends In Countdown | Top-left | Always |
| 5 | Closing Ceremony Sidebar | Right (42% width) | Always |
| 6 | Phase Marker | Bottom-left | Always |
| 7 | "Thank You" Message | Center-left (65% width) | Frame ≥ 41400 |
| 8 | Fade-to-dark | Full screen | Frames 53910 - 53999 |

### Key Visual Details

**Segment Transition Flash:**
When the active segment changes, a brief gold/violet gradient flashes across the full screen for ~2 seconds (60 frames). This creates a visual "moment" that draws attention to the transition.

**Thank You Message (Frame 41400+):**
- "AWS COMMUNITY GAMEDAY EUROPE" label in gold
- Large "Thank You" text with gold/violet text shadow
- "See you at the next GameDay!" subtitle in accent color
- Springs in with a scale animation (0.9 → 1.0)

**Fade to Black:**
The final 90 frames (3 seconds) fade the entire screen to black, providing a clean ending.

### Color Shift

The Closing Ceremony uses `GD_GOLD` as its primary accent instead of `GD_VIOLET`:
- Sidebar active state: gold border + "LIVE" label in gold
- Countdown label: gold
- Phase marker progress: gold → violet gradient
- This signals "celebration mode" vs the violet "information mode" of earlier compositions

## Design Decisions

- **Gold accent**  -  Celebration and achievement feel, distinct from the informational violet of the Main Event.
- **Segment flashes**  -  Brief visual punctuation so attendees notice when the ceremony moves to the next phase, even if they are chatting.
- **Large countdown**  -  110px font size (largest of any composition) because this is the final countdown of the entire event.
- **Thank You message**  -  Takes up 65% of the screen width in the final segment, making it the visual focus while the sidebar still shows progress.
- **Clean fade-out**  -  Professional ending that signals "the stream is over" without an abrupt cut.
