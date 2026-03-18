# Stream Operator Playbook

This guide is for the person running the stream during a live AWS Community GameDay event.

Inserts are full-screen slides you switch to on demand - they are not automated. This document explains when to use them, how to prepare them ahead of time, and how to think about the stream like a live broadcast director rather than a tech operator.

---

## Core principle

Inserts were not part of the GameDay Europe 2026 stream. They exist because participant feedback showed that location-aware, team-specific moments would significantly increase engagement - especially for the participating user groups watching from their own cities.

The goal is **not** to create a chat or distraction. Teams are competing and need to focus. Inserts replace what would otherwise be a static gameplay screen with brief, relevant moments that acknowledge what's happening - then return to gameplay immediately. 30 seconds maximum. No back-and-forth.

---

## Preparation before the event

These inserts require data you don't have until the day of the event. Prepare them in advance where possible:

**Needs data from the platform (update live):**
- `Insert-FirstCompletion` - team name, quest name
- `Insert-CloseRace` - team names, point difference
- `Insert-ComebackAlert` - team name, from/to rank
- `Insert-TopTeams` - current standings array
- `Insert-CollectiveMilestone` - completed count, total count
- `Insert-FinalCountdown` - minutes remaining

**Can be prepared before the event:**
- `Insert-TeamSpotlight` - pick 3-4 teams to feature, write the FACT line ahead of time
- `Insert-LocationShoutout` - list of cities to shout out in order
- `Insert-QuestHint` - gamemasters write hints for each quest ahead of time
- `Insert-GamemastersUpdate` - set the default MESSAGE, update live if needed
- All event-flow inserts (QuestsLive, HalfTime, etc.) - no data needed

---

## Suggested run order for a 3-hour event

This is a guide, not a script. React to what's actually happening.

### Pre-event (before kickoff)
- `00-InfoLoop` running

### Kickoff (T+0)
- Switch to `01-MainEvent` for the opening
- Transition to `02-Gameplay` when teams start

### Early game (T+15 to T+45)
- **T+15** - `Insert-QuestsLive` once quests are confirmed live
- **T+20** - `Insert-TeamSpotlight` (first team feature - sets the tone early)
- **T+30** - `Insert-LocationShoutout` (greet cities joining the stream)
- Watch the leaderboard - the first `Insert-FirstCompletion` usually happens around here

### Mid game (T+45 to T+90)
- **T+60** - `Insert-HalfTime`
- **T+60** - `Insert-TopTeams` (show current standings immediately after halftime)
- **T+65** - `Insert-TeamSpotlight` (second feature - pick a different region than the first)
- Watch for: close race forming → `Insert-CloseRace`
- Watch for: team climbing → `Insert-ComebackAlert`
- Watch for: quest milestone → `Insert-CollectiveMilestone`
- If quests unlock in waves → `Insert-NewQuestAvailable`

### Late game (T+90 to T+120)
- **T+90** - `Insert-LeaderboardHidden` if scores go dark
- **T+105** - `Insert-FinalCountdown` (15 minutes remaining)
- **T+110** - `Insert-TeamSpotlight` (final team feature - pick a team that's had a good run)
- **T+118** - `Insert-FinalCountdown` (2 minutes remaining) - optional, higher tension

### End of game
- **T+120** - `Insert-ScoresCalculating`
- Switch to `03A-ClosingPreRendered` when ready
- Switch to `03B-ClosingWinnersTemplate` for the winners reveal

---

## Reactive inserts (use when something happens)

These should not be scheduled - they respond to live events:

| What's happening | Insert to use |
|-----------------|---------------|
| First team finishes a quest | `Insert-FirstCompletion` |
| Two teams within 50-100 points | `Insert-CloseRace` |
| Team jumps 5+ positions | `Insert-ComebackAlert` |
| Quest breaks | `Insert-QuestBroken` → fix → `Insert-QuestFixed` |
| Platform issue | `Insert-TechnicalIssue` |
| Gamemasters have a message | `Insert-GamemastersUpdate` |
| Stream host has an update | `Insert-StreamHostUpdate` |
| Scores adjusted | `Insert-ScoreCorrection` |
| Break needed | `Insert-BreakAnnouncement` → return → `Insert-WelcomeBack` |

---

## Rules for operators

**Max frequency:** One insert every 10 minutes during active gameplay. Exception: reactive inserts triggered by actual events (quest breaks, first completion, etc.) can happen whenever they happen.

**No chatting:** Inserts replace a static screen for 30 seconds. There is no expectation of a response or interaction. Teams are competing - the insert acknowledges what's happening without demanding attention.

**Sequence matters:** `BreakAnnouncement` → `WelcomeBack`. `LeaderboardHidden` → `ScoresCalculating` → closing. Do not skip steps.

**Return promptly:** After an insert ends (30 seconds), return to the gameplay composition immediately. Never leave an insert running longer than its intended duration.

---

## How to switch compositions in Remotion Studio

1. Open Remotion Studio (`npm run dev`)
2. Select the insert you want from the left sidebar (they all start with `Insert-`)
3. Update the variables at the top of the `.tsx` file if needed (save to hot-reload)
4. Screen-share the Remotion Studio preview window
5. Hit play, or use the timeline to scrub to the right frame
6. After 30 seconds, switch back to `02-Gameplay` in the sidebar

Alternatively, render the insert to a video file (`npx remotion render Insert-QuestsLive`) and play it from your video switcher.

---

## TeamSpotlight prep template

Before the event, prepare 3-4 team spotlights. Example:

```
TEAM_NAME = "The Serverless Shepherds"
USER_GROUP = "AWS User Group Vienna"
COUNTRY = "Austria"
COUNTRY_FLAG = "🇦🇹"
FACT = "Four first-time GameDay participants, all from the same Meetup group"
```

Good FACT lines: first-time participants, notable distance traveled, unique team composition, cross-country collaboration.

Bad FACT lines: job titles, company names, anything that sounds corporate.

---

## A note on commentary vs. distraction

The distinction is simple: an insert tells teams something they need to know or acknowledges something that just happened. It does not ask them to do anything, respond to anything, or stop what they are doing.

> "First team to complete Quest 3!" - tells teams the quest is achievable, creates motivation
> "Comment below who you think will win!" - demands attention away from the game

All inserts in this library follow the first pattern.
