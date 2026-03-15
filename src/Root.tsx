import React from "react";
import { Composition } from "remotion";
import { GameDayPreShow } from "../00-GameDayStreamPreShow-Muted";
import { GameDayMainEvent } from "../01-GameDayStreamMainEvent-Audio";
import { GameDayGameplay } from "../02-GameDayStreamGameplay-Muted";
import {
  GameDayClosingCountdown,
  ClosingShowcase as ClosingShowcaseFixed,
} from "../03a-ClosingFixed";
import { GameDayClosingWinners } from "../03b-ClosingWinners";
import { OrganizersMarketingVideo } from "../OrganizersMarketingVideo";
import { GameDayPreShowInfo } from "../04-GameDayStreamPreShowInfo-Muted";
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

      {/* 3. Closing Countdown (Part A): HeroIntro + FastScroll + Shuffle + Winners Teaser — pre-rendered */}
      <Composition
        id="GameDayClosingCountdown"
        component={GameDayClosingCountdown}
        durationInFrames={4200}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 3a. Closing Winners (Part B): Shuffle + Reveal/Podium + ThankYou — updated live during stream */}
      <Composition
        id="GameDayClosingWinners"
        component={GameDayClosingWinners}
        durationInFrames={9000}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 4. Organizers Marketing Video: standalone 15s social media clip */}
      <Composition
        id="OrganizersMarketingVideo"
        component={OrganizersMarketingVideo}
        durationInFrames={610}
        fps={30}
        width={1280}
        height={720}
      />

      {/* 5. Pre-Show Info Loop (Muted): 30 min with rotating content sections */}
      <Composition
        id="GameDayPreShowInfo"
        component={GameDayPreShowInfo}
        durationInFrames={54000}
        fps={30}
        width={1280}
        height={720}
      />

    </>
  );
};
