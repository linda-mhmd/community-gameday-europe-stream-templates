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
  springConfig,
  formatTime,
  GD_DARK,
  GD_GOLD,
  GD_PURPLE,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_ORANGE,
} from "./shared/GameDayDesignSystem";
import { USER_GROUPS, LOGO_MAP } from "./archive/CommunityGamedayEuropeV4";
import { ORGANIZERS, AWS_SUPPORTERS } from "./shared/organizers";

// ── Derived Data ──
const COUNTRIES = Array.from(new Set(USER_GROUPS.map((g) => g.flag)));

// ── Phase Enum ──
export enum Phase {
  Showcase = "showcase",
  Shuffle = "shuffle",
  Reveal = "reveal",
  ThankYou = "thankyou",
}

// ── Phase Boundary Constants ──
export const PHASE_BOUNDARIES = {
  showcaseStart: 0,
  showcaseEnd: 1899,
  shuffleStart: 1900,
  shuffleEnd: 3699,
  revealStart: 3700,
  revealEnd: 12699,
  thankYouStart: 12700,
  thankYouEnd: 21699,
} as const;

// ── Reveal Frame Offsets ──
export const REVEAL_FRAMES = {
  6: 3700, 5: 4300, 4: 4900, 3: 5500, 2: 6400, 1: 7300,
  fullPodium: 8200,
} as const;

// ── Composition Constants ──
export const WIDTH = 1280;
export const HEIGHT = 720;
export const FPS = 30;
export const TOTAL_FRAMES = 21700;
export const GROUPS_PER_PAGE = 6;
export const PAGE_DURATION = 120;
export const SHUFFLE_POSITIONS = 6;
export const SHUFFLE_SCORE_MIN = 3000;
export const SHUFFLE_SCORE_MAX = 5000;
export const FLASH_DURATION = 60;
export const PHASE_BOUNDARY_FRAMES = [0, 1900, 3700, 12700];
export const FADE_START = 21610;
export const FADE_END = 21699;
export const FULL_PODIUM_FRAME = 8200;
export const TEAM_PODIUM_FRAME = 9700;
export const TOP_CARD_WIDTH = 280;
export const BOTTOM_CARD_WIDTH = 220;

// ── Showcase Sub-Phase Timing ──
const HERO_INTRO_END = 1599;
const FAST_SCROLL_START = 1600;

// ── TeamData Interface ──
export interface TeamData {
  name: string;
  flag: string;
  city: string;
  score: number;
  logoUrl: string | null;
}

// ── Podium Teams (1st through 6th) ──
export const PODIUM_TEAMS: TeamData[] = [
  { name: "AWS User Group Vienna", flag: "🇦🇹", city: "Vienna Austria", score: 4850, logoUrl: LOGO_MAP["AWS User Group Vienna"] ?? null },
  { name: "Berlin AWS User Group", flag: "🇩🇪", city: "Berlin Germany", score: 4720, logoUrl: LOGO_MAP["Berlin AWS User Group"] ?? null },
  { name: "AWS User Group France- Paris", flag: "🇫🇷", city: "Paris France", score: 4580, logoUrl: LOGO_MAP["AWS User Group France- Paris"] ?? null },
  { name: "AWS User Group Finland", flag: "🇫🇮", city: "Helsinki Finland", score: 4410, logoUrl: LOGO_MAP["AWS User Group Finland"] ?? null },
  { name: "AWS User Group Roma", flag: "🇮🇹", city: "Roma Italy", score: 4250, logoUrl: LOGO_MAP["AWS User Group Roma"] ?? null },
  { name: "AWS User Group Warsaw", flag: "🇵🇱", city: "Warsaw Poland", score: 4090, logoUrl: LOGO_MAP["AWS User Group Warsaw"] ?? null },
];

// ── Winning City Teams (Top 6 teams from Vienna, ordered by score descending) ──
export const WINNING_CITY_TEAMS: TeamData[] = [
  { name: "Lorem Ipsum Team", flag: "🏳️", city: "TBD", score: 17320, logoUrl: null },
  { name: "Dolor Sit Amet", flag: "🏳️", city: "TBD", score: 16890, logoUrl: null },
  { name: "Consectetur Elite", flag: "🏳️", city: "TBD", score: 15740, logoUrl: null },
  { name: "Sed Do Eiusmod", flag: "🏳️", city: "TBD", score: 14200, logoUrl: null },
  { name: "Tempor Incididunt", flag: "🏳️", city: "TBD", score: 13650, logoUrl: null },
  { name: "Ut Labore Dolore", flag: "🏳️", city: "TBD", score: 12980, logoUrl: null },
];

// ── Reveal Schedule ──
export const REVEAL_SCHEDULE = [
  { rank: 6, frame: 3700, duration: 600 },
  { rank: 5, frame: 4300, duration: 600 },
  { rank: 4, frame: 4900, duration: 600 },
  { rank: 3, frame: 5500, duration: 900 },
  { rank: 2, frame: 6400, duration: 900 },
  { rank: 1, frame: 7300, duration: 900 },
];

// ── Position Label ──
export function getPositionLabelText(rank: number): string {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return medal ? `${medal} #${rank}` : `#${rank}`;
}

export const PositionLabel: React.FC<{ rank: number }> = ({ rank }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 10,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        borderRadius: 8,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 700,
        color: "white",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {getPositionLabelText(rank)}
    </div>
  );
};

// ── Podium Bar Height ──
export function getPodiumBarHeight(teamScore: number, maxScore: number, maxBarHeight: number): number {
  return Math.max(0.4, teamScore / maxScore) * maxBarHeight;
}

// ── Pure Utility Functions ──
export function getActivePhase(frame: number): Phase {
  if (frame <= 1899) return Phase.Showcase;
  if (frame <= 3699) return Phase.Shuffle;
  if (frame <= 12699) return Phase.Reveal;
  return Phase.ThankYou;
}

export function isTransitionFrame(frame: number): boolean {
  const boundaries = [0, 1900, 3700, 12700];
  return boundaries.some((b) => frame >= b && frame < b + 60);
}

export function getShowcasePage(frame: number, groupCount: number): number {
  const totalPages = Math.ceil(groupCount / GROUPS_PER_PAGE);
  const page = Math.floor(frame / PAGE_DURATION);
  return Math.min(page, totalPages - 1);
}

