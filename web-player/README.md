# GameDay Web Player

A web-based player that runs the AWS Community GameDay Europe stream compositions directly in the browser using the [Remotion Player](https://remotion.dev/docs/player). It auto-switches between compositions based on the event schedule  -  no manual intervention needed during the live stream.

## Why This Exists

Instead of pre-rendering MP4 files and manually switching between them, this player:

- Renders Remotion compositions **live in the browser** at full resolution (1280×720)
- **Auto-switches** between Pre-Show → Main Event → Gameplay → Closing based on CET time
- Shows a **live Remotion-rendered countdown** with the GameDay design system before the event starts
- Provides **manual override controls** for the stream operator
- Can be **screen-shared via Zoom** to all 53+ User Group locations simultaneously

## Quick Start

```bash
cd web-player
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome.

---

## URL Parameters

The player is fully controllable via URL parameters. This makes it easy to test, demo, and run in production.

### `?segment=`  -  Force a specific segment

Jump directly to any composition without waiting for the schedule.

| URL | What it shows |
|-----|---------------|
| `/?segment=waiting` | Live countdown screen |
| `/?segment=preshow` | Pre-Show composition (muted, loops) |
| `/?segment=mainevent` | Main Event composition (audio) |
| `/?segment=gameplay` | Gameplay overlay (muted) |
| `/?segment=closing` | Closing Ceremony (audio) |
| `/?segment=end` | "Stream Ended" screen |

**Why it exists**: For testing and rehearsal. You can verify each composition renders correctly in the web player without waiting for the actual event time.

### `?time=`  -  Simulate a CET time

Pretend it's a specific time on event day. The schedule logic runs normally.

| URL | Simulated state |
|-----|-----------------|
| `/?time=17:00` | Countdown (before Pre-Show) |
| `/?time=17:45` | Pre-Show |
| `/?time=18:15` | Main Event |
| `/?time=19:00` | Gameplay |
| `/?time=20:35` | Closing |
| `/?time=21:05` | Stream Ended |

**Why it exists**: To test the auto-switching logic. Unlike `?segment=`, this uses the real schedule so you can verify transitions happen at the right times.

### `?date=`  -  Override the event date

Use with `?time=` to simulate a specific date.

```
/?time=18:00&date=2026-03-17
```

**Why it exists**: For testing on days other than the event day.

### `?controls=false`  -  Hide operator controls

Hides the control bar at the bottom. You can still toggle it with `Esc`.

```
/?controls=false
```

**Why it exists**: For a clean display when screen-sharing. You don't want participants to see the operator buttons.

### `?autoplay=true`  -  Production mode

Hides controls completely (no `Esc` toggle) and runs in full auto-schedule mode. This is what you use on event day.

```
/?autoplay=true
```

**Why it exists**: The "set it and forget it" mode. Open this URL, go fullscreen, share in Zoom, and the player handles everything automatically based on the CET clock.

### Combining parameters

```
/?autoplay=true                           → Production: auto-schedule, no controls
/?segment=closing&controls=false          → Preview closing without controls
/?time=17:45&controls=false               → Simulate Pre-Show time, clean display
```

---

## Operator Controls

When controls are visible (default), you'll see a bar at the bottom-left:

- **Auto**  -  Follow the real-time schedule (default)
- **Countdown / 0 - 3**  -  Force-switch to any segment
- Press **Esc** to show/hide controls

---

## Countdown Screen

Before the event starts, the player shows a live Remotion-rendered countdown using the GameDay design system (hex grid, glass cards, purple/gold theme). It displays countdowns to all four milestones:

- Pre-Show (17:30 CET)
- Main Event (18:00 CET)
- Gameplay (18:30 CET)
- Closing Ceremony (20:30 CET)

Each countdown ticks in real-time. When a milestone passes, it shows "✓ LIVE" in green.

---

## How to Share This in Zoom (Step-by-Step)

### Option A: Screen Share with "Optimize for Video Clip" (Recommended)

This gives you **up to 1080p screen share quality**  -  the highest Zoom supports.

1. **Start the web player** in Chrome:
   ```bash
   cd web-player && npm run dev
   ```
2. **Open production URL**: `http://localhost:5173/?autoplay=true`
3. **Make Chrome fullscreen**: Press `F11` (or `Cmd+Ctrl+F` on Mac)
4. **In Zoom**, click the green **Share Screen** button
5. In the share dialog:
   - Select the **Chrome window** showing the player
   - ✅ Check **"Share sound"** (bottom-left)  -  critical for audio compositions
   - ✅ Check **"Optimize for video clip"** (bottom-left)
6. Click **Share**

> **Why "Optimize for video clip"?**
> Without it, Zoom treats your screen as static content and sends it at a low frame rate, causing stuttering. With it enabled, Zoom prioritizes smooth video playback. It adjusts resolution to 720p but the motion is smooth.
>
> 📖 [Zoom: Optimizing a shared video in full screen](https://support.zoom.com/hc?id=zm_kb&sysparm_article=KB0068426)

### Option B: Share as Video File (for pre-rendered MP4s)

If you pre-render compositions to MP4 first:

1. In Zoom, click **Share Screen** → **Advanced** tab → **"Video"**
2. Select your MP4 file

> 📖 [Zoom: Sharing a recorded video with sound](https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0064733)

### Zoom Settings to Check Before the Event

**Settings → Video:**
- ✅ HD video: Enabled
- ✅ Original ratio: Enabled (prevents cropping)

**Settings → Share Screen:**
- Window size when screen sharing: "Maintain current size"

> 📖 [Zoom: Video settings guide](https://alamocolleges.screenstepslive.com/a/1175251-how-to-share-video-and-update-video-settings)

### Tips for Maximum Quality

1. **Use wired ethernet**  -  WiFi packet loss degrades video quality
2. **Close other apps**  -  Zoom + Chrome need CPU for smooth playback
3. **Use Chrome**  -  Best Remotion Player performance
4. **Test beforehand**  -  Do a full dry run with a test Zoom call
5. **Disable Zoom virtual backgrounds**  -  They consume GPU
6. **Participants: Gallery View**  -  Maximizes the shared screen

---

## Configuring the Schedule

Edit `src/schedule.ts`:

```ts
export const EVENT_DATE = "2026-03-17"; // Tuesday

export const SCHEDULE = [
  { id: "preshow",   start: "17:30", label: "Pre-Show (Muted)" },
  { id: "mainevent", start: "18:00", label: "Main Event (Audio)" },
  { id: "gameplay",  start: "18:30", label: "Gameplay (Muted)" },
  { id: "closing",   start: "20:30", label: "Closing Ceremony (Audio)" },
  { id: "end",       start: "21:00", label: "Stream Ended" },
];
```

---

## Architecture

```
web-player/
├── index.html              # Entry point
├── package.json            # Dependencies (Vite + Remotion Player)
├── vite.config.ts          # Vite config with alias to parent compositions
├── tsconfig.json           # TypeScript config
└── src/
    ├── main.tsx            # React mount
    ├── App.tsx             # Player + schedule logic + operator controls
    ├── Countdown.tsx       # Remotion composition: live countdown screen
    └── schedule.ts         # Event date, times, composition metadata
```

The player imports compositions directly from the parent project via a Vite alias. No code duplication.

## Deployment

Local (recommended for stream operator):
```bash
npm run dev
```

Static build for hosting:
```bash
npm run build    # outputs to dist/
npm run preview  # test locally
```

Deploy `dist/` to Vercel, Netlify, or any static host for a backup URL other UG leaders can open.
