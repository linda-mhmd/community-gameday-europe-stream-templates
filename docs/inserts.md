# Insert Compositions - Contributor Guide

Short-lived full-screen compositions (30 seconds) for live use during gameplay.
Each is independently renderable and screen-shareable from Remotion Studio.

## Color System

The color system communicates meaning at a glance:

| Color   | Hex       | Token      | When to use                                    |
|---------|-----------|------------|------------------------------------------------|
| Violet  | #8b5cf6   | GD_VIOLET  | Community topics, team-facing information      |
| Orange  | #ff9900   | GD_ORANGE  | AWS environment, technical infrastructure      |
| Gold    | #fbbf24   | GD_GOLD    | General updates, milestones, good news         |
| Green   | #22c55e   | GD_GREEN   | Fixed, resolved, working, success              |
| Red     | #ef4444   | GD_RED     | Broken, error, unavailable, problem            |
| Accent  | #c084fc   | GD_ACCENT  | Location highlights, neutral information       |

The color of an insert signals intent before text is read. Use the right color.

## All Available Inserts

### Event Flow

These mark the major transitions and set the rhythm of the broadcast.

**Insert-QuestsLive** (orange)
The kickoff whistle. Show this the instant quests become accessible to all teams.
No variables to update

**Insert-HalfTime** (gold)
Use at the 60-minute mark.
No variables to update

**Insert-LeaderboardHidden** (gold)
Scores go dark for the final stretch. Real GameDay mechanic - builds suspense and forces teams to play to win, not to protect.
No variables to update

**Insert-ScoresCalculating** (gold)
Show this after gameplay ends while scores are being tallied. The "halftime recap" bridge before the winner reveal.
No variables to update

### Live Commentary Moments

The broadcast equivalent of a commentator calling a goal, a comeback, or a close race. Use these to keep the stream feeling alive and personal.

**Insert-QuestsLive** (orange) - see Event Flow above

**Insert-FirstCompletion** (accent)
The "goal scored" moment. Use the instant a team becomes first to complete a specific quest.
Update: `QUEST_NAME`, `TEAM_NAME`, `TEAM_GROUP` at the top of `FirstCompletion.tsx`

**Insert-CloseRace** (accent)
Two teams separated by a small margin. "Everything can change in the next quest."
Update: `TEAM_A`, `TEAM_B`, `POINT_DIFF` at the top of `CloseRace.tsx`

**Insert-ComebackAlert** (accent)
The underdog story. A team has dramatically climbed the rankings. Show the rank jump visually.
Update: `TEAM_NAME`, `USER_GROUP`, `FROM_RANK`, `TO_RANK` at the top of `ComebackAlert.tsx`

**Insert-TeamSpotlight** (violet)
Human interest - use during gameplay lulls to feature a specific team. Gives the audience someone to root for.
Update: `TEAM_NAME`, `USER_GROUP`, `COUNTRY`, `COUNTRY_FLAG`, `FACT` at the top of `TeamSpotlight.tsx`
Note: country flag emoji is allowed here - it is location-specific context.

**Insert-CollectiveMilestone** (accent)
The crowd-wave moment. "X out of Y teams have completed Quest Z." Shows shared progress with an animated fill bar.
Update: `QUEST_NAME`, `COMPLETED_COUNT`, `TOTAL_COUNT` at the top of `CollectiveMilestone.tsx`

**Insert-TopTeams** (violet)
Mid-game standings snapshot - not the final result. Reveals the current order to drive competition.
Update: `LABEL` and the `TOP_TEAMS` array in `TopTeams.tsx`

### Quest and Gameplay

**Insert-QuestFixed** (green)
Use when a broken quest is repaired and teams can proceed.
Update: `QUEST_NAME` at the top of `QuestFixed.tsx`

**Insert-QuestBroken** (red)
Use when a quest stops working and teams should skip it.
Update: `QUEST_NAME` at the top of `QuestBroken.tsx`

