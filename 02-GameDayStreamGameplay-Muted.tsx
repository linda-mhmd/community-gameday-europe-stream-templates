import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BackgroundLayer,
  GlassCard,
  AudioBadge,
  calculateCountdown,
  formatTime,
  getPhaseInfo,
  springConfig,
  staggeredEntry,
  TYPOGRAPHY,
  GAME_START,
  GAME_END,
  GD_DARK,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_ORANGE,
  GD_GOLD,
  type ScheduleSegment,
} from "./shared/GameDayDesignSystem";

// ── GameDay Tips (from AWS GameDay PDF) ──
const GAMEDAY_TIPS = [
  "AWS GameDay is a collaborative learning exercise in a gamified, risk-free environment",
  "Each Quest is open-ended - figure out the best way forward. Don't be afraid to try!",
  "Bonus points are awarded to teams that finish Quests quickly",
  "Set your team name and language, then review the Quest information",
  "Use hints for quick tips - they are low cost!",
  "If you need help, signal a staff member and they will assist you",
  "Don't worry about completing everything - have fun, experiment, and try new things!",
  "This GameDay is designed for each team to work together on each of the Quests",
];

// ── Gameplay Phases (15-min intervals for detailed timeline) ──
// Total: 216000 frames = 120 min at 30fps
export const GAMEPLAY_PHASES: ScheduleSegment[] = [
  { label: "Hour 1 — Q1 (0–15 min)", startFrame: 0, endFrame: 26999 },
  { label: "Hour 1 — Q2 (15–30 min)", startFrame: 27000, endFrame: 53999 },
  { label: "Hour 1 — Q3 (30–45 min)", startFrame: 54000, endFrame: 80999 },
  { label: "Hour 1 — Q4 (45–60 min)", startFrame: 81000, endFrame: 107999 },
  { label: "Hour 2 — Q1 (60–75 min)", startFrame: 108000, endFrame: 134999 },
  { label: "Hour 2 — Q2 (75–90 min)", startFrame: 135000, endFrame: 161999 },
  { label: "Hour 2 — Q3 (90–105 min)", startFrame: 162000, endFrame: 188999 },
  { label: "Hour 2 — Final Q (105–120 min)", startFrame: 189000, endFrame: 215999 },
];

// ── Exported Helper Functions for Property Tests ──
export function isGameplayAudioCueBannerVisible(frame: number): boolean {
  return frame >= 207000;
}

export function isFinal30MinutesActive(frame: number): boolean {
  return frame >= 162000;
}

export function isUrgencyGlowActive(frame: number): boolean {
  return frame >= 207000;
}


