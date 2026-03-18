# Inserts: Event Flow

Phase markers and timing anchors. Use these to mark the major transitions in the event. They set the rhythm of the broadcast.

| Insert ID | When to use |
|-----------|-------------|
| `Insert-QuestsLive` | The moment quests become accessible - the kickoff |
| `Insert-HalfTime` | At the 60-minute mark |
| `Insert-FinalCountdown` | Last 15-30 minutes warning (update `MINUTES_REMAINING`) |
| `Insert-GameExtended` | Extra time added to the game (update `EXTRA_MINUTES`) |
| `Insert-LeaderboardHidden` | When scores go dark for the final stretch |
| `Insert-ScoresCalculating` | After gameplay ends, while results are being tallied |
| `Insert-BreakAnnouncement` | Any short pause in the stream |
| `Insert-WelcomeBack` | Returning from a break (pair with BreakAnnouncement) |

**Color:** Gold (`GD_GOLD`) for most - neutral timing events. Orange (`GD_ORANGE`) for QuestsLive - AWS platform activating. Violet (`GD_VIOLET`) for break-related - community context.

---

All inserts are 900 frames (30 seconds) at 30fps. See `src/compositions/inserts/README.md` for the full reference and design rules.