export function getAllShowcasePages(groupCount: number): number {
  return Math.ceil(groupCount / 6);
}

export function getShuffleCycleSpeed(frameInPhase: number): number {
  const progress = frameInPhase / 1800;
  return Math.round(10 + progress * 50);
}

export function getRevealedPlacements(frame: number): number[] {
  const placements: number[] = [];
  if (frame >= 3700) placements.push(6);
  if (frame >= 4300) placements.push(5);
  if (frame >= 4900) placements.push(4);
  if (frame >= 5500) placements.push(3);
  if (frame >= 6400) placements.push(2);
  if (frame >= 7300) placements.push(1);
  return placements;
}

export function getCountUpValue(targetScore: number, frame: number, revealFrame: number): number {
  const elapsed = Math.max(0, frame - revealFrame);
  const progress = Math.min(1, elapsed / 60);
  const eased = 1 - Math.pow(1 - progress, 3);
  return Math.round(eased * targetScore);
}

export function getFadeOpacity(frame: number): number {
  if (frame < 21610) return 0;
  return Math.min(1, (frame - 21610) / 90);
}

// ── Card Accent Colors ──
const CARD_ACCENTS = [GD_VIOLET, GD_PURPLE, GD_PINK, GD_ACCENT, "#6366f1", GD_VIOLET];

