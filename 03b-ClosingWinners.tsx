import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BackgroundLayer,
  HexGridOverlay,
  AudioBadge,
  GlassCard,
  GD_DARK,
  GD_GOLD,
  GD_PURPLE,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_ORANGE,
  TYPOGRAPHY,
} from "./shared/GameDayDesignSystem";
import { USER_GROUPS, LOGO_MAP } from "./archive/CommunityGamedayEuropeV4";

// ── Part B Constants ──
const TOTAL_FRAMES = 9000;

// ── Phase Timing ──
const SHUFFLE_START = 0;
const SHUFFLE_END = 1799;
const REVEAL_6TH = 1800;
const REVEAL_5TH = 2400;
const REVEAL_4TH = 3000;
const REVEAL_3RD = 3600;
const REVEAL_2ND = 4800;
const REVEAL_1ST = 6000;
const ROLL_CALL_START = 7200;
const THANKYOU_START = 7800;

// ── Shuffle Constants ──
const SHUFFLE_BAR_WIDTH = 160;
const SHUFFLE_BAR_GAP = 16;
const SHUFFLE_SCORE_MIN = 3000;
const SHUFFLE_SCORE_MAX = 5000;

// ── Card Accent Colors ──
const CARD_ACCENTS = [GD_VIOLET, GD_PURPLE, GD_PINK, GD_ACCENT, "#6366f1", GD_VIOLET];

// ── TeamData Interface ──
export interface TeamData {
  name: string;
  flag: string;
  city: string;
  score: number;
  logoUrl: string | null;
}

// ── Placeholder Podium Teams (update live during stream) ──
export const PODIUM_TEAMS: TeamData[] = [
  { name: "Team #1", flag: "🏳️", city: "City A", score: 4850, logoUrl: null },
  { name: "Team #2", flag: "🏳️", city: "City B", score: 4720, logoUrl: null },
  { name: "Team #3", flag: "🏳️", city: "City C", score: 4580, logoUrl: null },
  { name: "Team #4", flag: "🏳️", city: "City D", score: 4410, logoUrl: null },
  { name: "Team #5", flag: "🏳️", city: "City E", score: 4250, logoUrl: null },
  { name: "Team #6", flag: "🏳️", city: "City F", score: 4090, logoUrl: null },
];

// ── Reveal Schedule ──
const REVEAL_SCHEDULE = [
  { rank: 6, frame: REVEAL_6TH, duration: 600 },
  { rank: 5, frame: REVEAL_5TH, duration: 600 },
  { rank: 4, frame: REVEAL_4TH, duration: 600 },
  { rank: 3, frame: REVEAL_3RD, duration: 1200 },
  { rank: 2, frame: REVEAL_2ND, duration: 1200 },
  { rank: 1, frame: REVEAL_1ST, duration: 1200 },
];

// ── Utility Functions ──
export function getRevealedPlacements(frame: number): number[] {
  const placements: number[] = [];
  for (const entry of REVEAL_SCHEDULE) {
    if (frame >= entry.frame) placements.push(entry.rank);
  }
  return placements;
}

export function getCountUpValue(target: number, frame: number, revealFrame: number): number {
  const elapsed = Math.max(0, frame - revealFrame);
  const progress = Math.min(1, elapsed / 60);
  const eased = 1 - Math.pow(1 - progress, 3);
  return Math.round(eased * target);
}

export function getPodiumBarHeight(score: number, maxScore: number, maxHeight: number): number {
  return Math.max(0.4, score / maxScore) * maxHeight;
}

function getFadeOpacity(frame: number): number {
  const fadeStart = TOTAL_FRAMES - 90;
  if (frame < fadeStart) return 0;
  return Math.min(1, (frame - fadeStart) / 90);
}

// ── SegmentTransitionFlash ──
const FLASH_DURATION = 60;
const PHASE_BOUNDARY_FRAMES_B = [SHUFFLE_START, REVEAL_6TH, ROLL_CALL_START, THANKYOU_START];

const SegmentTransitionFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const boundary = PHASE_BOUNDARY_FRAMES_B.find((b) => frame >= b && frame < b + FLASH_DURATION);
  if (boundary === undefined) return null;
  const elapsed = frame - boundary;
  const opacity = interpolate(elapsed, [0, 10, 60], [0, 0.25, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at center, ${GD_ACCENT}${Math.round(opacity * 120).toString(16).padStart(2, "0")}, transparent 70%)`,
      zIndex: 200, pointerEvents: "none",
    }} />
  );
};

// ── ShufflePhase: Bell Curve Horizontal Scroll (same as Part A) ──
const ShufflePhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const frameInPhase = frame - SHUFFLE_START;
  const phaseDuration = SHUFFLE_END - SHUFFLE_START;

  const entrySpring = spring({ frame: frameInPhase, fps, config: { damping: 16, stiffness: 100 } });

  const scrollProgress = interpolate(frameInPhase, [15, phaseDuration - 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const easedScroll = scrollProgress < 0.5
    ? 2 * scrollProgress * scrollProgress
    : 1 - Math.pow(-2 * scrollProgress + 2, 2) / 2;

  const totalWidth = USER_GROUPS.length * (SHUFFLE_BAR_WIDTH + SHUFFLE_BAR_GAP);
  const totalScrollDist = totalWidth + 1280;
  const scrollX = easedScroll * totalScrollDist - 1280 * 0.1;

  const groupsWithScores = USER_GROUPS.map((group, i) => {
    const score = SHUFFLE_SCORE_MIN + ((i * 17 + 31) % (SHUFFLE_SCORE_MAX - SHUFFLE_SCORE_MIN + 1));
    return { ...group, score };
  });

  const ascending = [...groupsWithScores].sort((a, b) => a.score - b.score);
  const bellCurveOrder: typeof ascending = [];
  for (let i = 0; i < ascending.length; i++) {
    if (i % 2 === 0) bellCurveOrder.push(ascending[i]);
    else bellCurveOrder.unshift(ascending[i]);
  }

  const screenCenter = 1280 / 2;

  return (
    <AbsoluteFill style={{ opacity: entrySpring }}>
      <div style={{
        position: "absolute", top: 20, left: 0, right: 0, textAlign: "center", zIndex: 10,
        opacity: interpolate(frameInPhase, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{ fontSize: TYPOGRAPHY.bodySmall, fontWeight: 700, color: GD_ACCENT, fontFamily: "'Inter', sans-serif", letterSpacing: 2, textTransform: "uppercase" }}>
          Calculating Winners...
        </div>
      </div>
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, bottom: 40, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 120, background: `linear-gradient(90deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 120, background: `linear-gradient(270deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />
        <div style={{
          display: "flex", alignItems: "flex-end", height: "100%",
          transform: `translateX(${-scrollX}px)`, gap: SHUFFLE_BAR_GAP,
          paddingLeft: 1280,
        }}>
          {bellCurveOrder.map((group, i) => {
            const barX = i * (SHUFFLE_BAR_WIDTH + SHUFFLE_BAR_GAP) - scrollX + 1280;
            const barCenter = barX + SHUFFLE_BAR_WIDTH / 2;
            const distFromScreenCenter = Math.abs(barCenter - screenCenter);
            const maxBarHeight = 420;
            const minBarHeight = 80;
            const bellFactor = Math.exp(-Math.pow(distFromScreenCenter / 400, 2));
            const barHeight = minBarHeight + (maxBarHeight - minBarHeight) * bellFactor;
            const barOpacity = interpolate(distFromScreenCenter, [0, 500, 800], [1, 0.7, 0.15], {
              extrapolateRight: "clamp", extrapolateLeft: "clamp",
            });
            const accentColor = CARD_ACCENTS[i % CARD_ACCENTS.length];

            return (
              <div key={i} style={{
                minWidth: SHUFFLE_BAR_WIDTH, maxWidth: SHUFFLE_BAR_WIDTH,
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "flex-end", height: "100%", opacity: barOpacity,
              }}>
                <div style={{ fontSize: TYPOGRAPHY.h5, marginBottom: 6, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>{group.flag}</div>
                <div style={{
                  fontSize: TYPOGRAPHY.captionSmall, fontWeight: 700, color: "rgba(255,255,255,0.9)",
                  fontFamily: "'Inter', sans-serif", textAlign: "center",
                  marginBottom: 8, lineHeight: 1.3, width: SHUFFLE_BAR_WIDTH - 8,
                  wordWrap: "break-word", overflowWrap: "break-word",
                }}>{group.name}</div>
                <div style={{
                  width: "85%", height: barHeight, borderRadius: "10px 10px 0 0",
                  background: `linear-gradient(180deg, ${accentColor}cc, ${GD_PURPLE}90)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 24px ${accentColor}25`, border: `1px solid ${accentColor}30`, borderBottom: "none",
                  position: "relative",
                }}>
                  <div style={{
                    fontSize: TYPOGRAPHY.bodySmall, fontWeight: 800, color: "white", fontFamily: "'Inter', sans-serif",
                    fontVariantNumeric: "tabular-nums", textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                  }}>{Math.round(group.score)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── PodiumBar: Bottom-aligned bar for each team ──
const PodiumBar: React.FC<{
  team: TeamData;
  rank: number;
  barHeight: number;
  isTop3: boolean;
  revealFrame: number;
  frame: number;
}> = ({ team, rank, barHeight, isTop3, revealFrame, frame }) => {
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - revealFrame);
  const config = rank === 1
    ? { damping: 8, stiffness: 80, mass: 1.2 }
    : { damping: 12, stiffness: 100 };
  const progress = spring({ frame: elapsed, fps, config });
  const animatedHeight = barHeight * progress;
  const displayScore = getCountUpValue(team.score, frame, revealFrame);

  const barWidth = isTop3 ? 160 : 130;
  const borderColor = rank === 1 ? GD_GOLD : rank === 2 ? GD_GOLD + "80" : rank === 3 ? GD_GOLD + "80" : GD_ACCENT + "60";
  const barGradient = rank === 1
    ? `linear-gradient(180deg, ${GD_GOLD}dd, ${GD_ORANGE}90)`
    : rank <= 3
      ? `linear-gradient(180deg, ${GD_VIOLET}cc, ${GD_PURPLE}90)`
      : `linear-gradient(180deg, ${GD_ACCENT}99, ${GD_PURPLE}70)`;

  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  const opacity = isTop3 ? 1 : 0.75;

  // For top 3: staged reveal (bar → city → name)
  const cityOpacity = isTop3
    ? interpolate(elapsed, [120, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : progress;
  const nameOpacity = isTop3
    ? interpolate(elapsed, [240, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : progress;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "flex-end", height: "100%", opacity: opacity * progress,
      width: barWidth,
    }}>
      {/* Rank badge */}
      <div style={{
        fontSize: isTop3 ? TYPOGRAPHY.h5 : TYPOGRAPHY.h6, fontWeight: 900,
        color: rank === 1 ? GD_GOLD : "rgba(255,255,255,0.8)",
        fontFamily: "'Inter', sans-serif", marginBottom: 4,
        opacity: progress,
      }}>
        {medal ? `${medal} #${rank}` : `#${rank}`}
      </div>
      {/* Team name */}
      <div style={{
        fontSize: isTop3 ? TYPOGRAPHY.caption : TYPOGRAPHY.label, fontWeight: 700,
        color: "white", fontFamily: "'Inter', sans-serif", textAlign: "center",
        marginBottom: 4, lineHeight: 1.2, maxWidth: barWidth, opacity: nameOpacity,
      }}>{team.flag} {team.name}</div>
      {/* City */}
      <div style={{
        fontSize: TYPOGRAPHY.overline, color: "rgba(255,255,255,0.5)",
        fontFamily: "'Inter', sans-serif", marginBottom: 6, opacity: cityOpacity,
      }}>{team.city}</div>
      {/* Bar */}
      <div style={{
        width: barWidth - 20, height: animatedHeight, borderRadius: "10px 10px 0 0",
        background: barGradient,
        border: `1.5px solid ${borderColor}`, borderBottom: "none",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "flex-end", paddingBottom: 12,
        boxShadow: rank === 1 ? `0 0 40px ${GD_GOLD}30` : `0 0 20px ${GD_PURPLE}20`,
      }}>
        <div style={{
          fontSize: isTop3 ? TYPOGRAPHY.h6 : TYPOGRAPHY.body, fontWeight: 900,
          color: "white", fontFamily: "'Inter', sans-serif",
          fontVariantNumeric: "tabular-nums", textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}>{displayScore.toLocaleString()}</div>
      </div>
    </div>
  );
};

// ── RevealPhase: Progressive bar-chart podium ──
const RevealPhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const revealed = getRevealedPlacements(frame);
  const maxScore = PODIUM_TEAMS[0].score;
  const maxBarHeight = 380;

  const titleSpring = spring({ frame: Math.max(0, frame - REVEAL_6TH), fps, config: { damping: 14, stiffness: 100 } });

  // Current reveal highlight
  const currentReveal = REVEAL_SCHEDULE.slice().reverse().find((r) => frame >= r.frame);
  const currentRank = currentReveal?.rank ?? 6;

  return (
    <AbsoluteFill>
      {/* Title */}
      <div style={{
        position: "absolute", top: 24, left: 0, right: 0, textAlign: "center",
        opacity: titleSpring, transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
      }}>
        <div style={{
          fontSize: TYPOGRAPHY.h5, fontWeight: 900, color: GD_GOLD,
          fontFamily: "'Inter', sans-serif", letterSpacing: 4, textTransform: "uppercase",
          textShadow: `0 2px 20px ${GD_GOLD}40`,
        }}>🏆 Final Standings 🏆</div>
      </div>

      {/* Current reveal announcement */}
      {frame < ROLL_CALL_START && (
        <div style={{
          position: "absolute", top: 70, left: 0, right: 0, textAlign: "center",
          opacity: interpolate(frame - (currentReveal?.frame ?? 0), [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <span style={{
            fontSize: TYPOGRAPHY.body, fontWeight: 700, fontFamily: "'Inter', sans-serif",
            color: currentRank <= 3 ? GD_GOLD : "rgba(255,255,255,0.7)",
          }}>
            {currentRank === 1 ? "🥇 1st Place" : currentRank === 2 ? "🥈 2nd Place" : currentRank === 3 ? "🥉 3rd Place" : `#${currentRank}`}
          </span>
        </div>
      )}

      {/* Bar chart — bottom aligned */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "75%",
        display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16,
        padding: "0 60px",
      }}>
        {/* Render bars for revealed teams: order 2-1-3 for top, 4-5-6 for bottom */}
        {revealed.includes(2) && (
          <PodiumBar team={PODIUM_TEAMS[1]} rank={2} barHeight={getPodiumBarHeight(PODIUM_TEAMS[1].score, maxScore, maxBarHeight)} isTop3={true} revealFrame={REVEAL_2ND} frame={frame} />
        )}
        {revealed.includes(1) && (
          <PodiumBar team={PODIUM_TEAMS[0]} rank={1} barHeight={getPodiumBarHeight(PODIUM_TEAMS[0].score, maxScore, maxBarHeight)} isTop3={true} revealFrame={REVEAL_1ST} frame={frame} />
        )}
        {revealed.includes(3) && (
          <PodiumBar team={PODIUM_TEAMS[2]} rank={3} barHeight={getPodiumBarHeight(PODIUM_TEAMS[2].score, maxScore, maxBarHeight)} isTop3={true} revealFrame={REVEAL_3RD} frame={frame} />
        )}
        {/* Spacer between top 3 and bottom 3 */}
        {revealed.some((r) => r >= 4) && <div style={{ width: 40 }} />}
        {revealed.includes(4) && (
          <PodiumBar team={PODIUM_TEAMS[3]} rank={4} barHeight={getPodiumBarHeight(PODIUM_TEAMS[3].score, maxScore, maxBarHeight)} isTop3={false} revealFrame={REVEAL_4TH} frame={frame} />
        )}
        {revealed.includes(5) && (
          <PodiumBar team={PODIUM_TEAMS[4]} rank={5} barHeight={getPodiumBarHeight(PODIUM_TEAMS[4].score, maxScore, maxBarHeight)} isTop3={false} revealFrame={REVEAL_5TH} frame={frame} />
        )}
        {revealed.includes(6) && (
          <PodiumBar team={PODIUM_TEAMS[5]} rank={6} barHeight={getPodiumBarHeight(PODIUM_TEAMS[5].score, maxScore, maxBarHeight)} isTop3={false} revealFrame={REVEAL_6TH} frame={frame} />
        )}
      </div>
    </AbsoluteFill>
  );
};

// ── RollCallPhase: Team names 6th→1st ──
const RollCallPhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const localFrame = frame - ROLL_CALL_START;
  const entrySpring = spring({ frame: localFrame, fps, config: { damping: 14, stiffness: 100 } });

  const teams = [...PODIUM_TEAMS].reverse(); // 6th first

  return (
    <AbsoluteFill style={{ opacity: entrySpring }}>
      <div style={{
        position: "absolute", top: 40, left: 0, right: 0, textAlign: "center",
      }}>
        <div style={{
          fontSize: TYPOGRAPHY.h5, fontWeight: 900, color: GD_GOLD,
          fontFamily: "'Inter', sans-serif", letterSpacing: 4,
          textShadow: `0 2px 20px ${GD_GOLD}40`,
        }}>🏆 Final Standings 🏆</div>
      </div>
      <div style={{
        position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", gap: 12, alignItems: "center",
      }}>
        {teams.map((team, i) => {
          const rank = 6 - i;
          const teamSpring = spring({ frame: Math.max(0, localFrame - i * 15), fps, config: { damping: 12, stiffness: 100 } });
          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16,
              opacity: teamSpring, transform: `translateX(${interpolate(teamSpring, [0, 1], [-40, 0])}px)`,
            }}>
              <div style={{
                fontSize: TYPOGRAPHY.h6, fontWeight: 900, color: rank <= 3 ? GD_GOLD : "rgba(255,255,255,0.6)",
                fontFamily: "'Inter', sans-serif", width: 60, textAlign: "right",
              }}>{medal ? `${medal}` : `#${rank}`}</div>
              <div style={{
                fontSize: rank <= 3 ? TYPOGRAPHY.h5 : TYPOGRAPHY.h6, fontWeight: rank <= 3 ? 900 : 700,
                color: rank === 1 ? GD_GOLD : "white", fontFamily: "'Inter', sans-serif",
              }}>{team.flag} {team.name}</div>
              <div style={{
                fontSize: TYPOGRAPHY.body, fontWeight: 800, color: rank <= 3 ? GD_GOLD : GD_ACCENT,
                fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums",
              }}>{team.score.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── ThankYouPhase ──
const ThankYouPhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const phaseFrame = frame - THANKYOU_START;
  const subtitleSpring = spring({ frame: phaseFrame, fps, config: { damping: 18, stiffness: 80 } });
  const titleSpring = spring({ frame: Math.max(0, phaseFrame - 20), fps, config: { damping: 14, stiffness: 70 } });
  const closingSpring = spring({ frame: Math.max(0, phaseFrame - 45), fps, config: { damping: 18, stiffness: 80 } });
  const fadeOpacity = getFadeOpacity(frame);
  const glowPulse = interpolate(phaseFrame % 180, [0, 90, 180], [0.15, 0.35, 0.15], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", zIndex: 10 }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 600, height: 600,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GD_PURPLE}${Math.round(glowPulse * 60).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{
          fontSize: TYPOGRAPHY.h6, color: GD_ACCENT, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase",
          opacity: subtitleSpring, transform: `translateY(${interpolate(subtitleSpring, [0, 1], [20, 0])}px)`,
          fontFamily: "'Inter', sans-serif",
        }}>AWS Community GameDay Europe</div>
        <div style={{
          fontSize: TYPOGRAPHY.stat, fontWeight: 800, color: "white", textAlign: "center",
          opacity: titleSpring, transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px) scale(${interpolate(titleSpring, [0, 1], [0.85, 1])})`,
          fontFamily: "'Inter', sans-serif", textShadow: `0 0 60px ${GD_VIOLET}40`,
        }}>Thank You</div>
        <div style={{
          fontSize: TYPOGRAPHY.h6, color: "rgba(255,255,255,0.6)", fontWeight: 400,
          opacity: closingSpring, transform: `translateY(${interpolate(closingSpring, [0, 1], [15, 0])}px)`,
          fontFamily: "'Inter', sans-serif",
        }}>See you at the next GameDay!</div>
      </div>
      {fadeOpacity > 0 && <AbsoluteFill style={{ backgroundColor: "black", opacity: fadeOpacity, zIndex: 100 }} />}
    </AbsoluteFill>
  );
};

// ── Main Composition: Part B — Winners Template ──
export const GameDayClosingWinners: React.FC = () => {
  const frame = useCurrentFrame();

  const getPhaseComponent = () => {
    if (frame < REVEAL_6TH) return <ShufflePhase frame={frame} />;
    if (frame < ROLL_CALL_START) return <RevealPhase frame={frame} />;
    if (frame < THANKYOU_START) return <RollCallPhase frame={frame} />;
    return <ThankYouPhase frame={frame} />;
  };

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: GD_DARK }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <SegmentTransitionFlash />

      <Sequence name="Shuffle" from={SHUFFLE_START} durationInFrames={SHUFFLE_END - SHUFFLE_START + 1} layout="none">
        {frame < REVEAL_6TH && (
          <AbsoluteFill style={{ zIndex: 10 }}>
            <ShufflePhase frame={frame} />
          </AbsoluteFill>
        )}
      </Sequence>

      <Sequence name="Reveal (6th → 1st)" from={REVEAL_6TH} durationInFrames={ROLL_CALL_START - REVEAL_6TH} layout="none">
        {frame >= REVEAL_6TH && frame < ROLL_CALL_START && (
          <AbsoluteFill style={{ zIndex: 10 }}>
            <RevealPhase frame={frame} />
          </AbsoluteFill>
        )}
      </Sequence>

      <Sequence name="Roll Call" from={ROLL_CALL_START} durationInFrames={THANKYOU_START - ROLL_CALL_START} layout="none">
        {frame >= ROLL_CALL_START && frame < THANKYOU_START && (
          <AbsoluteFill style={{ zIndex: 10 }}>
            <RollCallPhase frame={frame} />
          </AbsoluteFill>
        )}
      </Sequence>

      <Sequence name="Thank You + Fade" from={THANKYOU_START} durationInFrames={TOTAL_FRAMES - THANKYOU_START} layout="none">
        {frame >= THANKYOU_START && (
          <AbsoluteFill style={{ zIndex: 10 }}>
            <ThankYouPhase frame={frame} />
          </AbsoluteFill>
        )}
      </Sequence>

      <AudioBadge muted={false} />
    </AbsoluteFill>
  );
};
