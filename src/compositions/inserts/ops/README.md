# Inserts: Operational

Platform and environment status, score management, and Gamemaster announcements. These are operational communications from the people running the event.

| Insert ID | When to use | Update |
|-----------|-------------|--------|
| `Insert-StreamInterruption` | Combined environment + community update - two-card layout | Edit both cards directly |
| `Insert-TechnicalIssue` | Known platform issue under investigation | `QUEST_NAME`, `MESSAGE` |
| `Insert-Leaderboard` | Leaderboard scores have been updated | Nothing |
| `Insert-ScoreCorrection` | Scores were manually adjusted | `REASON` |
| `Insert-GamemastersUpdate` | Live announcement from the Gamemasters | `MESSAGE` (names/faces come from config) |

**Color:** Orange (`GD_ORANGE`) for AWS/platform/Gamemaster - they own the environment. Red (`GD_RED`) for technical issues. Violet (`GD_VIOLET`) for score corrections - affects the community.

**GamemastersUpdate:** Names, roles, and face photos are pulled automatically from `AWS_SUPPORTERS` in `config/participants.ts`. Only people with `country === "Gamemaster"` are shown. You only need to update the `MESSAGE` variable.

---

All inserts are 900 frames (30 seconds) at 30fps. See `src/compositions/inserts/README.md` for the full reference and design rules.