// ── Phase Marker Sub-Component ──
const PhaseIndicator: React.FC<{
  frame: number;
  segments: ScheduleSegment[];
}> = ({ frame, segments }) => {
  const { name, progress } = getPhaseInfo(frame, segments);
  const isFinal = isFinal30MinutesActive(frame);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div>
        <div
          style={{
            fontSize: TYPOGRAPHY.labelSmall,
            fontWeight: 600,
            color: "#64748b",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontFamily: "'Inter', sans-serif",
            marginBottom: 4,
          }}
        >
          Current Phase
        </div>
        <div
          style={{
            fontSize: TYPOGRAPHY.bodySmall,
            fontWeight: 700,
            color: isFinal ? GD_ORANGE : "white",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {name}
        </div>
      </div>
      <div
        style={{
          width: 200,
          height: 4,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: isFinal
              ? `linear-gradient(90deg, ${GD_ORANGE}, ${GD_PINK})`
              : `linear-gradient(90deg, ${GD_VIOLET}, ${GD_PINK})`,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};

// ── Rotating GameDay Tip ──
const TIP_DURATION = 450; // 15 seconds per tip at 30fps
const GameDayTip: React.FC<{ frame: number }> = ({ frame }) => {
  const tipIndex = Math.floor(frame / TIP_DURATION) % GAMEDAY_TIPS.length;
  const localFrame = frame % TIP_DURATION;
  const fadeIn = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(localFrame, [TIP_DURATION - 20, TIP_DURATION], [1, 0], { extrapolateRight: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);
  return (
    <div style={{
      position: "absolute", bottom: 70, left: 0, right: 0,
      display: "flex", justifyContent: "center", zIndex: 20,
    }}>
      <div style={{
        opacity, maxWidth: 700, textAlign: "center",
        fontSize: TYPOGRAPHY.body, fontWeight: 600, color: "rgba(255,255,255,0.7)",
        fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
      }}>
        {GAMEDAY_TIPS[tipIndex]}
      </div>
    </div>
  );
};

// ── Gameplay Composition ──
export const GameDayGameplay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Game-end countdown (shows 120:00 at frame 0) ──
  const gameEndCountdown = calculateCountdown(frame, GAME_START, GAME_END, fps);

  // ── Urgency states ──
  const showFinal30 = isFinal30MinutesActive(frame);
  const showUrgencyGlow = isUrgencyGlowActive(frame);
  const showAudioCue = isGameplayAudioCueBannerVisible(frame);

  // ── Timer entry spring ──
  const timerEntry = spring({
    frame: frame - staggeredEntry(0, 0),
    fps,
    config: springConfig.entry,
  });

  // ── Final 30 Minutes pulse (GD_ORANGE) ──
  const final30Pulse = showFinal30
    ? interpolate(frame % 60, [0, 30, 60], [1, 1.04, 1], {
        extrapolateRight: "clamp",
      })
    : 1;

  // ── Urgency glow pulse (GD_PINK, ≤5 min remaining) ──
  const urgencyGlow = showUrgencyGlow
    ? interpolate(frame % 40, [0, 20, 40], [0.4, 1, 0.4], {
        extrapolateRight: "clamp",
      })
    : 0;

  // ── Audio cue banner entry ──
  const audioCueEntry = showAudioCue
    ? spring({
        frame: frame - 207000,
        fps,
        config: springConfig.entry,
      })
    : 0;
  const audioCuePulse = showAudioCue
    ? interpolate(frame % 60, [0, 30, 60], [1, 1.03, 1], {
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill
      style={{
        fontFamily: "'Inter', sans-serif",
        background: GD_DARK,
      }}
    >
      {/* Layer 1: Background (minimal overlay — darken ≤0.30) */}
      <BackgroundLayer darken={0.25} />

      {/* Layer 2: Audio Badge (muted) */}
      <AudioBadge muted />

      {/* Layer 3: Game-End Countdown (top-right, compact GlassCard ≤200px × 80px) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 50,
          opacity: timerEntry,
        }}
      >
        <GlassCard
          style={{
            padding: "10px 20px",
            borderRadius: 14,
            maxWidth: 200,
            maxHeight: 80,
            borderTop: `2px solid ${showUrgencyGlow ? GD_PINK : GD_VIOLET}60`,
            boxShadow: showUrgencyGlow
              ? `0 0 ${20 + urgencyGlow * 20}px ${GD_PINK}${Math.round(urgencyGlow * 100).toString(16).padStart(2, "0")}`
              : undefined,
            transform: `scale(${showFinal30 ? final30Pulse : 1})`,
          }}
        >
          <div
            style={{
              fontSize: TYPOGRAPHY.overline,
              fontWeight: 700,
              color: showUrgencyGlow ? GD_PINK : showFinal30 ? GD_ORANGE : GD_ACCENT,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 2,
              textAlign: "center",
            }}
          >
            {showUrgencyGlow ? "Almost Done!" : "Time Left"}
          </div>
          <div
            style={{
              fontSize: TYPOGRAPHY.h5,
              fontWeight: 900,
              color: showUrgencyGlow ? GD_PINK : showFinal30 ? GD_ORANGE : "white",
              fontFamily: "'Inter', monospace",
              letterSpacing: 2,
              textAlign: "center",
              textShadow: showUrgencyGlow
                ? `0 0 30px ${GD_PINK}80`
                : showFinal30
                  ? `0 0 20px ${GD_ORANGE}40`
                  : `0 0 20px ${GD_VIOLET}30`,
            }}
          >
            {formatTime(gameEndCountdown)}
          </div>
        </GlassCard>
      </div>

      {/* Layer 4: Phase Indicator (bottom-left) */}
      <PhaseIndicator frame={frame} segments={GAMEPLAY_PHASES} />

      {/* Layer 4b: Rotating GameDay Tips */}
      <GameDayTip frame={frame} />

      {/* Layer 5: "Final 30 Minutes" text with GD_ORANGE pulse */}
      {showFinal30 && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 36,
            opacity: interpolate(
              spring({
                frame: frame - 162000,
                fps,
                config: springConfig.entry,
              }),
              [0, 1],
              [0, 1],
            ),
            transform: `scale(${final30Pulse})`,
          }}
        >
          <div
            style={{
              fontSize: TYPOGRAPHY.caption,
              fontWeight: 800,
              color: GD_ORANGE,
              letterSpacing: 3,
              textTransform: "uppercase",
              textShadow: `0 0 20px ${GD_ORANGE}60`,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Final 30 Minutes
          </div>
        </div>
      )}

      {/* Layer 6: Audio Cue Banner (frame ≥ 207000) */}
      {showAudioCue && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: audioCueEntry,
            transform: `scale(${audioCuePulse})`,
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${GD_ORANGE}dd, ${GD_GOLD}dd)`,
              borderRadius: 16,
              padding: "14px 40px",
              boxShadow: `0 8px 32px ${GD_ORANGE}40`,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none" style={{ flexShrink: 0 }}>
              <path d="M11 0L0 20h22L11 0z" fill={GD_DARK} />
              <path d="M11 3L2 18h18L11 3z" stroke={GD_DARK} strokeWidth="2" fill="none" />
              <path d="M10 8h2v5h-2V8zm0 7h2v2h-2v-2z" fill={GD_DARK} />
            </svg>
            <div
              style={{
                fontSize: TYPOGRAPHY.h6,
                fontWeight: 700,
                color: GD_DARK,
              }}
            >
              Audio will be needed for Closing Ceremony — Prepare your speakers
            </div>
          </div>
        </div>
      )}

      {/* ── Timeline Sequences (Remotion Studio chapter markers) ── */}
      {GAMEPLAY_PHASES.map((seg) => (
        <Sequence
          key={seg.label}
          from={seg.startFrame}
          durationInFrames={seg.endFrame - seg.startFrame + 1}
          name={seg.label}
          layout="none"
        >
          <></>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
