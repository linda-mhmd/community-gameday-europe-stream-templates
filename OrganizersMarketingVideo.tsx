import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import {
  GD_DARK,
  GD_PURPLE,
  GD_VIOLET,
  GD_GOLD,
  BackgroundLayer,
  springConfig,
} from "./shared/GameDayDesignSystem";
import { ORGANIZERS } from "./shared/organizers";

// ── Frame Constants ──
// Quick intro (2s), then organizers reveal with crossfade, hold 10s, then outro
const INTRO_START = 0;
const INTRO_END = 59;       // 2 seconds
const ORG_START = 45;        // overlap with intro for crossfade
const ORG_END = 439;         // hold until all faces visible for 10s
const OUTRO_START = 440;
const OUTRO_END = 589;


// ── IntroScene: Quick logo fly-in with scale + opacity (frames 0–59) ──

const IntroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Combined logo entrance: scale from 0.3 → 1 + opacity 0 → 1
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
    durationInFrames: 30,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // AWS Community Europe logo enters slightly delayed
  const logo2Spring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
    durationInFrames: 30,
  });
  const logo2Scale = interpolate(logo2Spring, [0, 1], [0.3, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit: fade out in last 15 frames (45–59)
  const exitOpacity = interpolate(frame, [45, 59], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Ambient radial gradient glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${GD_PURPLE}40 0%, ${GD_VIOLET}20 40%, transparent 70%)`,
        }}
      />

      {/* Content container */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* GameDay logo — scale + fade in */}
        <Img
          src={staticFile(
            "AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png",
          )}
          style={{
            width: 320,
            objectFit: "contain",
            opacity: logoSpring,
            transform: `scale(${logoScale})`,
          }}
        />

        {/* AWS Community Europe logo — scale + fade in, slightly delayed */}
        <Img
          src={staticFile(
            "AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png",
          )}
          style={{
            width: 220,
            objectFit: "contain",
            opacity: logo2Spring,
            transform: `scale(${logo2Scale})`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};


// ── OrganizerScene: Heading + staggered card reveals (frames 45–299) ──

const OrganizerScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const relFrame = frame - ORG_START;

  // Scene opacity: fade in over 15 frames from ORG_START, fade out last 15 frames
  const sceneOpacity = interpolate(frame, [ORG_START, ORG_START + 15, ORG_END - 15, ORG_END], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Heading spring entrance
  const orgTitleSpring = spring({
    frame: Math.max(0, relFrame - 5),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Heading + subheading */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: orgTitleSpring,
          transform: `translateY(${interpolate(orgTitleSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: 5,
          }}
        >
          COMMUNITY GAMEDAY EUROPE ORGANIZERS
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            fontFamily: "'Inter', sans-serif",
            marginTop: 8,
            color: GD_GOLD,
            letterSpacing: 1,
          }}
        >
          From the Community, for the Community
        </div>
      </div>

      {/* 4×2 Organizer card grid — staggered one-by-one reveal */}
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "36px 80px",
          maxWidth: 1250,
        }}
      >
        {ORGANIZERS.map((org, i) => {
          // Each card enters 10 frames after the previous one
          const cardDelay = 10 + i * 10;
          const cardSpring = spring({
            frame: Math.max(0, relFrame - cardDelay),
            fps,
            config: { damping: 12, stiffness: 100, mass: 0.8 },
          });
          const cardScale = interpolate(cardSpring, [0, 1], [0.5, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={org.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                opacity: cardSpring,
                transform: `scale(${cardScale}) translateY(${interpolate(cardSpring, [0, 1], [20, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  overflow: "hidden",
                  boxShadow: `0 0 30px ${GD_VIOLET}70, 0 0 60px ${GD_PURPLE}40, 0 4px 16px rgba(0,0,0,0.4)`,
                }}
              >
                <Img
                  src={staticFile(org.face)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#ffffff",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {org.flag} {org.name}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "'Inter', sans-serif",
                    marginTop: 3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {org.role}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "'Inter', sans-serif",
                    marginTop: 1,
                  }}
                >
                  {org.country}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};


// ── OutroScene (frames 300–449) ──

const OutroScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const relFrame = frame - OUTRO_START;

  const logoSpring = spring({
    frame: relFrame,
    fps,
    config: springConfig.entry,
    durationInFrames: 40,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineOpacity = interpolate(relFrame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaOpacity = interpolate(relFrame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeToBlack = interpolate(frame, [OUTRO_END - 29, OUTRO_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, ${GD_PURPLE}60 0%, ${GD_VIOLET}30 40%, transparent 70%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
          }}
        >
          <Img
            src={staticFile(
              "AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png",
            )}
            style={{ width: 280, objectFit: "contain" }}
          />
          <Img
            src={staticFile(
              "AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png",
            )}
            style={{ width: 180, objectFit: "contain" }}
          />
        </div>

        <div
          style={{
            opacity: taglineOpacity,
            fontSize: 24,
            fontWeight: 600,
            color: "white",
            letterSpacing: 1,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          AWS Community GameDay Europe · 17 March 2026
        </div>

        <div
          style={{
            opacity: ctaOpacity,
            fontSize: 20,
            fontWeight: 700,
            color: GD_GOLD,
            letterSpacing: 2,
            textAlign: "center",
          }}
        >
          www.awsgameday.eu
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: fadeToBlack,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Main Composition ──

export const OrganizersMarketingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: GD_DARK }}>
      <BackgroundLayer darken={0.65} />

      {frame >= INTRO_START && frame <= INTRO_END && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <IntroScene frame={frame} fps={fps} />
        </AbsoluteFill>
      )}

      {frame >= ORG_START && frame <= ORG_END && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <OrganizerScene frame={frame} fps={fps} />
        </AbsoluteFill>
      )}

      {frame >= OUTRO_START && frame <= OUTRO_END && (
        <AbsoluteFill style={{ zIndex: 10 }}>
          <OutroScene frame={frame} fps={fps} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
