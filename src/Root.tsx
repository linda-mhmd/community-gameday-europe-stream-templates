import React from "react";
import { Composition } from "remotion";

// ── Pre-Event ───────────────────────────────────────────────────────────────
import { Countdown } from "./compositions/00-preshow/Countdown";
import { InfoLoop } from "./compositions/00-preshow/InfoLoop";

// ── Live Event ──────────────────────────────────────────────────────────────
import { MainEvent } from "./compositions/01-main-event/MainEvent";
import { Gameplay } from "./compositions/02-gameplay/Gameplay";

// ── Closing ─────────────────────────────────────────────────────────────────
import { ClosingPreRendered } from "./compositions/03-closing/ClosingPreRendered";
import { ClosingWinnersTemplate } from "./compositions/03-closing/ClosingWinnersTemplate";

// ── Marketing ───────────────────────────────────────────────────────────────
import { MarketingVideo } from "./compositions/marketing/MarketingVideo";

// ── Inserts: Event Flow ─────────────────────────────────────────────────────
import { QuestsLive } from "./compositions/inserts/event-flow/QuestsLive";
import { HalfTime } from "./compositions/inserts/event-flow/HalfTime";
import { FinalCountdown } from "./compositions/inserts/event-flow/FinalCountdown";
import { GameExtended } from "./compositions/inserts/event-flow/GameExtended";
import { LeaderboardHidden } from "./compositions/inserts/event-flow/LeaderboardHidden";
import { ScoresCalculating } from "./compositions/inserts/event-flow/ScoresCalculating";
import { BreakAnnouncement } from "./compositions/inserts/event-flow/BreakAnnouncement";
import { WelcomeBack } from "./compositions/inserts/event-flow/WelcomeBack";

// ── Inserts: Live Commentary ────────────────────────────────────────────────
import { FirstCompletion } from "./compositions/inserts/commentary/FirstCompletion";
import { CloseRace } from "./compositions/inserts/commentary/CloseRace";
import { ComebackAlert } from "./compositions/inserts/commentary/ComebackAlert";
import { TopTeams } from "./compositions/inserts/commentary/TopTeams";
import { CollectiveMilestone } from "./compositions/inserts/commentary/CollectiveMilestone";
import { TeamSpotlight } from "./compositions/inserts/commentary/TeamSpotlight";

// ── Inserts: Quest Operations ───────────────────────────────────────────────
import { QuestFixed } from "./compositions/inserts/quest/QuestFixed";
import { QuestBroken } from "./compositions/inserts/quest/QuestBroken";
import { QuestUpdate } from "./compositions/inserts/quest/QuestUpdate";
import { QuestHint } from "./compositions/inserts/quest/QuestHint";
import { NewQuestAvailable } from "./compositions/inserts/quest/NewQuestAvailable";
import { SurveyReminder } from "./compositions/inserts/quest/SurveyReminder";

// ── Inserts: Operational ────────────────────────────────────────────────────
import { StreamInterruption } from "./compositions/inserts/ops/StreamInterruption";
import { TechnicalIssue } from "./compositions/inserts/ops/TechnicalIssue";
import { Leaderboard } from "./compositions/inserts/ops/Leaderboard";
import { ScoreCorrection } from "./compositions/inserts/ops/ScoreCorrection";
import { GamemastersUpdate } from "./compositions/inserts/ops/GamemastersUpdate";

// ── Inserts: People & Community ─────────────────────────────────────────────
import { StreamHostUpdate } from "./compositions/inserts/people/StreamHostUpdate";
import { LocationShoutout } from "./compositions/inserts/people/LocationShoutout";
import { ImportantReminder } from "./compositions/inserts/people/ImportantReminder";

