# 🏆 Live Winners Template — How to Update

This document explains how to update the **GameDayClosingWinners** composition with real winner data during the live GameDay stream.

## Quick Summary

- **File to edit:** `03b-ClosingWinners.tsx`
- **What to update:** The `PODIUM_TEAMS` array (line ~65)
- **When:** During the live stream, after final scores are in
- **Then:** Re-render the composition in Remotion Studio or via CLI

## Template Data Structure

The `PODIUM_TEAMS` array in `03b-ClosingWinners.tsx` holds 6 entries, ranked 1st to 6th:

```typescript
export const PODIUM_TEAMS: TeamData[] = [
  { teamName: "The Cloud Ninjas",   ugName: "AWS User Group Belgium",        flag: "🇧🇪", city: "Brussels, Belgium",  score: 18500 },
  { teamName: "Serverless Squad",   ugName: "AWS User Group Vienna",         flag: "🇦🇹", city: "Vienna, Austria",    score: 15200 },
  { teamName: "Lambda Lords",       ugName: "Berlin AWS User Group",         flag: "🇩🇪", city: "Berlin, Germany",    score: 12800 },
  { teamName: "DynamoDB Dragons",   ugName: "AWS User Group France- Paris",  flag: "🇫🇷", city: "Paris, France",      score: 11500 },
  { teamName: "S3 Surfers",         ugName: "Grenoble AWS User Group",       flag: "🇫🇷", city: "Grenoble, France",   score: 10200 },
  { teamName: "CloudFormation Crew", ugName: "Lille AWS User Group",         flag: "🇫🇷", city: "Lille, France",      score: 8900  },
];
```

## Field Reference

| Field      | Description                          | Example                        |
|------------|--------------------------------------|--------------------------------|
| `teamName` | The team's chosen name (most prominent on screen) | `"The Cloud Ninjas"` |
| `ugName`   | User Group name — **must match a key in `LOGO_MAP`** from `archive/CommunityGamedayEuropeV4.tsx` | `"AWS User Group Belgium"` |
| `flag`     | Country flag emoji                   | `"🇧🇪"`                        |
| `city`     | City, Country label                  | `"Brussels, Belgium"`          |
| `score`    | Final score (integer)                | `18500`                        |

### Important: `ugName` must match exactly

The `ugName` field is used to look up the User Group logo. It must match one of the keys in `LOGO_MAP` defined in `archive/CommunityGamedayEuropeV4.tsx`. If it doesn't match, no logo will be displayed for that team.

To see all valid `ugName` values, check the `LOGO_MAP` export in that file.

## How to Update (Manual)

1. Open `03b-ClosingWinners.tsx`
2. Find the `PODIUM_TEAMS` array (~line 65)
3. Replace the 6 placeholder entries with real winner data
4. Entries must be ordered by rank: index 0 = 1st place, index 5 = 6th place
5. Save the file — Remotion Studio will hot-reload automatically
6. Render via Studio UI or CLI: `npx remotion render GameDayClosingWinners`

## How to Update (Lambda / Automated)

For automated updates during the live stream, a Lambda function can:

1. Fetch final scores from the GameDay scoring API
2. Map each winning team to the `TeamData` structure above
3. Write the updated `PODIUM_TEAMS` array to `03b-ClosingWinners.tsx`
4. Trigger a Remotion render via CLI or Remotion Lambda

### Lambda Integration Points

```
Input:  GameDay Scoring API → top 6 teams with scores
Output: Updated PODIUM_TEAMS array in 03b-ClosingWinners.tsx
Render: npx remotion render GameDayClosingWinners --output=out/closing-winners.mp4
```

### JSON payload format (for Lambda input)

```json
{
  "winners": [
    { "teamName": "The Cloud Ninjas", "ugName": "AWS User Group Belgium", "flag": "🇧🇪", "city": "Brussels, Belgium", "score": 18500 },
    { "teamName": "Serverless Squad", "ugName": "AWS User Group Vienna", "flag": "🇦🇹", "city": "Vienna, Austria", "score": 15200 },
    { "teamName": "Lambda Lords", "ugName": "Berlin AWS User Group", "flag": "🇩🇪", "city": "Berlin, Germany", "score": 12800 },
    { "teamName": "DynamoDB Dragons", "ugName": "AWS User Group France- Paris", "flag": "🇫🇷", "city": "Paris, France", "score": 11500 },
    { "teamName": "S3 Surfers", "ugName": "Grenoble AWS User Group", "flag": "🇫🇷", "city": "Grenoble, France", "score": 10200 },
    { "teamName": "CloudFormation Crew", "ugName": "Lille AWS User Group", "flag": "🇫🇷", "city": "Lille, France", "score": 8900 }
  ]
}
```

## Composition Details

| Property        | Value                      |
|-----------------|----------------------------|
| Composition ID  | `GameDayClosingWinners`    |
| Duration        | 9000 frames (5 minutes)    |
| FPS             | 30                         |
| Resolution      | 1280×720                   |
| Source file     | `03b-ClosingWinners.tsx`   |

### Phase Timeline

| Phase           | Frames      | Time        | Description                              |
|-----------------|-------------|-------------|------------------------------------------|
| Shuffle         | 0–1799      | 0:00–1:00   | Animated bar scroll (all user groups)    |
| Reveal (6→1)    | 1800–7199   | 1:00–4:00   | Progressive bar chart reveal             |
| Podium          | 7200–7799   | 4:00–4:20   | Final podium card grid                   |
| Thank You       | 7800–8999   | 4:20–5:00   | Closing message + fade to black          |

## Other Compositions (Fixed — Do Not Edit)

| Composition               | File                    | Notes                    |
|---------------------------|-------------------------|--------------------------|
| `GameDayClosingCountdown` | `03a-ClosingFixed.tsx`  | Pre-rendered, no changes |
| `GameDayPreShow`          | `00-GameDayStreamPreShow-Muted.tsx` | Fixed         |
| `GameDayMainEvent`        | `01-GameDayStreamMainEvent-Audio.tsx` | Fixed       |
| `GameDayGameplay`         | `02-GameDayStreamGameplay-Muted.tsx` | Fixed        |