// ── SegmentTransitionFlash ──
const SegmentTransitionFlash: React.FC = () => {
  const frame = useCurrentFrame();
  if (!isTransitionFrame(frame)) return null;
  const boundary = PHASE_BOUNDARY_FRAMES.find((b) => frame >= b && frame < b + FLASH_DURATION);
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

// ── CountUp Helper ──
const CountUp: React.FC<{ target: number; frame: number; startFrame: number; suffix?: string }> = ({
  target, frame, startFrame, suffix = "",
}) => {
  const progress = Math.min(1, Math.max(0, (frame - startFrame) / 60));
  const eased = 1 - Math.pow(1 - progress, 3);
  const value = Math.round(eased * target);
  return <>{value}{suffix}</>;
};

// ── HeroIntro (frames 0-899): Multi-scene epic closing ceremony intro ──
// Scene 1 (0-179): "WHAT. A. DAY." dramatic text + GameDay logo
// Scene 2 (180-379): Big stats cascade — 53 groups, 23+ countries, 2 hours
// Scene 3 (380-549): Flag parade — all unique country flags
// Scene 4 (550-699): Organizer shoutout — Jerome & Anda
// Scene 5 (700-899): "AND NOW... THE RESULTS" dramatic transition

const UNIQUE_FLAGS = Array.from(new Set(USER_GROUPS.map((g) => g.flag)));



const HeroIntro: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Global exit fade
  const exitOpacity = interpolate(frame, [1550, 1599], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Ambient glow that shifts through scenes
  const glowHue = interpolate(frame, [0, 800, 1599], [270, 320, 280]);
  const glowPulse = Math.sin(frame * 0.04) * 0.15 + 0.5;

  // ── SCENE 1: "WHAT. A. DAY." (frames 0-179) ──
  const s1Opacity = interpolate(frame, [0, 10, 150, 179], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const word1Spring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 10, stiffness: 150 } });
  const word2Spring = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 10, stiffness: 150 } });
  const word3Spring = spring({ frame: Math.max(0, frame - 36), fps, config: { damping: 10, stiffness: 150 } });
  const logoFade = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dateFade = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleFade = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── SCENE 2: Stats cascade (frames 160-379) — overlaps with scene 1 for crossfade ──
  const s2Opacity = interpolate(frame, [160, 195, 350, 379], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const STATS = [
    { value: 53, label: "USER GROUPS", suffix: "+", delay: 190 },
    { value: COUNTRIES.length, label: "COUNTRIES", suffix: "+", delay: 210 },
    { value: 2, label: "HOURS OF GAMEPLAY", suffix: "", delay: 230 },
    { value: 1, label: "EPIC DAY", suffix: "", delay: 250 },
    { value: 4, label: "TIMEZONES", suffix: "+", delay: 270 },
  ];

  // ── SCENE 3: Flag parade (frames 360-549) — overlaps with scene 2 ──
  const s3Opacity = interpolate(frame, [360, 395, 520, 549], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flagTitleSpring = spring({ frame: Math.max(0, frame - 385), fps, config: { damping: 14, stiffness: 120 } });

  // ── SCENE 4: Community Organizers (frames 520-999) — smooth crossfade in/out ──
  const s4Opacity = interpolate(frame, [520, 560, 960, 999], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const orgTitleSpring = spring({ frame: Math.max(0, frame - 555), fps, config: { damping: 14, stiffness: 120 } });

  // ── SCENE 4b: AWS Supporters (frames 970-1399) — crossfade overlap with scene 4 ──
  const s4bOpacity = interpolate(frame, [970, 1010, 1360, 1399], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const awsTitleSpring = spring({ frame: Math.max(0, frame - 980), fps, config: { damping: 14, stiffness: 120 } });

  // ── SCENE 5: "AND NOW... THE RESULTS" (frames 1370-1599) — crossfade overlap ──
  const s5Opacity = interpolate(frame, [1370, 1410, 1550, 1599], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const andNowSpring = spring({ frame: Math.max(0, frame - 1410), fps, config: { damping: 12, stiffness: 100 } });
  const resultsSpring = spring({ frame: Math.max(0, frame - 1450), fps, config: { damping: 8, stiffness: 120 } });
  const resultsPulse = frame >= 1460 ? Math.sin((frame - 1460) * 0.08) * 0.08 + 1 : 1;
  const meetBadgeSpring = spring({ frame: Math.max(0, frame - 1490), fps, config: { damping: 14, stiffness: 120 } });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 900, height: 900,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, hsl(${glowHue}, 70%, 30%) 0%, transparent 70%)`,
        opacity: glowPulse, borderRadius: "50%", pointerEvents: "none",
      }} />

      {/* ── SCENE 1: "WHAT. A. DAY." ── */}
      {frame < 180 && (
        <AbsoluteFill style={{ opacity: s1Opacity }}>
          {/* GameDay logo top */}
          <div style={{ position: "absolute", top: 30, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logoFade }}>
            <Img src={staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png")} style={{ height: 60 }} />
          </div>
          {/* Big dramatic words */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -55%)", display: "flex", gap: 20, alignItems: "baseline" }}>
            {[
              { text: "WHAT", spring: word1Spring, color: "#ffffff" },
              { text: "A", spring: word2Spring, color: GD_ACCENT },
              { text: "DAY", spring: word3Spring, color: GD_PINK },
            ].map((w) => (
              <div key={w.text} style={{
                fontSize: 96, fontWeight: 900, fontFamily: "'Inter', sans-serif", letterSpacing: 6,
                color: w.color, opacity: w.spring,
                transform: `translateY(${interpolate(w.spring, [0, 1], [60, 0])}px) scale(${interpolate(w.spring, [0, 1], [0.7, 1])})`,
                textShadow: `0 0 40px ${w.color}40, 0 4px 20px rgba(0,0,0,0.5)`,
              }}>{w.text}.</div>
            ))}
          </div>
          {/* Date */}
          <div style={{ position: "absolute", top: "58%", left: 0, right: 0, textAlign: "center", opacity: dateFade }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: GD_GOLD, fontFamily: "'Inter', sans-serif", letterSpacing: 3 }}>17 MARCH 2026</span>
          </div>
          {/* Subtitle */}
          <div style={{ position: "absolute", top: "65%", left: 0, right: 0, textAlign: "center", opacity: subtitleFade }}>
            <span style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", letterSpacing: 2 }}>
              THE FIRST AWS COMMUNITY GAMEDAY EUROPE
            </span>
          </div>
        </AbsoluteFill>
      )}

      {/* ── SCENE 2: Stats cascade ── */}
      {frame >= 160 && frame < 380 && (
        <AbsoluteFill style={{ opacity: s2Opacity }}>
          <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", letterSpacing: 4, textTransform: "uppercase" }}>
              TONIGHT WE MADE HISTORY
            </span>
          </div>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px 60px", maxWidth: 1100,
          }}>
            {STATS.map((stat, i) => {
              const statSpring = spring({ frame: Math.max(0, frame - stat.delay), fps, config: { damping: 12, stiffness: 120 } });
              const accentColors = [GD_ACCENT, GD_VIOLET, GD_PINK, GD_GOLD, GD_ORANGE];
              return (
                <div key={stat.label} style={{
                  textAlign: "center", opacity: statSpring,
                  transform: `translateY(${interpolate(statSpring, [0, 1], [40, 0])}px)`,
                }}>
                  <div style={{
                    fontSize: 72, fontWeight: 900, fontFamily: "'Inter', sans-serif",
                    color: accentColors[i], lineHeight: 1,
                    textShadow: `0 0 30px ${accentColors[i]}50`,
                  }}>
                    <CountUp target={stat.value} frame={frame} startFrame={stat.delay} suffix={stat.suffix} />
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginTop: 8,
                    letterSpacing: 3, fontFamily: "'Inter', sans-serif",
                  }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* ── SCENE 3: Flag parade ── */}
      {frame >= 360 && frame < 550 && (
        <AbsoluteFill style={{ opacity: s3Opacity }}>
          <div style={{
            position: "absolute", top: 80, left: 0, right: 0, textAlign: "center",
            opacity: flagTitleSpring, transform: `translateY(${interpolate(flagTitleSpring, [0, 1], [20, 0])}px)`,
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", letterSpacing: 4 }}>
              THANK YOU TO EVERY
            </div>
            <div style={{
              fontSize: 36, fontWeight: 900, fontFamily: "'Inter', sans-serif", marginTop: 8,
              background: `linear-gradient(135deg, #ffffff, ${GD_ACCENT})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>USER GROUP LEADER</div>
          </div>
          {/* Flag grid */}
          <div style={{
            position: "absolute", top: "42%", left: "50%", transform: "translateX(-50%)",
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, maxWidth: 900,
          }}>
            {UNIQUE_FLAGS.map((flag, i) => {
              const flagSpring = spring({ frame: Math.max(0, frame - 395 - i * 3), fps, config: { damping: 14, stiffness: 120 } });
              return (
                <div key={i} style={{
                  fontSize: 48, opacity: flagSpring,
                  transform: `scale(${interpolate(flagSpring, [0, 1], [0.3, 1])}) translateY(${interpolate(flagSpring, [0, 1], [20, 0])}px)`,
                  filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.4))`,
                }}>{flag}</div>
              );
            })}
          </div>
          {/* Bottom text */}
          <div style={{
            position: "absolute", bottom: 80, left: 0, right: 0, textAlign: "center",
            opacity: interpolate(frame, [430, 450], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", letterSpacing: 2 }}>
              {`VOLUNTEERS • ACROSS ALL ${COUNTRIES.length}+ PARTICIPATING COUNTRIES • PURE COMMUNITY SPIRIT`}
            </span>
          </div>
        </AbsoluteFill>
      )}

      {/* ── SCENE 4: Organizer shoutout ── */}
      {frame >= 520 && frame < 1000 && (
        <AbsoluteFill style={{ opacity: s4Opacity }}>
          <div style={{
            position: "absolute", top: 40, left: 0, right: 0, textAlign: "center",
            opacity: orgTitleSpring, transform: `translateY(${interpolate(orgTitleSpring, [0, 1], [20, 0])}px)`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", letterSpacing: 5 }}>
              COMMUNITY GAMEDAY EUROPE ORGANIZERS
            </div>
            <div style={{
              fontSize: 36, fontWeight: 900, fontFamily: "'Inter', sans-serif", marginTop: 8,
              color: GD_GOLD, letterSpacing: 1,
            }}>From the Community, for the Community</div>
          </div>
          {/* Organizer cards */}
          <div style={{
            position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "36px 80px", maxWidth: 1250,
          }}>
            {ORGANIZERS.map((org, i) => {
              const cardSpring = spring({ frame: Math.max(0, frame - 565 - i * 12), fps, config: { damping: 12, stiffness: 100 } });
              return (
                <div key={org.name} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  opacity: cardSpring, transform: `translateY(${interpolate(cardSpring, [0, 1], [30, 0])}px)`,
                }}>
                  <div style={{
                    width: 130, height: 130, borderRadius: "50%", overflow: "hidden",
                    boxShadow: `0 0 30px ${GD_VIOLET}70, 0 0 60px ${GD_PURPLE}40, 0 4px 16px rgba(0,0,0,0.4)`,
                  }}>
                    <Img src={staticFile(org.face)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
                      {org.flag} {org.name}
                    </div>
                    <div style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif", marginTop: 3, whiteSpace: "nowrap" }}>
                      {org.role}
                    </div>
                    <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", marginTop: 1 }}>
                      {org.country}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* ── SCENE 4b: AWS Supporters ── */}
      {frame >= 970 && frame < 1400 && (
        <AbsoluteFill style={{ opacity: s4bOpacity }}>
          <div style={{
            position: "absolute", top: 40, left: 0, right: 0, textAlign: "center",
            opacity: awsTitleSpring, transform: `translateY(${interpolate(awsTitleSpring, [0, 1], [20, 0])}px)`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", letterSpacing: 5 }}>
              POWERED BY
            </div>
            <div style={{
              fontSize: 36, fontWeight: 900, fontFamily: "'Inter', sans-serif", marginTop: 8,
              color: GD_ACCENT, letterSpacing: 1,
            }}>Thank You, AWS</div>
          </div>
          {/* Subtitle */}
          <div style={{
            position: "absolute", top: 130, left: 0, right: 0, textAlign: "center",
            opacity: interpolate(frame, [1000, 1030], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <span style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>
              For the GameDay environment, outstanding support during organization, and so much more
            </span>
          </div>
          {/* AWS supporter cards — centered row of 3 */}
          <div style={{
            position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 60, justifyContent: "center", alignItems: "flex-start",
          }}>
            {AWS_SUPPORTERS.map((person, i) => {
              const cardSpring = spring({ frame: Math.max(0, frame - 1000 - i * 15), fps, config: { damping: 12, stiffness: 100, mass: 0.8 } });
              const cardScale = interpolate(cardSpring, [0, 1], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={person.name} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                  opacity: cardSpring, transform: `scale(${cardScale}) translateY(${interpolate(cardSpring, [0, 1], [20, 0])}px)`,
                }}>
                  <div style={{
                    width: 140, height: 140, borderRadius: "50%", overflow: "hidden",
                    boxShadow: `0 0 30px ${GD_ACCENT}50, 0 0 60px ${GD_PURPLE}30, 0 4px 16px rgba(0,0,0,0.4)`,
                    border: `2px solid ${GD_ACCENT}40`,
                  }}>
                    <Img src={staticFile(person.face)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ textAlign: "center", maxWidth: 200 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
                      {person.name}
                    </div>
                    <div style={{ fontSize: 14, color: GD_ACCENT, fontFamily: "'Inter', sans-serif", marginTop: 4, fontWeight: 600 }}>
                      {person.country}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", marginTop: 3, lineHeight: 1.3 }}>
                      {person.role}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* "And many more" indicator */}
          <div style={{
            position: "absolute", bottom: 80, left: 0, right: 0, textAlign: "center",
            opacity: interpolate(frame, [1060, 1090], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)",
              borderRadius: 12, padding: "10px 24px", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{ fontSize: 20 }}>🙏</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>
                And many more AWS colleagues who made this possible
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── SCENE 5: "AND NOW... THE RESULTS" ── */}
      {frame >= 1370 && (
        <AbsoluteFill style={{ opacity: s5Opacity }}>
          {/* Radial burst */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", width: 1000, height: 1000,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${GD_PURPLE}40 0%, ${GD_PINK}15 40%, transparent 70%)`,
            borderRadius: "50%", opacity: resultsSpring,
          }} />
          <div style={{
            position: "absolute", top: "32%", left: 0, right: 0, textAlign: "center",
            opacity: andNowSpring, transform: `translateY(${interpolate(andNowSpring, [0, 1], [30, 0])}px)`,
          }}>
            <span style={{ fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", letterSpacing: 6 }}>
              AND NOW...
            </span>
          </div>
          <div style={{
            position: "absolute", top: "44%", left: 0, right: 0, textAlign: "center",
            opacity: resultsSpring,
            transform: `scale(${resultsPulse * interpolate(resultsSpring, [0, 1], [0.6, 1])})`,
          }}>
            <div style={{
              fontSize: 72, fontWeight: 900, fontFamily: "'Inter', sans-serif", letterSpacing: 8,
              background: `linear-gradient(135deg, ${GD_GOLD} 0%, #ffffff 40%, ${GD_GOLD} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              textShadow: "none", filter: `drop-shadow(0 0 30px ${GD_GOLD}40)`,
            }}>THE RESULTS</div>
          </div>
          {/* "Meet the communities" badge */}
          <div style={{
            position: "absolute", bottom: 80, left: 0, right: 0, display: "flex", justifyContent: "center",
            opacity: meetBadgeSpring, transform: `scale(${interpolate(meetBadgeSpring, [0, 1], [0.8, 1])})`,
          }}>
            <div style={{
              background: `linear-gradient(135deg, #4f46e5, ${GD_PINK})`, borderRadius: 12, padding: "10px 28px",
              fontSize: 14, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', sans-serif", letterSpacing: 1,
              display: "flex", alignItems: "center",
            }}>
              <Img src={staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png")} style={{ height: 24, marginRight: 8 }} />
              But first — meet the participating communities
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ── FastScroll (frames 900-7199): Continuous vertical scroll through all 53 groups ──
const SCROLL_COLS = 3;
const CARD_HEIGHT = 310;
const CARD_GAP = 14;
const SCROLL_ROW_HEIGHT = CARD_HEIGHT + CARD_GAP;
const TOTAL_ROWS = Math.ceil(USER_GROUPS.length / SCROLL_COLS);
const TOTAL_SCROLL_HEIGHT = TOTAL_ROWS * SCROLL_ROW_HEIGHT;
const VIEWPORT_TOP = 56;
const VIEWPORT_HEIGHT_PX = 720 - VIEWPORT_TOP - 24;

const FastScroll: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const scrollFrame = frame - FAST_SCROLL_START;
  const scrollDuration = 1800; // ~60s of scrolling then hold

  const entryOpacity = interpolate(scrollFrame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scrollProgress = interpolate(scrollFrame, [15, scrollDuration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = scrollProgress < 0.5 ? 2 * scrollProgress * scrollProgress : 1 - Math.pow(-2 * scrollProgress + 2, 2) / 2;

  const maxScroll = TOTAL_SCROLL_HEIGHT - VIEWPORT_HEIGHT_PX;
  const scrollY = eased * maxScroll;
  const glowX = interpolate(eased, [0, 1], [25, 75]);
  const glowY = interpolate(eased, [0, 0.5, 1], [30, 60, 35]);

  const firstVisibleRow = Math.max(0, Math.floor((scrollY - SCROLL_ROW_HEIGHT) / SCROLL_ROW_HEIGHT));
  const lastVisibleRow = Math.min(TOTAL_ROWS - 1, Math.ceil((scrollY + VIEWPORT_HEIGHT_PX + SCROLL_ROW_HEIGHT) / SCROLL_ROW_HEIGHT));

  return (
    <AbsoluteFill style={{ opacity: entryOpacity }}>
      <div style={{
        position: "absolute", top: `${glowY}%`, left: `${glowX}%`, width: 800, height: 800,
        transform: "translate(-50%, -50%)", background: `radial-gradient(circle, ${GD_PURPLE}30 0%, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", top: 48, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.03)", zIndex: 20 }}>
        <div style={{ height: "100%", width: `${scrollProgress * 100}%`, background: `linear-gradient(90deg, ${GD_PURPLE}, ${GD_VIOLET}, ${GD_PINK})`, boxShadow: `0 0 12px ${GD_PINK}60` }} />
      </div>
      <div style={{ position: "absolute", top: VIEWPORT_TOP, left: 0, right: 0, height: 60, background: `linear-gradient(180deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 15, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: `linear-gradient(0deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 15, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: VIEWPORT_TOP, left: 28, right: 28, bottom: 24, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-scrollY}px)`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: CARD_GAP, width: "100%" }}>
          {USER_GROUPS.map((group, i) => {
            const row = Math.floor(i / SCROLL_COLS);
            if (row < firstVisibleRow || row > lastVisibleRow) return <div key={i} style={{ height: CARD_HEIGHT }} />;
            const cardTop = row * SCROLL_ROW_HEIGHT;
            const cardCenter = cardTop + CARD_HEIGHT / 2;
            const viewportCenter = scrollY + VIEWPORT_HEIGHT_PX / 2;
            const distFromCenter = Math.abs(cardCenter - viewportCenter);
            const cardOpacity = interpolate(distFromCenter, [0, VIEWPORT_HEIGHT_PX * 0.45, VIEWPORT_HEIGHT_PX * 0.6], [1, 0.85, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            const entrySpring = spring({ frame: Math.max(0, scrollFrame - i), fps, config: { damping: 18, stiffness: 100 } });
            const accentColor = CARD_ACCENTS[i % CARD_ACCENTS.length];
            const logoUrl = LOGO_MAP[group.name];
            return (
              <div key={i} style={{
                height: CARD_HEIGHT, opacity: cardOpacity * entrySpring,
                transform: `scale(${interpolate(cardOpacity, [0, 1], [0.95, 1])})`,
                background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden",
                display: "flex", flexDirection: "column",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}>
                {logoUrl ? (
                  <div style={{ width: "100%", flex: 1, borderRadius: "16px 16px 0 0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
                    <Img src={logoUrl} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                ) : (
                  <div style={{ width: "100%", flex: 1, borderRadius: "16px 16px 0 0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${accentColor}40, ${GD_DARK})` }}>
                    <div style={{ fontSize: 72, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>{group.flag}</div>
                  </div>
                )}
                <div style={{ padding: "6px 12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 14, lineHeight: 1 }}>{group.flag}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', sans-serif", lineHeight: 1.2 }}>{group.name}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4, marginLeft: 22 }}>📍 {group.city}</div>
                </div>
                <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── ShowcasePhase (Hero Intro + Fast Scroll) ──
const ShowcasePhase: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <AbsoluteFill>
      {frame <= HERO_INTRO_END ? <HeroIntro frame={frame} /> : <FastScroll frame={frame} />}
    </AbsoluteFill>
  );
};

// ── ResultsCountdown ──
const ResultsCountdown: React.FC<{ frame: number }> = ({ frame }) => {
  // Only show during fast scroll phase (after hero intro)
  if (frame <= HERO_INTRO_END) return null;
  const countdown = formatTime(Math.max(0, Math.floor((3700 - frame) / 30)));
  return (
    <div style={{ position: "absolute", top: 16, right: 16, zIndex: 20 }}>
      <GlassCard style={{ padding: "6px 14px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Results in</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: GD_GOLD, fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>{countdown}</div>
        </div>
      </GlassCard>
    </div>
  );
};

// ── ShufflePhase: Bell Curve Horizontal Scroll ──
// All 53 groups scroll right-to-left as vertical bars. Bars in the center of the screen
// are tallest (bell curve peak), bars at edges are shorter. Text is big and wraps.
const SHUFFLE_BAR_WIDTH = 160;
const SHUFFLE_BAR_GAP = 16;
const SHUFFLE_TOTAL_WIDTH = USER_GROUPS.length * (SHUFFLE_BAR_WIDTH + SHUFFLE_BAR_GAP);

const ShufflePhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const frameInPhase = frame - 1900;
  const phaseDuration = 1800; // 60 seconds

  // Entry animation
  const entrySpring = spring({ frame: frameInPhase, fps, config: { damping: 16, stiffness: 100 } });

  // Horizontal scroll: move all bars from right to left
  // Start with bars off-screen right, end with them off-screen left
  const scrollProgress = interpolate(frameInPhase, [15, phaseDuration - 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Ease for smooth feel
  const easedScroll = scrollProgress < 0.5
    ? 2 * scrollProgress * scrollProgress
    : 1 - Math.pow(-2 * scrollProgress + 2, 2) / 2;

  // Total scroll distance: from all bars off-screen right to all off-screen left
  const totalScrollDist = SHUFFLE_TOTAL_WIDTH + 1280;
  const scrollX = easedScroll * totalScrollDist - 1280 * 0.1; // start slightly off-screen right

  // Assign each group a deterministic shuffled score
  const groupsWithScores = USER_GROUPS.map((group, i) => {
    const score = SHUFFLE_SCORE_MIN + ((i * 17 + 31) % (SHUFFLE_SCORE_MAX - SHUFFLE_SCORE_MIN + 1));
    return { ...group, score };
  });

  // Sort by score for the bell curve visual (lowest at edges, highest in center)
  const sorted = [...groupsWithScores].sort((a, b) => a.score - b.score);
  // Interleave: place highest in center, lower scores alternate left/right
  const bellOrder: typeof sorted = new Array(sorted.length);
  let left = 0;
  let right = sorted.length - 1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (i % 2 === 0) {
      bellOrder[Math.floor(sorted.length / 2) + left] = sorted[i];
      left++;
    } else {
      bellOrder[Math.floor(sorted.length / 2) - right + sorted.length - 1] = sorted[i];
      right--;
    }
  }
  // Simpler approach: sort ascending, then reorder so highest are in the middle
  const ascending = [...groupsWithScores].sort((a, b) => a.score - b.score);
  const bellCurveOrder: typeof ascending = [];
  for (let i = 0; i < ascending.length; i++) {
    if (i % 2 === 0) bellCurveOrder.push(ascending[i]);
    else bellCurveOrder.unshift(ascending[i]);
  }

  const screenCenter = 1280 / 2;

  return (
    <AbsoluteFill style={{ opacity: entrySpring }}>
      {/* Title */}
      <div style={{
        position: "absolute", top: 20, left: 0, right: 0, textAlign: "center", zIndex: 10,
        opacity: interpolate(frameInPhase, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: GD_ACCENT, fontFamily: "'Inter', sans-serif", letterSpacing: 2, textTransform: "uppercase" }}>
          Calculating Winners...
        </div>
      </div>

      {/* Horizontal scrolling bars container */}
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, bottom: 40, overflow: "hidden" }}>
        {/* Left/right fade masks */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 120, background: `linear-gradient(90deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 120, background: `linear-gradient(270deg, ${GD_DARK} 0%, transparent 100%)`, zIndex: 10, pointerEvents: "none" }} />

        <div style={{
          display: "flex", alignItems: "flex-end", height: "100%",
          transform: `translateX(${-scrollX}px)`, gap: SHUFFLE_BAR_GAP,
          paddingLeft: 1280, // start off-screen right
        }}>
          {bellCurveOrder.map((group, i) => {
            const barX = i * (SHUFFLE_BAR_WIDTH + SHUFFLE_BAR_GAP) - scrollX + 1280;
            const barCenter = barX + SHUFFLE_BAR_WIDTH / 2;
            const distFromScreenCenter = Math.abs(barCenter - screenCenter);

            // Bell curve height: tallest at center, shortest at edges
            const maxBarHeight = 420;
            const minBarHeight = 80;
            const bellFactor = Math.exp(-Math.pow(distFromScreenCenter / 400, 2));
            const barHeight = minBarHeight + (maxBarHeight - minBarHeight) * bellFactor;

            // Opacity also follows bell curve
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
                {/* Flag */}
                <div style={{ fontSize: 28, marginBottom: 6, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>{group.flag}</div>
                {/* Team name — wraps, no truncation */}
                <div style={{
                  fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)",
                  fontFamily: "'Inter', sans-serif", textAlign: "center",
                  marginBottom: 8, lineHeight: 1.3, width: SHUFFLE_BAR_WIDTH - 8,
                  wordWrap: "break-word", overflowWrap: "break-word",
                }}>{group.name}</div>
                {/* Bar */}
                <div style={{
                  width: "85%", height: barHeight, borderRadius: "10px 10px 0 0",
                  background: `linear-gradient(180deg, ${accentColor}cc, ${GD_PURPLE}90)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 24px ${accentColor}25`, border: `1px solid ${accentColor}30`, borderBottom: "none",
                  position: "relative",
                }}>
                  <div style={{
                    fontSize: 18, fontWeight: 800, color: "white", fontFamily: "'Inter', sans-serif",
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

// ── TeamRevealCard ──
const TeamRevealCard: React.FC<{ team: TeamData; rank: number; frame: number; revealFrame: number }> = ({ team, rank, frame, revealFrame }) => {
  const { fps } = useVideoConfig();
  const borderColor = rank === 1 ? GD_GOLD : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "rgba(255,255,255,0.1)";
  const config = rank === 1 ? springConfig.emphasis : springConfig.entry;
  const elapsed = Math.max(0, frame - revealFrame);
  const progress = spring({ frame: elapsed, fps, config });
  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const scale = interpolate(progress, [0, 1], [0.9, 1]);
  const displayScore = getCountUpValue(team.score, frame, revealFrame);

  return (
    <div style={{ opacity: progress, transform: `translateY(${translateY}px) scale(${scale})` }}>
      <div style={{
        background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)",
        border: `1.5px solid ${borderColor}`, borderRadius: 16, overflow: "hidden",
        boxShadow: rank === 1 ? `0 0 30px ${GD_GOLD}25, 0 8px 32px rgba(0,0,0,0.4)` : "0 8px 32px rgba(0,0,0,0.3)",
      }}>
        {team.logoUrl ? (
          <div style={{ width: "100%", aspectRatio: "600 / 337", borderRadius: "16px 16px 0 0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
            <Img src={team.logoUrl} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          </div>
        ) : (
          <div style={{ width: "100%", aspectRatio: "600 / 337", borderRadius: "16px 16px 0 0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${GD_PURPLE}40, ${GD_DARK})` }}>
            <div style={{ fontSize: 72, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>{team.flag}</div>
          </div>
        )}
        <div style={{ padding: "8px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white", textAlign: "center", fontFamily: "'Inter', sans-serif", lineHeight: 1.2 }}>{team.flag} {team.name}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>{team.city}</div>
          <div style={{ marginTop: 4, fontSize: 22, fontWeight: 800, color: rank === 1 ? GD_GOLD : "white", textAlign: "center", fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>{displayScore.toLocaleString()}</div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${borderColor}60, transparent)` }} />
      </div>
    </div>
  );
};

// ── Team Podium Reveal ──
export const TeamPodiumReveal: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const phaseFrame = frame - TEAM_PODIUM_FRAME;
  const entryProgress = spring({ frame: phaseFrame, fps, config: springConfig.entry });

  const top3 = WINNING_CITY_TEAMS.slice(0, 3);
  const bottom3 = WINNING_CITY_TEAMS.slice(3, 6);

  // Podium card renderer
  const PodiumCard: React.FC<{ team: TeamData; rank: number; width: number; isTop: boolean }> = ({ team, rank, width, isTop }) => {
    const borderColor = rank === 1 ? GD_GOLD : rank === 2 ? GD_GOLD + "80" : rank === 3 ? GD_GOLD + "80" : GD_GOLD + "60";
    const scoreColor = rank === 1 ? GD_GOLD : GD_GOLD;
    return (
      <div style={{
        width,
        background: "rgba(10, 8, 30, 0.85)",
        border: `2px solid ${borderColor}`,
        borderRadius: 12,
        padding: isTop ? "20px 16px" : "14px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: isTop ? 8 : 6,
        boxShadow: rank === 1 ? `0 0 40px ${GD_GOLD}30, inset 0 1px 0 ${GD_GOLD}20` : `0 8px 32px rgba(0,0,0,0.4)`,
      }}>
        <div style={{
          fontSize: isTop ? 32 : 22,
          fontWeight: 900,
          color: GD_GOLD,
          fontFamily: "'Inter', sans-serif",
        }}>#{rank}</div>
        <div style={{
          fontSize: isTop ? 11 : 10,
          fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Inter', sans-serif",
          textTransform: "uppercase",
          letterSpacing: 2,
        }}>Team</div>
        <div style={{
          fontSize: isTop ? 16 : 13,
          fontWeight: 700,
          color: "white",
          fontFamily: "'Inter', sans-serif",
          textAlign: "center",
          lineHeight: 1.3,
        }}>{team.name}</div>
        <div style={{
          fontSize: isTop ? 28 : 20,
          fontWeight: 900,
          color: scoreColor,
          fontFamily: "'Inter', sans-serif",
          fontVariantNumeric: "tabular-nums",
        }}>{team.score.toLocaleString()}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: entryProgress,
      }}
    >
      {/* Title */}
      <div style={{
        fontSize: 32,
        fontWeight: 900,
        color: GD_GOLD,
        fontFamily: "'Inter', sans-serif",
        marginBottom: 32,
        textShadow: `0 2px 20px ${GD_GOLD}40`,
        textAlign: "center",
        letterSpacing: 4,
        textTransform: "uppercase",
      }}>
        🏆 Podium 🏆
      </div>

      {/* Top 3 podium: 2nd (left, lower), 1st (center, higher), 3rd (right, lower) */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 20,
        marginBottom: 24,
      }}>
        {/* 2nd place — left, lower */}
        <div style={{ marginBottom: 0 }}>
          <PodiumCard team={top3[1]} rank={2} width={240} isTop={true} />
        </div>
        {/* 1st place — center, elevated */}
        <div style={{ marginBottom: 50 }}>
          <PodiumCard team={top3[0]} rank={1} width={280} isTop={true} />
        </div>
        {/* 3rd place — right, lowest */}
        <div style={{ marginBottom: 0 }}>
          <PodiumCard team={top3[2]} rank={3} width={220} isTop={true} />
        </div>
      </div>

      {/* Bottom row: 4th, 5th, 6th */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
      }}>
        {bottom3.map((team, i) => (
          <PodiumCard key={i + 4} team={team} rank={i + 4} width={200} isTop={false} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ── RevealPhase ──
const RevealPhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const revealed = getRevealedPlacements(frame);
  const isTeamPodium = frame >= TEAM_PODIUM_FRAME;
  const isFullPodium = frame >= FULL_PODIUM_FRAME;
  const currentReveal = REVEAL_SCHEDULE.slice().reverse().find((r) => frame >= r.frame);
  if (!currentReveal) return null;

  if (isTeamPodium) {
    return <TeamPodiumReveal frame={frame} />;
  }

  if (isFullPodium) {
    const topRow = [1, 2, 3];
    const bottomRow = [4, 5, 6];
    const entryProgress = spring({ frame: frame - FULL_PODIUM_FRAME, fps, config: springConfig.entry });
    return (
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 40px", opacity: entryProgress }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: GD_GOLD, fontFamily: "'Inter', sans-serif", marginBottom: 16, textShadow: "0 2px 12px rgba(0,0,0,0.5)", textAlign: "center" }}>🏆 Final Standings</div>
        {/* Top Row: positions 1, 2, 3 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 20 }}>
          {topRow.map((rank) => {
            const team = PODIUM_TEAMS[rank - 1];
            const revealEntry = REVEAL_SCHEDULE.find((r) => r.rank === rank);
            const revealFrame = revealEntry?.frame ?? FULL_PODIUM_FRAME;
            return (
              <div key={rank} style={{
                position: "relative",
                width: TOP_CARD_WIDTH,
                filter: rank === 1 ? `drop-shadow(0 0 20px ${GD_GOLD}80)` : "none",
              }}>
                <PositionLabel rank={rank} />
                <TeamRevealCard team={team} rank={rank} frame={frame} revealFrame={revealFrame} />
              </div>
            );
          })}
        </div>
        {/* Bottom Row: positions 4, 5, 6 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          {bottomRow.map((rank) => {
            const team = PODIUM_TEAMS[rank - 1];
            const revealEntry = REVEAL_SCHEDULE.find((r) => r.rank === rank);
            const revealFrame = revealEntry?.frame ?? FULL_PODIUM_FRAME;
            return (
              <div key={rank} style={{
                position: "relative",
                width: BOTTOM_CARD_WIDTH,
              }}>
                <PositionLabel rank={rank} />
                <TeamRevealCard team={team} rank={rank} frame={frame} revealFrame={revealFrame} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  const currentRank = currentReveal.rank;
  const currentTeam = PODIUM_TEAMS[currentRank - 1];
  const previouslyRevealed = revealed.filter((r) => r !== currentRank);
  const cardProgress = spring({ frame: frame - currentReveal.frame, fps, config: currentRank === 1 ? springConfig.emphasis : springConfig.entry });

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 40px" }}>
      <div style={{
        fontSize: 20, fontWeight: 700, fontFamily: "'Inter', sans-serif", marginBottom: 8, opacity: cardProgress, textShadow: "0 2px 8px rgba(0,0,0,0.5)",
        color: currentRank === 1 ? GD_GOLD : currentRank === 2 ? "#C0C0C0" : currentRank === 3 ? "#CD7F32" : "rgba(255,255,255,0.7)",
      }}>
        {currentRank === 1 ? "🥇 1st Place" : currentRank === 2 ? "🥈 2nd Place" : currentRank === 3 ? "🥉 3rd Place" : `#${currentRank}`}
      </div>
      <div style={{
        width: currentRank === 1 ? 320 : 260,
        transform: `scale(${interpolate(cardProgress, [0, 1], [0.8, 1])})`, opacity: cardProgress,
        filter: currentRank === 1 ? `drop-shadow(0 0 30px ${GD_GOLD}90)` : "none",
      }}>
        <TeamRevealCard team={currentTeam} rank={currentRank} frame={frame} revealFrame={currentReveal.frame} />
      </div>
      {previouslyRevealed.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, width: "100%", maxWidth: 900 }}>
          {previouslyRevealed.map((rank) => {
            const team = PODIUM_TEAMS[rank - 1];
            const revealEntry = REVEAL_SCHEDULE.find((r) => r.rank === rank);
            const revealFrame = revealEntry?.frame ?? 3700;
            const maxScore = PODIUM_TEAMS[0].score;
            const barHeight = interpolate(team.score, [0, maxScore], [30, 100]);
            const barProgress = spring({ frame: frame - revealFrame, fps, config: springConfig.entry });
            return (
              <div key={rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: Math.min(1, barProgress) }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: "'Inter', sans-serif", textAlign: "center", maxWidth: 100, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team.flag} {team.name}</div>
                <div style={{ width: 80, height: barHeight * barProgress, background: `linear-gradient(180deg, ${GD_ACCENT}50, ${GD_PURPLE}60)`, borderRadius: 6, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4, border: `1px solid ${GD_ACCENT}20`, borderBottom: "none" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "white", fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>{team.score.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>#{rank}</div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── ThankYou Phase ──
const ThankYouPhase: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const phaseFrame = frame - 12700;
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
          fontSize: 22, color: GD_ACCENT, fontWeight: 500, letterSpacing: 4, textTransform: "uppercase",
          opacity: subtitleSpring, transform: `translateY(${interpolate(subtitleSpring, [0, 1], [20, 0])}px)`,
          fontFamily: "'Inter', sans-serif",
        }}>AWS Community GameDay Europe</div>
        <div style={{
          fontSize: 80, fontWeight: 800, color: "white", textAlign: "center",
          opacity: titleSpring, transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px) scale(${interpolate(titleSpring, [0, 1], [0.85, 1])})`,
          fontFamily: "'Inter', sans-serif", textShadow: `0 0 60px ${GD_VIOLET}40`,
        }}>Thank You</div>
        <div style={{
          fontSize: 22, color: "rgba(255,255,255,0.6)", fontWeight: 400,
          opacity: closingSpring, transform: `translateY(${interpolate(closingSpring, [0, 1], [15, 0])}px)`,
          fontFamily: "'Inter', sans-serif",
        }}>See you at the next GameDay!</div>
      </div>
      {fadeOpacity > 0 && <AbsoluteFill style={{ backgroundColor: "black", opacity: fadeOpacity, zIndex: 100 }} />}
    </AbsoluteFill>
  );
};

// ── Closing Ceremony Composition ──
export const GameDayClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = getActivePhase(frame);

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: "#0c0820" }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <SegmentTransitionFlash />

      {/* Named Sequences for Remotion Studio timeline */}
      <Sequence name="Showcase (Hero + Scroll)" from={PHASE_BOUNDARIES.showcaseStart} durationInFrames={PHASE_BOUNDARIES.showcaseEnd - PHASE_BOUNDARIES.showcaseStart + 1} layout="none">
        {phase === Phase.Showcase && (
          <AbsoluteFill style={{ zIndex: 10 }}>
            <ShowcasePhase frame={frame} />
            <ResultsCountdown frame={frame} />
          </AbsoluteFill>
        )}
      </Sequence>

      <Sequence name="Shuffle" from={PHASE_BOUNDARIES.shuffleStart} durationInFrames={PHASE_BOUNDARIES.shuffleEnd - PHASE_BOUNDARIES.shuffleStart + 1} layout="none">
        {phase === Phase.Shuffle && (
          <AbsoluteFill style={{ zIndex: 10 }}>
            <ShufflePhase frame={frame} />
            <ResultsCountdown frame={frame} />
          </AbsoluteFill>
        )}
      </Sequence>

      <Sequence name="Reveal (6th → 1st + Podium)" from={PHASE_BOUNDARIES.revealStart} durationInFrames={PHASE_BOUNDARIES.revealEnd - PHASE_BOUNDARIES.revealStart + 1} layout="none">
        {phase === Phase.Reveal && (
          <AbsoluteFill style={{ zIndex: 10 }}>
            <RevealPhase frame={frame} />
          </AbsoluteFill>
        )}
      </Sequence>

      <Sequence name="Thank You + Fade" from={PHASE_BOUNDARIES.thankYouStart} durationInFrames={PHASE_BOUNDARIES.thankYouEnd - PHASE_BOUNDARIES.thankYouStart + 1} layout="none">
        {phase === Phase.ThankYou && (
          <AbsoluteFill style={{ zIndex: 10 }}>
            <ThankYouPhase frame={frame} />
          </AbsoluteFill>
        )}
      </Sequence>

      <AudioBadge muted={false} />
    </AbsoluteFill>
  );
}


// ── Standalone Sequences for Remotion Studio ──

export const ClosingShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: "#0c0820" }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <ShowcasePhase frame={frame} />
      <ResultsCountdown frame={frame} />
    </AbsoluteFill>
  );
};

export const ClosingReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const offsetFrame = frame + 3700;
  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: "#0c0820" }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <RevealPhase frame={offsetFrame} />
    </AbsoluteFill>
  );
};

export const ClosingFinalStandings: React.FC = () => {
  const frame = useCurrentFrame();
  const offsetFrame = frame + FULL_PODIUM_FRAME;
  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: "#0c0820" }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <RevealPhase frame={offsetFrame} />
    </AbsoluteFill>
  );
};

export const ClosingTeamPodium: React.FC = () => {
  const frame = useCurrentFrame();
  const offsetFrame = frame + TEAM_PODIUM_FRAME;
  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: "#0c0820" }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <TeamPodiumReveal frame={offsetFrame} />
    </AbsoluteFill>
  );
};

export const ClosingThankYou: React.FC = () => {
  const frame = useCurrentFrame();
  const offsetFrame = frame + 12700;
  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: "#0c0820" }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <ThankYouPhase frame={offsetFrame} />
    </AbsoluteFill>
  );
};