// ─────────────────────────────────────────────────────────────────────────────
// All compositions are 1280x720 @ 30fps.
// Inserts are always 900 frames (30 seconds).
// See src/compositions/README.md for the event sequence.
// See src/compositions/inserts/README.md for insert reference.
// ─────────────────────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => {
  return (
    <>

      {/* ── 00 · Pre-Event ────────────────────────────────────────────────────
       * Countdown: minimal timer-only display, optional before InfoLoop
       * InfoLoop:  rotating user groups, organizers, schedule - the main pre-show
       */}
      <Composition id="00-Countdown" component={Countdown}
        durationInFrames={18000} fps={30} width={1280} height={720}
        defaultProps={{ loopIteration: 0 }}
      />
      <Composition id="00-InfoLoop" component={InfoLoop}
        durationInFrames={54000} fps={30} width={1280} height={720}
      />

      {/* ── 01 · Main Event ───────────────────────────────────────────────── */}
      <Composition id="01-MainEvent" component={MainEvent}
        durationInFrames={54000} fps={30} width={1280} height={720}
      />

      {/* ── 02 · Gameplay ─────────────────────────────────────────────────── */}
      <Composition id="02-Gameplay" component={Gameplay}
        durationInFrames={216000} fps={30} width={1280} height={720}
      />

      {/* ── 03 · Closing ──────────────────────────────────────────────────────
       * Part A: pre-rendered - hero intro, fast scroll, shuffle countdown
       * Part B: template    - update PODIUM_TEAMS in ClosingWinnersTemplate.tsx
       */}
      <Composition id="03A-ClosingPreRendered" component={ClosingPreRendered}
        durationInFrames={4200} fps={30} width={1280} height={720}
      />
      <Composition id="03B-ClosingWinnersTemplate" component={ClosingWinnersTemplate}
        durationInFrames={9000} fps={30} width={1280} height={720}
      />

      {/* ── Marketing ─────────────────────────────────────────────────────────
       * Standalone - not part of the event sequence
       */}
      <Composition id="Marketing-OrganizersVideo" component={MarketingVideo}
        durationInFrames={640} fps={30} width={1280} height={720}
      />

      {/* ── Inserts: Event Flow ───────────────────────────────────────────────
       * Phase markers and timing anchors. Use these to mark transitions
       * in the event: kickoff, check-ins, breaks, end of game.
       * See inserts/event-flow/README.md
       */}
      <Composition id="Insert-QuestsLive"        component={QuestsLive}        durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-HalfTime"          component={HalfTime}          durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-FinalCountdown"    component={FinalCountdown}    durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-GameExtended"      component={GameExtended}      durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-LeaderboardHidden" component={LeaderboardHidden} durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-ScoresCalculating" component={ScoresCalculating} durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-BreakAnnouncement" component={BreakAnnouncement} durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-WelcomeBack"       component={WelcomeBack}       durationInFrames={900} fps={30} width={1280} height={720} />

      {/* ── Inserts: Live Commentary ──────────────────────────────────────────
       * Narrative broadcast moments - drama, momentum, human interest.
       * These make the stream feel like live commentary, not a status board.
       * See inserts/commentary/README.md
       */}
      <Composition id="Insert-FirstCompletion"   component={FirstCompletion}   durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-CloseRace"         component={CloseRace}         durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-ComebackAlert"     component={ComebackAlert}     durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-TopTeams"          component={TopTeams}          durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-CollectiveMilestone" component={CollectiveMilestone} durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-TeamSpotlight"     component={TeamSpotlight}     durationInFrames={900} fps={30} width={1280} height={720} />

      {/* ── Inserts: Quest Operations ─────────────────────────────────────────
       * Quest status changes - fixed, broken, new, hints, bonuses.
       * See inserts/quest/README.md
       */}
      <Composition id="Insert-QuestFixed"        component={QuestFixed}        durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-QuestBroken"       component={QuestBroken}       durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-QuestUpdate"       component={QuestUpdate}       durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-QuestHint"         component={QuestHint}         durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-NewQuestAvailable" component={NewQuestAvailable} durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-SurveyReminder"    component={SurveyReminder}    durationInFrames={900} fps={30} width={1280} height={720} />

      {/* ── Inserts: Operational ──────────────────────────────────────────────
       * Platform and environment status. Technical issues, score corrections,
       * leaderboard reveals, and Gamemaster announcements.
       * See inserts/ops/README.md
       */}
      <Composition id="Insert-StreamInterruption" component={StreamInterruption} durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-TechnicalIssue"    component={TechnicalIssue}    durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-Leaderboard"       component={Leaderboard}       durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-ScoreCorrection"   component={ScoreCorrection}   durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-GamemastersUpdate" component={GamemastersUpdate} durationInFrames={900} fps={30} width={1280} height={720} />

      {/* ── Inserts: People & Community ───────────────────────────────────────
       * Person-focused and location moments - stream host, city shoutouts,
       * and catch-all important reminders.
       * See inserts/people/README.md
       */}
      <Composition id="Insert-StreamHostUpdate"  component={StreamHostUpdate}  durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-LocationShoutout"  component={LocationShoutout}  durationInFrames={900} fps={30} width={1280} height={720} />
      <Composition id="Insert-ImportantReminder" component={ImportantReminder} durationInFrames={900} fps={30} width={1280} height={720} />

    </>
  );
};
