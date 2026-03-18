# 1. Main Event (Audio)  -  `01-GameDayStreamMainEvent-Audio.tsx`

## Overview

The Main Event is the **live introduction composition**  -  the 30 minutes between when the stream goes live (18:00) and when the game starts (18:30). This is where attendees learn what the GameDay is, who organized it, how it works, and receive their team codes.

This is the most complex composition because it must serve attendees who:
- Have **no idea** who Linda Mohamed is or why she is on their screen
- May have **bad audio** or no audio at all
- Are in one of **53+ different cities** across Europe
- Are used to their **local User Group organizer** running events, not a remote stream

Every critical piece of information from the live moderation must appear as **on-screen text**.

## What Attendees See

### First 60 Seconds (Frames 0 - 1799)  -  Linda's Introduction

The stream host Linda Mohamed speaks live. On screen, attendees see:

1. A **GameDay Countdown** timer (top-left) showing 30:00 counting down
2. A **Europe Map** background with a radial vignette fade
3. **Info Cards** appearing in sequence  -  glass-card overlays showing key points from Linda's spoken script:
   - "53+ AWS User Groups across 20+ countries competing simultaneously"
   - "Connect your audio now  -  use fallback video if needed"
   - "Stream will be muted during gameplay  -  we'll be back for the ceremony"
   - "Organized by community volunteers, not AWS employees"
   - "Meet the Organizers  -  Jerome & Anda"
4. A **Stream Host Card** (bottom-left) showing Linda's face, name, title, and UG Vienna logo
5. A **Schedule Sidebar** (right side, 42% width) listing the 6 segments
6. A **Phase Marker** (bottom-left) showing current phase and progress
7. An **Audio Badge** (bottom-right) showing "AUDIO ON"

### After 60 Seconds (Frame 1800+)  -  Jerome & Anda

Jerome and Anda appear on camera. The info cards and stream host card disappear. The sidebar, countdown, phase marker, and audio badge remain for the full 30 minutes.

### Final 5 Minutes (Frame 45000+)  -  Distribute Codes

The countdown moves to center-screen with a pulsing orange glow. Teams receive their access codes.

## Full Moderation Script (First 60 Seconds)

This is the exact text Linda speaks. Every key point appears as an on-screen info card:

> Hello everybody and welcome to the first AWS Community GameDay Europe. Today we will have 53 AWS User Groups all over Europe competing against each other within X different countries and different timezones. From now on you will see a countdown here at the top right corner of the screen where this stream is shared with you. If you cannot hear us, now is the last chance to connect to your audio and if it is not working, for whatever reason, use the provided video as a fallback so that you don't miss the important GameDay instructions. This stream is going to be muted as soon as the game starts but we will see us again as soon as the second timer runs out to celebrate the global winners together, so make sure you stay in the stream so that you don't miss anything that probably happens in between  -  again, there will be no audio from our side during gameplay. Before we start the game I would like to introduce you to some people and clarify some things that probably some of you are still wondering about. This event consists of two very important parts coming together: the AWS Community and AWS itself. All of the organization behind this event was done by the AWS Community  -  so people who are not employed by AWS and do all of that voluntary in their free time  -  just like every User Group leader that is organizing one of the events in the 53 cities that are participating. I want to introduce you to the 2 most important people behind this initiative. Anda and Jerome!

## Technical Details

| Property | Value |
|----------|-------|
| Duration | 54,000 frames (30 minutes at 30 fps) |
| Resolution | 1280 × 720 |
| FPS | 30 |
| Countdown target | GAME_START (18:30 event time) |

### Data Arrays (Immutable)

**MAIN_EVENT_SEGMENTS**  -  6 high-level schedule segments (matching sidebar display order):