**Insert-QuestUpdate** (green + orange)
Use when a quest was fixed AND a new quest is available simultaneously.
Two-card layout - edit content in `QuestUpdate.tsx`

**Insert-NewQuestAvailable** (orange)
A new quest just unlocked mid-game. Different from QuestFixed (that repairs something broken) - this is a fresh quest that wasn't available before.
Update: `QUEST_NAME`, `DESCRIPTION` at the top of `NewQuestAvailable.tsx`

**Insert-SurveyReminder** (gold)
Use when a bonus survey quest becomes available.
Update: `QUEST_NAME` in `SurveyReminder.tsx`

### Environment and Technical

**Insert-StreamInterruption** (orange + violet)
Use for combined environment status + community reminder. Two-card layout.
Edit both cards directly in `StreamInterruption.tsx`

**Insert-TechnicalIssue** (red)
Use for known platform or environment issues being investigated.
Update: `QUEST_NAME` and `MESSAGE` in `TechnicalIssue.tsx`

**Insert-QuestHint** (orange)
Use when many teams are stuck on a quest and the gamemasters want to give a nudge without revealing the full solution.
Update: `QUEST_NAME`, `HINT_TEXT` at the top of `QuestHint.tsx`

**Insert-GamemastersUpdate** (orange)
Use when the Gamemasters have a live announcement.
Names, roles, and face photos are pulled automatically from `AWS_SUPPORTERS` in `config/participants.ts` (entries with `country === "Gamemaster"`).
Update: `MESSAGE` at the top of `GamemastersUpdate.tsx`

**Insert-ScoreCorrection** (violet)
Use when scores were adjusted or corrected.
Update: `REASON` in `ScoreCorrection.tsx`

### Time and Progress

**Insert-HalfTime** (gold)
Use at the 60-minute mark. Leaderboard becomes visible.
No variables to update - show as-is

**Insert-FinalCountdown** (orange)
Use for the last 15 or 30 minutes warning.
Update: `MINUTES_REMAINING` in `FinalCountdown.tsx`

**Insert-GameExtended** (gold)
Use when extra time is added to the game.
Update: `EXTRA_MINUTES` in `GameExtended.tsx`

**Insert-Leaderboard** (violet)
Use when leaderboard scores have been updated.
No variables to update - show as-is

### Location and Community

**Insert-LocationShoutout** (accent)
Use to greet a specific city or user group during the stream.
Update: `CITY`, `COUNTRY` in `LocationShoutout.tsx`

### Generic

**Insert-BreakAnnouncement** (violet)
Use for any short pause in the stream.
No variables to update

**Insert-WelcomeBack** (violet)
Use when resuming after a break. Pair with BreakAnnouncement.
No variables to update

**Insert-StreamHostUpdate** (violet)
Use when the stream host (community organizer) has something to say.
Face photo, name, and role are pulled from `ORGANIZERS` in `config/participants.ts`.
Update: `STREAM_HOST_NAME` and `MESSAGE` at the top of `StreamHostUpdate.tsx`

**Insert-ImportantReminder** (gold)
Use for anything that does not fit the categories above.
Update: `TITLE` and `MESSAGE` in `ImportantReminder.tsx`

## Creating a New Insert

1. Copy `_TEMPLATE.tsx`, rename it
2. Change `TITLE`, `MESSAGE`, `ACCENT` at the top
3. Register in `src/Root.tsx` with `Insert-` prefix
4. Done

For more complex layouts (dual cards, status badges) use `QuestUpdate.tsx` as a reference.

## Design Rules

- No emojis. Use inline SVG icons only (see existing inserts for patterns)
- Use the color coding table above - do not invent new colors for inserts
- Keep message text short - read from a distance on a shared screen
- Duration is always 900 frames (30 seconds) - do not change this
- All inserts fade out 2 seconds before the end (frame 840)
- Footer always reads "AWS Community GameDay Europe"
- StatusBadge component is defined locally in each file that uses it

## Screenshots

[Add screenshots here as the library grows - one per insert, showing a representative frame around frame 300]
