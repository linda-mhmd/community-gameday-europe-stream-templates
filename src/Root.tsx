import React from "react";
import { Composition } from "remotion";
import { GameDayPreShow } from "../00-GameDayStreamPreShow-Muted";
import { GameDayMainEvent } from "../01-GameDayStreamMainEvent-Audio";
import { GameDayGameplay } from "../02-GameDayStreamGameplay-Muted";
import {
  GameDayClosing,
  ClosingShowcase,
  ClosingReveal,
  ClosingFinalStandings,
  ClosingTeamPodium,
  ClosingThankYou,
} from "../03-GameDayStreamClosing-Audio";
import { OrganizersMarketingVideo } from "../OrganizersMarketingVideo";
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 0. Pre-Show (Muted): 10-min loop (play 3× for 30 min total) */}
      <Composition
        id="GameDayPreShow"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 0 }}
      />
      <Composition
        id="GameDayPreShow-Loop2"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 1 }}
      />
      <Composition
        id="GameDayPreShow-Loop3"
        component={GameDayPreShow}
        durationInFrames={18000}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ loopIteration: 2 }}
      />

      {/* 1. Main Event (Audio): 30 min live introductions */}
      <Composition
        id="GameDayMainEvent"
        component={GameDayMainEvent}
        durationInFrames={54000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 2. Gameplay (Muted): 2h muted overlay */}
      <Composition
        id="GameDayGameplay"
        component={GameDayGameplay}
        durationInFrames={216000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3. Closing Ceremony (Audio): ~11.7 min */}
      <Composition
        id="GameDayClosing"
        component={GameDayClosing}
        durationInFrames={21000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3a. Closing — Showcase Phase (Hero Intro + Fast Scroll): frames 0–1199 */}
      <Composition
        id="Closing-Showcase"
        component={ClosingShowcase}
        durationInFrames={1200}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3b. Closing — Full Reveal Phase: frames 3000–11999 */}
      <Composition
        id="Closing-Reveal"
        component={ClosingReveal}
        durationInFrames={9000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3c. Closing — Final Standings (3+3 layout): frames 7500–8999 */}
      <Composition
        id="Closing-FinalStandings"
        component={ClosingFinalStandings}
        durationInFrames={1500}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3d. Closing — Team Podium Reveal: frames 9000–11999 */}
      <Composition
        id="Closing-TeamPodium"
        component={ClosingTeamPodium}
        durationInFrames={3000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3e. Closing — Thank You Phase: frames 12000–20999 */}
      <Composition
        id="Closing-ThankYou"
        component={ClosingThankYou}
        durationInFrames={9000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 4. Organizers Marketing Video: standalone 15s social media clip */}
      <Composition
        id="OrganizersMarketingVideo"
        component={OrganizersMarketingVideo}
        durationInFrames={590}
        fps={30}
        width={1280}
        height={720}
      />

    </>
  );
};