| Segment | Time | Frames | Duration | Speakers |
|---------|------|--------|----------|----------|
| Community Intro | 18:00 - 18:06 | 0 - 10799 | 6 min | Jerome & Anda |
| Support Process | 18:06 - 18:07 | 10800 - 12599 | 1 min |  -  |
| Special Guest | 18:07 - 18:13 | 12600 - 23399 | 6 min |  -  (not revealed) |
| AWS Gamemasters Intro | 18:13 - 18:14 | 23400 - 25199 | 1 min |  -  |
| GameDay Instructions | 18:14 - 18:25 | 25200 - 44999 | 11 min | Arnaud & Loïc |
| Distribute Codes | 18:25 - 18:30 | 45000 - 53999 | 5 min |  -  |

**TIMELINE_CHAPTERS**  -  12 detailed chapter markers for Remotion Studio:

| Chapter | Frames | Speakers |
|---------|--------|----------|
| Linda  -  Welcome & Intro | 0 - 1799 | Linda Mohamed |
| Jerome & Anda  -  Community GameDay | 1800 - 9299 | Jerome & Anda |
| Linda  -  Transition | 9300 - 10799 | Linda Mohamed |
| Support Process Video | 10800 - 12599 |  -  |
| Linda Introduces Special Guest | 12600 - 14399 | Linda Mohamed |
| Special Guest | 14400 - 23399 |  -  |
| AWS Gamemasters Intro | 23400 - 25199 |  -  |
| GameDay Rules & Scoring | 25200 - 32399 | Arnaud & Loïc |
| Challenge Walkthrough | 32400 - 39599 | Arnaud & Loïc |
| Tips & Best Practices | 39600 - 44999 | Arnaud & Loïc |
| Distribute Team Codes | 45000 - 49499 |  -  |
| Final Prep & Go! | 49500 - 53999 |  -  |

### Info Cards (Intro Section)

| # | Label | Frames | Border Color | Highlight |
|---|-------|--------|-------------|-----------|
| 1 | FIRST AWS COMMUNITY GAMEDAY EUROPE | 0 - 299 | GD_ACCENT |  -  |
| 2 | AUDIO CHECK | 300 - 599 | GD_ORANGE | "Connect your audio now" |
| 3 | IMPORTANT | 600 - 899 | GD_PINK | "muted during gameplay" |
| 4 | ORGANIZED BY THE COMMUNITY | 900 - 1349 | GD_PINK | "not employed by AWS" |
| 5 | MEET THE ORGANIZERS | 1350 - 1799 | GD_VIOLET |  -  |

### Layer Stack

| Layer | Element | Position | Visible |
|-------|---------|----------|---------|
| 1 | BackgroundLayer + HexGridOverlay | Full screen | Always |
| 1b | Europe Map (vignette) | Center | Frames 0 - 12000 |
| 2 | AudioBadge (unmuted) | Bottom-right | Always |
| 4 | Distribute Codes Countdown | Top center | Frame ≥ 45000 |
| 5a | GameDay Countdown | Top-left | Frame < 45000 |
| 5b | Schedule Sidebar | Right (42% width) | Frame ≥ 600 |
| 6 | Info Cards | Left (50% width) | Frames 0 - 1799 |
| 6b | Stream Host Card (Linda) | Bottom-left | Frame < 1800 |
| 7 | Phase Marker | Bottom-left | Always |

### Key Components

- **InfoCardDisplay**  -  Renders the active info card with spring entry and fade exit
- **StreamHostCard**  -  Linda's avatar, name, title, UG Vienna logo
- **ScheduleCard**  -  Individual sidebar segment with active/completed/upcoming states
- **PhaseMarker**  -  Current phase label + progress bar

## Planned Redesign

The Main Event is currently being redesigned (see `.kiro/specs/gameday-mainevent-redesign/`). The redesign adds:

- **SpeakerBubbles**  -  Floating avatar bubbles showing current + next speaker from frame 0
- **CompactSidebar**  -  Sidebar shrinks at frame 1800 when Jerome & Anda appear
- **OrganizerSection**  -  Persistent Jerome & Anda cards with "Currently Speaking" context
- **PhaseTimeline**  -  Enhanced progress bar with milestone markers and snail mascot
- **Improved info cards**  -  Better timing, highlight styling, and full moderation coverage
- **Visual fixes**  -  Seamless map edges, aligned host card, consistent font sizes
