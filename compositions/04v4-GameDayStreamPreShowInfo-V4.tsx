/**
 * 04v4 – GameDayPreShowInfoV4 (Muted)
 *
 * 30-minute cinematic pre-show loop - V4 improvements over V3:
 *   • SVG icon library (no emojis in UI chrome)
 *   • UG logos from Notion LOGO_MAP (full-size in spotlight)
 *   • Arnaud & Loïc introduced as GameDay Instructors
 *   • Linda's correct title: AWS Community Hero
 *   • StreamHostCard-style Linda slide (photo + UG Vienna logo)
 *   • OrganizerSection-style Anda & Jerome slide (GlassCard, UG logos)
 *   • 4 new community education slides:
 *       – What is an AWS User Group Leader?
 *       – What is an AWS Community Builder?
 *       – What is an AWS Community Hero?
 *       – What are AWS Cloud Clubs?
 */
import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import {
  BackgroundLayer,
  HexGridOverlay,
  AudioBadge,
  GlassCard,
  GD_DARK,
  GD_PURPLE,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_ORANGE,
  GD_GOLD,
  calculateCountdown,
  formatTime,
  STREAM_START,
  GAME_START,
  TYPOGRAPHY,
  springConfig,
} from "../shared/GameDayDesignSystem";
import { USER_GROUPS } from "../shared/userGroups";
import { ORGANIZERS, AWS_SUPPORTERS } from "../shared/organizers";
import { LOGO_MAP } from "../archive/CommunityGamedayEuropeV4";

// ─── Asset paths ──────────────────────────────────────────────────────────────
const COMMUNITY_LOGO = staticFile(
  "AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png"
);
const GAMEDAY_LOGO = staticFile(
  "AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric with text.png"
);
const EUROPE_MAP = staticFile("AWSCommunityGameDayEurope/europe-map.png");

// ─── Timing constants ─────────────────────────────────────────────────────────
const F = "'Amazon Ember', 'Inter', sans-serif";
const S = 900;  // 30 s - content slides
const U = 330;  // 11 s - UG spotlight
const T = 20;   // transition overlap frames

// ─── Global frame context (TransitionSeries resets useCurrentFrame per sequence) ─
const GlobalFrameCtx = createContext(0);

// ─── Deterministic UG shuffle ─────────────────────────────────────────────────
const SHUFFLED = [...USER_GROUPS].sort((a, b) => {
  const h = (s: string) => s.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return h(a.name) - h(b.name);
});

// ─── Logo lookup (handles UG / User Group name variations) ────────────────────
function findLogo(name: string): string | null {
  if (LOGO_MAP[name]) return LOGO_MAP[name];
  for (const key of Object.keys(LOGO_MAP)) {
    const normName = name
      .replace("AWS UG ", "AWS User Group ")
      .replace(/\s*–\s*/g, " – ");
    const normKey = key
      .replace("AWS User Group ", "AWS UG ")
      .replace(/\s*-\s*/g, " – ");
    if (key.includes(normName) || normKey.includes(name)) return LOGO_MAP[key];
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SVG ICON LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════
type IconProps = { size?: number; color?: string; style?: React.CSSProperties };

const Icon: React.FC<{ size: number; color: string; children: React.ReactNode }> = ({ size, color, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill={color} stroke="none" opacity={0.8} />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </Icon>
);

export const UsersIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

export const GlobeIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Icon>
);

export const StarIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={color} stroke="none" />
  </Icon>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} stroke="none" opacity={0.85} />
  </Icon>
);

export const CloudIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill={color} stroke="none" opacity={0.8} />
  </Icon>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

export const GamepadIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth={3} />
    <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth={3} />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z" />
  </Icon>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);

export const VolumeIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} stroke="none" opacity={0.8} />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </Icon>
);

export const TrophyIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <polyline points="8 21 12 17 16 21" />
    <line x1="12" y1="17" x2="12" y2="11" />
    <path d="M7 4H4a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6 6 6 0 0 0 6-6V6a2 2 0 0 0-2-2h-3" />
    <path d="M17 4h3a2 2 0 0 1 2 2v2a6 6 0 0 1-6 6" />
    <rect x="7" y="2" width="10" height="5" rx="1" />
  </Icon>
);

export const AwardIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </Icon>
);

export const RocketIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill={color} stroke="none" opacity={0.7} />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" fill={color} stroke="none" opacity={0.5} />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" fill={color} stroke="none" opacity={0.5} />
  </Icon>
);

export const BookOpenIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </Icon>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} stroke="none" />
  </Icon>
);

export const CodeIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </Icon>
);

export const GraduationIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </Icon>
);

export const LocationIcon: React.FC<IconProps> = ({ size = 12, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill={color} stroke="none" opacity={0.7} />
    <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
  </Icon>
);

export const BroadcastIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </Icon>
);

export const VolumeMuteIcon: React.FC<IconProps> = ({ size = 20, color = "currentColor" }) => (
  <Icon size={size} color={color}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} stroke="none" opacity={0.8} />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </Icon>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function useEntry(startFrame = 0, cfg = springConfig.entry) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - startFrame, fps, config: cfg });
}

function useStagger(i: number, gap = 8) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - i * gap, fps, config: springConfig.entry });
}

function usePulse(period = 60) {
  const frame = useCurrentFrame();
  return interpolate(frame % period, [0, period / 2, period], [0.96, 1, 0.96], { extrapolateRight: "clamp" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENT TOP BAR
// ═══════════════════════════════════════════════════════════════════════════════
const TopBar: React.FC = () => {
  const frame = useContext(GlobalFrameCtx);
  const { fps } = useVideoConfig();
  const sc = calculateCountdown(frame, 0, STREAM_START, fps);
  const gc = calculateCountdown(frame, 0, GAME_START, fps);
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 72, zIndex: 10, background: `linear-gradient(180deg, ${GD_DARK}f2, ${GD_DARK}bb)`, borderBottom: `1px solid ${GD_PURPLE}44`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px", fontFamily: F }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={COMMUNITY_LOGO} style={{ height: 38 }} />
        <div style={{ width: 1, height: 32, background: `${GD_PURPLE}55` }} />
        <Img src={GAMEDAY_LOGO} style={{ height: 46 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: TYPOGRAPHY.labelSmall, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 3, background: `${GD_PURPLE}22`, border: `1px solid ${GD_PURPLE}55`, borderRadius: 8, padding: "5px 14px" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f87171" }} />
        Pre-Show Loop
      </div>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: TYPOGRAPHY.overline, color: GD_PINK, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
            <BroadcastIcon size={11} color={GD_PINK} /> Stream In
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: GD_PINK, fontFamily: "monospace" }}>{formatTime(sc)}</div>
        </div>
        <div style={{ width: 1, height: 36, background: `${GD_PURPLE}44` }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: TYPOGRAPHY.overline, color: GD_GOLD, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
            <GamepadIcon size={11} color={GD_GOLD} /> Game In
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: GD_GOLD, fontFamily: "monospace" }}>{formatTime(gc)}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Slide wrapper ─────────────────────────────────────────────────────────────
const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ fontFamily: F, background: GD_DARK }}>
    <BackgroundLayer darken={0.72} />
    <HexGridOverlay />
    <AudioBadge muted />
    <TopBar />
    <div style={{ position: "absolute", top: 72, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
      {children}
    </div>
  </AbsoluteFill>
);

// ─── Section label ─────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ icon: React.ReactNode; text: string; color?: string }> = ({ icon, text, color = GD_ACCENT }) => {
  const o = useEntry(0);
  return (
    <div style={{ opacity: o, transform: `translateY(${interpolate(o, [0, 1], [14, 0])}px)`, fontSize: TYPOGRAPHY.body, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 3, marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
      {icon}{text}
    </div>
  );
};

// ─── Info card ─────────────────────────────────────────────────────────────────
const InfoCard: React.FC<{ icon: React.ReactNode; title: string; body: string; accent: string; delay?: number }> = ({ icon, title, body, accent, delay = 0 }) => {
  const o = useStagger(delay);
  return (
    <div style={{ opacity: o, transform: `translateY(${interpolate(o, [0, 1], [18, 0])}px)`, background: "rgba(255,255,255,0.04)", border: `1px solid ${accent}28`, borderLeft: `3px solid ${accent}`, borderRadius: 16, padding: "22px 22px", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>{icon}<div style={{ fontSize: TYPOGRAPHY.h6, fontWeight: 700, color: "white" }}>{title}</div></div>
      <div style={{ fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{body}</div>
    </div>
  );
};

// ─── Person card (photo + name + role + points) ─────────────────────────────
const PersonCard: React.FC<{ face: string; name: string; role: string; sub: string; flag: string; accent: string; ugLogo?: string | null; delay?: number }> = ({ face, name, role, sub, flag, accent, ugLogo, delay = 0 }) => {
  const o = useStagger(delay);
  return (
    <div style={{ flex: 1, opacity: o, transform: `translateY(${interpolate(o, [0, 1], [22, 0])}px)`, background: "rgba(255,255,255,0.04)", border: `1px solid ${accent}28`, borderRadius: 20, padding: "26px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 148, height: 148, borderRadius: "50%", overflow: "hidden", border: `3px solid ${accent}55`, boxShadow: `0 0 32px ${accent}28`, marginBottom: 14 }}>
        <Img src={staticFile(face)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ fontSize: TYPOGRAPHY.h4, fontWeight: 900, color: "white" }}>{name}</div>
      <div style={{ fontSize: TYPOGRAPHY.caption, color: accent, marginTop: 4, fontWeight: 600 }}>{role}</div>
      <div style={{ fontSize: TYPOGRAPHY.labelSmall, color: "rgba(255,255,255,0.45)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
        <LocationIcon size={12} color={GD_ACCENT} /> {flag} {sub}
      </div>
      {ugLogo && (
        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", width: "100%" }}>
          <Img src={ugLogo} style={{ maxWidth: 130, maxHeight: 52, objectFit: "contain" }} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 - Hero V3
// ═══════════════════════════════════════════════════════════════════════════════
const SlideHero: React.FC = () => {
  const frame = useContext(GlobalFrameCtx);
  const { fps } = useVideoConfig();
  const gc = calculateCountdown(frame, 0, GAME_START, fps);
  const m = String(Math.floor(gc / 60)).padStart(2, "0");
  const s = String(gc % 60).padStart(2, "0");
  const pulse = usePulse(60);
  const logoE = useStagger(0, 1);
  const titleE = useStagger(4, 8);
  const timerE = useStagger(8, 8);
  const statsE = useStagger(12, 8);

  const stats = [
    { v: "57", l: "User Groups", c: GD_GOLD },
    { v: "20+", l: "Countries", c: GD_PINK },
    { v: "4+", l: "Timezones", c: GD_VIOLET },
    { v: "1st", l: "Edition", c: GD_ORANGE },
  ];

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: logoE, transform: `scale(${interpolate(logoE, [0, 1], [0.88, 1])})`, display: "flex", alignItems: "center", gap: 28, marginBottom: 24 }}>
        <Img src={COMMUNITY_LOGO} style={{ height: 86 }} />
        <div style={{ width: 1, height: 56, background: `linear-gradient(180deg, transparent, ${GD_VIOLET}, transparent)` }} />
        <Img src={GAMEDAY_LOGO} style={{ height: 118 }} />
      </div>
      <div style={{ opacity: titleE, transform: `translateY(${interpolate(titleE, [0, 1], [24, 0])}px)`, textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: TYPOGRAPHY.captionSmall, fontWeight: 700, color: GD_ACCENT, letterSpacing: 5, textTransform: "uppercase", marginBottom: 8 }}>The First-Ever</div>
        <div style={{ fontSize: TYPOGRAPHY.h2, fontWeight: 900, letterSpacing: -1, lineHeight: 1.05, background: `linear-gradient(135deg, #fff 0%, ${GD_ACCENT} 45%, ${GD_PINK} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AWS Community GameDay Europe</div>
        <div style={{ fontSize: TYPOGRAPHY.body, color: "rgba(255,255,255,0.45)", marginTop: 8, letterSpacing: 2 }}>Tuesday, March 17 2026 · Starting 18:00 CET</div>
      </div>
      <div style={{ opacity: timerE, transform: `scale(${interpolate(timerE, [0, 1], [0.9, 1])})`, textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: TYPOGRAPHY.label, fontWeight: 700, color: GD_GOLD, textTransform: "uppercase", letterSpacing: 4, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <GamepadIcon size={14} color={GD_GOLD} /> Game Starts In
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", justifyContent: "center" }}>
          {[{ v: m, u: "MIN" }, { v: s, u: "SEC" }].map(({ v, u }, idx) => (
            <React.Fragment key={u}>
              {idx > 0 && <div style={{ fontSize: 52, color: GD_GOLD, opacity: 0.5, paddingBottom: 14, fontWeight: 300 }}>:</div>}
              <div style={{ background: `linear-gradient(180deg, ${GD_PURPLE}44, ${GD_DARK}cc)`, border: `1px solid ${GD_VIOLET}33`, borderRadius: 16, padding: "14px 28px", textAlign: "center", minWidth: 110, transform: `scale(${pulse})` }}>
                <div style={{ fontSize: TYPOGRAPHY.timer, fontWeight: 800, color: GD_GOLD, lineHeight: 1, fontFamily: "monospace", textShadow: `0 0 20px ${GD_ORANGE}55` }}>{v}</div>
                <div style={{ fontSize: TYPOGRAPHY.labelSmall, color: GD_ACCENT, marginTop: 4, letterSpacing: 2 }}>{u}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ opacity: statsE, transform: `translateY(${interpolate(statsE, [0, 1], [20, 0])}px)`, display: "flex", gap: 18 }}>
        {stats.map((st) => (
          <div key={st.l} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${st.c}22`, borderRadius: 14, padding: "14px 22px", textAlign: "center" }}>
            <div style={{ fontSize: TYPOGRAPHY.h3, fontWeight: 900, color: st.c, lineHeight: 1 }}>{st.v}</div>
            <div style={{ fontSize: TYPOGRAPHY.labelSmall, color: GD_ACCENT, marginTop: 6, textTransform: "uppercase", letterSpacing: 2 }}>{st.l}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 - What's Happening
// ═══════════════════════════════════════════════════════════════════════════════
const SlideWhatsHappening: React.FC = () => {
  const cards = [
    { icon: <BroadcastIcon size={28} color={GD_VIOLET} />, title: "One Stream, 57 Cities", body: "Right now, AWS User Groups all over Europe are watching this exact stream at their local venue. You are part of the first-ever pan-European AWS Community GameDay.", c: GD_VIOLET },
    { icon: <VolumeMuteIcon size={28} color={GD_PINK} />, title: "Why Is It Muted Right Now?", body: "This is the 30-minute pre-show loop that plays before the live stream begins at 18:00 CET. Use this time to test your audio - you'll need it soon!", c: GD_PINK },
    { icon: <GamepadIcon size={28} color={GD_GOLD} />, title: "The Competition", body: "At 18:30 CET all 57 groups start a 2-hour AWS challenge simultaneously. Stream goes mute during gameplay. Your local UG leader gives your team access codes.", c: GD_GOLD },
    { icon: <TrophyIcon size={28} color={GD_ORANGE} />, title: "Stay for the Closing!", body: "At 20:30 CET the stream returns live. Winners are revealed globally, together. Don't leave - celebrate with 57 cities across Europe all at once.", c: GD_ORANGE },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SectionLabel icon={<BroadcastIcon size={20} color={GD_ACCENT} />} text="What's Happening Right Now" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: "100%", maxWidth: 1060 }}>
        {cards.map((card, i) => (
          <InfoCard key={card.title} icon={card.icon} title={card.title} body={card.body} accent={card.c} delay={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 - Meet Linda Mohamed (StreamHostCard-inspired)
// ═══════════════════════════════════════════════════════════════════════════════
const SlideMeetLinda: React.FC = () => {
  const linda = ORGANIZERS.find((p) => p.name === "Linda")!;
  const ugViennaLogo = LOGO_MAP["AWS User Group Vienna"];
  const cardE = useEntry(0);
  const textE = useStagger(3, 8);
  const p1 = useStagger(5, 8);
  const p2 = useStagger(6, 8);
  const p3 = useStagger(7, 8);
  const p4 = useStagger(8, 8);
  const noteE = useStagger(10, 8);

  const points = [
    { entry: p1, text: "Your host for today's GameDay Europe stream - broadcasting live across ~57 cities" },
    { entry: p2, text: "Leader of AWS User Group Vienna & AWS Women's User Group Vienna" },
    { entry: p3, text: "Chairwoman of Förderverein AWS Community DACH e.V." },
    { entry: p4, text: "Vice Chair of the largest open source foundation in Austria" },
  ];

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 48, width: "100%", maxWidth: 1060 }}>
        {/* Photo + UG logo column */}
        <div style={{ opacity: cardE, transform: `scale(${interpolate(cardE, [0, 1], [0.88, 1])})`, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: 200, height: 200, borderRadius: "50%", overflow: "hidden", border: `3px solid ${GD_VIOLET}66`, boxShadow: `0 0 48px ${GD_VIOLET}33` }}>
            <Img src={staticFile(linda.face)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {ugViennaLogo && (
            <div style={{ width: 230, borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
              <Img src={ugViennaLogo} style={{ width: "100%", aspectRatio: "600/337", objectFit: "cover", display: "block", borderRadius: "14px 14px 0 0" }} />
              <div style={{ padding: "6px 10px 8px", textAlign: "center", fontSize: TYPOGRAPHY.bodySmall, fontWeight: 700, color: GD_ACCENT, letterSpacing: 2, textTransform: "uppercase" as const }}>AWS UG Vienna</div>
            </div>
          )}
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)" }}>
            🇦🇹 Austria
          </div>
        </div>

        {/* Text column */}
        <div style={{ flex: 1 }}>
          <SectionLabel icon={<MicIcon size={20} color={GD_ACCENT} />} text="Your Stream Host" />
          <div style={{ opacity: textE, transform: `translateX(${interpolate(textE, [0, 1], [22, 0])}px)`, marginBottom: 14 }}>
            <div style={{ fontSize: TYPOGRAPHY.h3, fontWeight: 900, color: "white", lineHeight: 1 }}>Linda Mohamed</div>
            <div style={{ fontSize: TYPOGRAPHY.h6, color: GD_ACCENT, marginTop: 8, fontWeight: 600 }}>Stream Host · AWS Community Hero</div>
          </div>
          <GlassCard style={{ padding: "14px 22px", borderLeft: `4px solid ${GD_VIOLET}` }}>
            {points.map(({ entry, text }, i) => (
              <div key={i} style={{ opacity: entry, transform: `translateX(${interpolate(entry, [0, 1], [16, 0])}px)`, display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < points.length - 1 ? 8 : 0, fontSize: TYPOGRAPHY.bodySmall, color: "rgba(255,255,255,0.85)", lineHeight: 1.4 }}>
                <CheckCircleIcon size={16} color={GD_VIOLET} />
                <span>{text}</span>
              </div>
            ))}
          </GlassCard>
          <div style={{ opacity: noteE, transform: `translateY(${interpolate(noteE, [0, 1], [10, 0])}px)`, marginTop: 10, background: `${GD_PURPLE}22`, border: `1px solid ${GD_PURPLE}44`, borderRadius: 12, padding: "10px 16px", fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
            <strong style={{ color: GD_ACCENT }}>Not sure who this is?</strong> Just like the organizers of all local GameDay events across Europe, Linda is a volunteer who organizes community events in her free time. She is not an AWS employee.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 - Meet Anda & Jerome (OrganizerSection-inspired)
// ═══════════════════════════════════════════════════════════════════════════════
const SlideMeetAndaJerome: React.FC = () => {
  const jerome = ORGANIZERS.find((p) => p.name === "Jerome")!;
  const anda = ORGANIZERS.find((p) => p.name === "Anda")!;
  const headingE = useEntry(0);
  const cardE = useStagger(2, 8);
  const noteE = useStagger(8, 8);

  const people = [
    { person: anda, c: GD_PINK, logo: findLogo("AWS User Group Geneva") ?? findLogo("AWS Swiss User Group-Geneva"), desc: "AWS Community Builder and initiator of this GameDay. Anda had the original vision for a pan-European AWS community event and brought together volunteer organizers from ~57 User Groups across the continent." },
    { person: jerome, c: GD_VIOLET, logo: findLogo("AWS User Group Belgium"), desc: "AWS User Group Belgium leader and co-founder of this initiative. Jerome co-architected the event structure, competition framework, and built the network of ~57 User Groups across 20+ countries." },
  ];

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: headingE, transform: `translateY(${interpolate(headingE, [0, 1], [16, 0])}px)`, textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: TYPOGRAPHY.label, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 4, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <UsersIcon size={14} color={GD_ACCENT} /> The People Behind This Event
        </div>
        <div style={{ fontSize: TYPOGRAPHY.h4, fontWeight: 900, color: "white" }}>Meet Anda &amp; Jerome</div>
      </div>

      <div style={{ display: "flex", gap: 24, width: "100%", maxWidth: 1060, marginBottom: 16 }}>
        {people.map(({ person, c, logo, desc }) => (
          <div key={person.name} style={{ flex: 1, opacity: cardE, transform: `translateY(${interpolate(cardE, [0, 1], [22, 0])}px)` }}>
            <GlassCard style={{ padding: "22px 24px", borderLeft: `4px solid ${c}`, height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                <Img src={staticFile(person.face)} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", flexShrink: 0, boxShadow: `0 0 20px ${c}44` }} />
                <div>
                  <div style={{ fontSize: TYPOGRAPHY.h5, fontWeight: 900, color: "white" }}>{person.flag} {person.name}</div>
                  <div style={{ fontSize: TYPOGRAPHY.caption, color: c, marginTop: 3, fontWeight: 600 }}>{person.role}</div>
                  <div style={{ fontSize: TYPOGRAPHY.labelSmall, color: "rgba(255,255,255,0.4)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <LocationIcon size={11} color={GD_ACCENT} /> {person.country}
                  </div>
                </div>
                {logo && <Img src={logo} style={{ marginLeft: "auto", maxWidth: 70, maxHeight: 40, objectFit: "contain", opacity: 0.85 }} />}
              </div>
              <div style={{ fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{desc}</div>
            </GlassCard>
          </div>
        ))}
      </div>

      <div style={{ opacity: noteE, transform: `translateY(${interpolate(noteE, [0, 1], [12, 0])}px)`, width: "100%", maxWidth: 1060, background: `${GD_PURPLE}22`, border: `1px solid ${GD_PURPLE}44`, borderRadius: 14, padding: "12px 24px", fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.6 }}>
        <HeartIcon size={14} color={GD_ACCENT} style={{ display: "inline", marginRight: 6 }} />
        <strong style={{ color: GD_ACCENT }}>None of this is their job.</strong> Anda and Jerome are User Group leaders who organize events and build things for the AWS community in their free time, just like so many others. They will share the story behind this GameDay live on stream in a quick introduction.
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 - Meet the GameDay Instructors (Arnaud & Loïc)
// ═══════════════════════════════════════════════════════════════════════════════
const SlideMeetGamemasters: React.FC = () => {
  const arnaud = AWS_SUPPORTERS.find((p) => p.name === "Arnaud")!;
  const loic = AWS_SUPPORTERS.find((p) => p.name === "Loïc")!;
  const headingE = useEntry(0);
  const cardE = useStagger(2, 8);
  const noteE = useStagger(8, 8);

  const people = [
    { person: arnaud, c: GD_ORANGE, desc: "Developer Advocate at AWS. Arnaud will deliver the official GameDay instructions at 18:14 CET and guide all 57 teams through the competition format, rules, and scoring system." },
    { person: loic, c: GD_GOLD, desc: "Sr. Technical Account Manager at AWS. Loïc co-delivers the GameDay instructions and is available as a gamemaster throughout the competition to help with any technical questions." },
  ];

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: headingE, transform: `translateY(${interpolate(headingE, [0, 1], [16, 0])}px)`, textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: TYPOGRAPHY.label, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 4, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <GamepadIcon size={14} color={GD_ACCENT} /> GameDay Instructors
        </div>
        <div style={{ fontSize: TYPOGRAPHY.h4, fontWeight: 900, color: "white" }}>Meet Arnaud &amp; Loïc</div>
        <div style={{ fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>AWS Gamemasters - delivering instructions live at 18:14 CET</div>
      </div>

      <div style={{ display: "flex", gap: 24, width: "100%", maxWidth: 1060, marginBottom: 20 }}>
        {people.map(({ person, c, desc }) => (
          <div key={person.name} style={{ flex: 1, opacity: cardE, transform: `translateY(${interpolate(cardE, [0, 1], [22, 0])}px)` }}>
            <GlassCard style={{ padding: "24px 26px", borderLeft: `4px solid ${c}`, height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <Img src={staticFile(person.face)} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", flexShrink: 0, boxShadow: `0 0 20px ${c}44` }} />
                <div>
                  <div style={{ fontSize: TYPOGRAPHY.h5, fontWeight: 900, color: "white" }}>{person.flag} {person.name}</div>
                  <div style={{ fontSize: TYPOGRAPHY.caption, color: c, marginTop: 3, fontWeight: 600 }}>{person.role}</div>
                  <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5, background: `${GD_ORANGE}22`, border: `1px solid ${GD_ORANGE}44`, borderRadius: 6, padding: "3px 10px" }}>
                    <GamepadIcon size={11} color={GD_ORANGE} />
                    <span style={{ fontSize: TYPOGRAPHY.overline, color: GD_ORANGE, fontWeight: 700, letterSpacing: 1 }}>AWS GAMEMASTER</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: TYPOGRAPHY.bodySmall, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>{desc}</div>
            </GlassCard>
          </div>
        ))}
      </div>

      <div style={{ opacity: noteE, transform: `translateY(${interpolate(noteE, [0, 1], [12, 0])}px)`, width: "100%", maxWidth: 1060 }}>
        <GlassCard style={{ padding: "14px 24px" }}>
          <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
            {[
              { time: "18:13 CET", label: "Linda introduces the gamemasters", icon: <MicIcon size={14} color={GD_ACCENT} /> },
              { time: "18:14 CET", label: "Arnaud & Loïc deliver GameDay instructions", icon: <GamepadIcon size={14} color={GD_GOLD} /> },
              { time: "18:25 CET", label: "Team codes distributed at your venue", icon: <CheckCircleIcon size={14} color="#4ade80" /> },
            ].map((item) => (
              <div key={item.time} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.7)" }}>
                {item.icon}
                <strong style={{ color: "white", fontFamily: "monospace" }}>{item.time}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 - What is the AWS Community?
// ═══════════════════════════════════════════════════════════════════════════════
const SlideAWSCommunity: React.FC = () => {
  const cards = [
    { icon: <HeartIcon size={32} color={GD_VIOLET} />, title: "Volunteers, not employees", body: "The AWS Community is made up of developers, architects, and cloud enthusiasts who are NOT employed by Amazon. They organize events and share knowledge purely out of passion." },
    { icon: <UsersIcon size={32} color={GD_PINK} />, title: "Local User Groups", body: "AWS User Groups are local communities in cities around the world. They hold regular meetups, workshops, and technical talks - driven entirely by volunteer leaders." },
    { icon: <GlobeIcon size={32} color={GD_GOLD} />, title: "57 Groups Here Today", body: "Every group competing today is run by a volunteer leader. This event is the first time all these groups have ever competed together in a single event at the same time." },
  ];
  const quoteE = useStagger(4, 8);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SectionLabel icon={<CloudIcon size={20} color={GD_ACCENT} />} text="About the AWS Community" />
      <div style={{ display: "flex", gap: 18, width: "100%", maxWidth: 1060, marginBottom: 18 }}>
        {cards.map((c, i) => <InfoCard key={c.title} icon={c.icon} title={c.title} body={c.body} accent={[GD_VIOLET, GD_PINK, GD_GOLD][i]} delay={i} />)}
      </div>
      <div style={{ opacity: quoteE, transform: `translateY(${interpolate(quoteE, [0, 1], [12, 0])}px)`, width: "100%", maxWidth: 1060, background: `linear-gradient(90deg, ${GD_PURPLE}28, ${GD_VIOLET}18)`, border: `1px solid ${GD_VIOLET}33`, borderLeft: `4px solid ${GD_GOLD}`, borderRadius: 14, padding: "16px 24px", fontSize: TYPOGRAPHY.bodySmall, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
        <StarIcon size={14} color={GD_GOLD} /> <strong style={{ color: GD_GOLD }}> A big thank-you</strong> to every User Group leader who organized a local venue and invited people today. This event exists because of community volunteers like you.
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 - What is an AWS User Group Leader?
// ═══════════════════════════════════════════════════════════════════════════════
const SlideUGLeader: React.FC = () => {
  const points = [
    { icon: <CalendarIcon size={22} color={GD_VIOLET} />, title: "They organize", body: "UG leaders plan and run local meetups - finding venues, speakers, and sponsors. Everything is done voluntarily in their personal time." },
    { icon: <BookOpenIcon size={22} color={GD_PINK} />, title: "They educate", body: "Leaders share knowledge about AWS services, cloud architecture, DevOps, AI/ML and more with their local tech community." },
    { icon: <UsersIcon size={22} color={GD_GOLD} />, title: "They connect", body: "They build local networks of cloud professionals, creating opportunities for mentorship, careers, and collaboration." },
    { icon: <HeartIcon size={22} color={GD_ORANGE} />, title: "They volunteer", body: "No salary, no budget from AWS. UG leaders do this entirely out of passion for the community and love of cloud technology." },
  ];
  const badgeE = useEntry(0);
  const noteE = useStagger(5, 8);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 12 }}>
        <div style={{ opacity: badgeE, transform: `scale(${interpolate(badgeE, [0, 1], [0.85, 1])})` }}>
          <Img src={staticFile("AWSCommunityGameDayEurope/Usergroups-badges_leader-dark.png")} style={{ width: 112, height: "auto", objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: TYPOGRAPHY.body, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase" as const, letterSpacing: 3, display: "flex", alignItems: "center", gap: 10 }}>
          <UsersIcon size={20} color={GD_ACCENT} />What is an AWS User Group Leader?
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: "100%", maxWidth: 1060, marginBottom: 18 }}>
        {points.map((p, i) => <InfoCard key={p.title} icon={p.icon} title={p.title} body={p.body} accent={[GD_VIOLET, GD_PINK, GD_GOLD, GD_ORANGE][i]} delay={i} />)}
      </div>
      <div style={{ opacity: noteE, transform: `translateY(${interpolate(noteE, [0, 1], [12, 0])}px)`, width: "100%", maxWidth: 1060, background: `${GD_PURPLE}22`, border: `1px solid ${GD_PURPLE}44`, borderRadius: 14, padding: "14px 24px", fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, textAlign: "center" }}>
        <strong style={{ color: GD_ACCENT }}>The person who organized today's event in your city</strong> is an AWS User Group leader - a volunteer who did all of this in their free time, just to bring the community together.
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 - What is an AWS Community Builder?
// ═══════════════════════════════════════════════════════════════════════════════
const SlideCommunityBuilder: React.FC = () => {
  const badgeE = useEntry(0);
  const noteE = useStagger(5, 8);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 8 }}>
        <div style={{ opacity: badgeE, transform: `scale(${interpolate(badgeE, [0, 1], [0.85, 1])})` }}>
          <Img src={staticFile("AWSCommunityGameDayEurope/aws-community-builder-logo.png")} style={{ width: 140, height: "auto", objectFit: "contain" }} />
        </div>
        <SectionLabel icon={<RocketIcon size={20} color={GD_ACCENT} />} text="What is an AWS Community Builder?" />
      </div>
      <div style={{ display: "flex", gap: 18, width: "100%", maxWidth: 1060, marginBottom: 18 }}>
        <InfoCard icon={<RocketIcon size={32} color={GD_VIOLET} />} title="A recognition program" body="AWS Community Builders is an official AWS program that recognizes passionate community members who actively share knowledge, create technical content, and support others in the AWS ecosystem." accent={GD_VIOLET} delay={0} />
        <InfoCard icon={<BookOpenIcon size={32} color={GD_PINK} />} title="Content creators & educators" body="Builders write blog posts, record videos, give conference talks, create open-source tools, and answer community questions. They help others learn AWS through genuine, community-driven content." accent={GD_PINK} delay={1} />
        <InfoCard icon={<UsersIcon size={32} color={GD_GOLD} />} title="Selected by AWS" body="Builders are selected by AWS based on their community contributions. They receive AWS credits, service previews, and direct access to product teams - but are NOT AWS employees." accent={GD_GOLD} delay={2} />
      </div>
      <div style={{ opacity: noteE, transform: `translateY(${interpolate(noteE, [0, 1], [12, 0])}px)`, width: "100%", maxWidth: 1060 }}>
        <GlassCard style={{ padding: "16px 24px", borderLeft: `4px solid ${GD_VIOLET}` }}>
          <div style={{ fontSize: TYPOGRAPHY.bodySmall, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>
            <strong style={{ color: GD_ACCENT }}>Example:</strong> Several of today's organizers are AWS Community Builders. They applied to the program, were selected by AWS, and now contribute knowledge back to the global AWS community - all in their spare time.
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 - What is an AWS Community Hero?
// ═══════════════════════════════════════════════════════════════════════════════
const SlideCommunityHero: React.FC = () => {
  const heroE = useStagger(0, 1);
  const textE = useStagger(3, 8);
  const p1 = useStagger(5, 8);
  const p2 = useStagger(6, 8);
  const p3 = useStagger(7, 8);
  const noteE = useStagger(9, 8);

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SectionLabel icon={<ShieldIcon size={20} color={GD_GOLD} />} text="What is an AWS Hero?" color={GD_GOLD} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 48, width: "100%", maxWidth: 1060 }}>
        {/* Hero program logo */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, minHeight: 280 }}>
          <div style={{ opacity: heroE, transform: `scale(${interpolate(heroE, [0, 1], [0.85, 1])})` }}>
            <Img src={staticFile("AWSCommunityGameDayEurope/hero-white.png")} style={{ width: 220, height: "auto", objectFit: "contain" }} />
          </div>
        </div>

        {/* Explanation */}
        <div style={{ flex: 1 }}>
          <div style={{ opacity: textE, transform: `translateX(${interpolate(textE, [0, 1], [22, 0])}px)`, marginBottom: 20 }}>
            <div style={{ fontSize: TYPOGRAPHY.h4, fontWeight: 900, color: "white", lineHeight: 1 }}>AWS Heroes</div>
            <div style={{ fontSize: TYPOGRAPHY.bodySmall, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>A worldwide recognition program for passionate AWS advocates and technical leaders</div>
          </div>
          <GlassCard style={{ padding: "20px 24px", borderLeft: `4px solid ${GD_GOLD}` }}>
            {[
              { entry: p1, icon: <StarIcon size={16} color={GD_GOLD} />, text: "AWS Heroes are recognized for their real-world expertise, knowledge sharing, and impact on the broader AWS community" },
              { entry: p2, icon: <UsersIcon size={16} color={GD_GOLD} />, text: "They educate, inspire, and support others through talks, blog posts, open-source projects, and community leadership" },
              { entry: p3, icon: <ShieldIcon size={16} color={GD_GOLD} />, text: "Hero categories include Community, Data, Machine Learning, Serverless, DevTools, Container, Security, and more" },
            ].map(({ entry, icon, text }, i) => (
              <div key={i} style={{ opacity: entry, transform: `translateX(${interpolate(entry, [0, 1], [14, 0])}px)`, display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 2 ? 12 : 0, fontSize: TYPOGRAPHY.bodySmall, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                {icon}<span>{text}</span>
              </div>
            ))}
          </GlassCard>
          <div style={{ opacity: noteE, marginTop: 14, background: `${GD_GOLD}12`, border: `1px solid ${GD_GOLD}30`, borderRadius: 12, padding: "12px 18px", fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
            AWS Heroes are <strong style={{ color: GD_ACCENT }}>NOT AWS employees</strong>. They are independent community members selected by AWS for their outstanding contributions.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 - What are AWS Cloud Clubs?
// ═══════════════════════════════════════════════════════════════════════════════
const SlideCloudClubs: React.FC = () => {
  const cards = [
    { icon: <GraduationIcon size={32} color={GD_VIOLET} />, title: "Student-focused groups", body: "AWS Cloud Clubs are communities for students and young professionals at universities and colleges. They focus on learning cloud technology early in people's careers." },
    { icon: <BookOpenIcon size={32} color={GD_PINK} />, title: "Hands-on learning", body: "Cloud Clubs run workshops, study sessions, and certification prep. Members get hands-on access to AWS and learn by building real projects together." },
    { icon: <RocketIcon size={32} color={GD_GOLD} />, title: "The next generation", body: "Cloud Clubs are growing rapidly across Europe. They represent the future of the AWS Community - today's students become tomorrow's User Group leaders and Heroes." },
  ];
  const noteE = useStagger(4, 8);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SectionLabel icon={<GraduationIcon size={20} color={GD_ACCENT} />} text="What are AWS Cloud Clubs?" />
      <div style={{ display: "flex", gap: 18, width: "100%", maxWidth: 1060, marginBottom: 18 }}>
        {cards.map((c, i) => <InfoCard key={c.title} icon={c.icon} title={c.title} body={c.body} accent={[GD_VIOLET, GD_PINK, GD_GOLD][i]} delay={i} />)}
      </div>
      <div style={{ opacity: noteE, transform: `translateY(${interpolate(noteE, [0, 1], [12, 0])}px)`, width: "100%", maxWidth: 1060 }}>
        <GlassCard style={{ padding: "16px 24px" }}>
          <div style={{ display: "flex", gap: 36, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { icon: <UsersIcon size={16} color={GD_VIOLET} />, label: "User Groups", sub: "For professionals" },
              { icon: <GraduationIcon size={16} color={GD_PINK} />, label: "Cloud Clubs", sub: "For students" },
              { icon: <RocketIcon size={16} color={GD_GOLD} />, label: "Community Builders", sub: "For content creators" },
              { icon: <ShieldIcon size={16} color={GD_ORANGE} />, label: "Community Heroes", sub: "For top contributors" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.7)" }}>
                {item.icon}
                <div>
                  <div style={{ color: "white", fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: TYPOGRAPHY.overline, color: "rgba(255,255,255,0.4)" }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 11 - Schedule V3
// ═══════════════════════════════════════════════════════════════════════════════
const SlideSchedule: React.FC = () => {
  const frame = useContext(GlobalFrameCtx);
  const { fps } = useVideoConfig();
  const sc = calculateCountdown(frame, 0, STREAM_START, fps);
  const gc = calculateCountdown(frame, 0, GAME_START, fps);

  const phases = [
    { time: "17:30", label: "Pre-Show Loop", desc: "This muted loop - test your audio now!", c: GD_ACCENT, audio: false, countdown: null },
    { time: "18:00", label: "Live Stream Begins", desc: "Linda · Anda & Jerome · Special guest · Arnaud & Loïc - GameDay instructions", c: GD_PINK, audio: true, countdown: sc },
    { time: "18:30", label: "GameDay Starts!", desc: "2 hours of competitive AWS challenges - stream muted", c: GD_GOLD, audio: false, countdown: gc, hl: true },
    { time: "20:30", label: "Closing Ceremony", desc: "Winners revealed globally - audio returns!", c: GD_ORANGE, audio: true, countdown: null },
  ];

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SectionLabel icon={<CalendarIcon size={20} color={GD_ACCENT} />} text="Today's Schedule (CET)" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 860 }}>
        {phases.map((ph, i) => {
          const o = useStagger(i, 8);
          return (
            <div key={ph.label} style={{ opacity: o, transform: `translateX(${interpolate(o, [0, 1], [26, 0])}px)`, display: "flex", alignItems: "center", gap: 18, padding: "16px 22px", borderRadius: 16, background: ph.hl ? `${GD_GOLD}0a` : "rgba(255,255,255,0.04)", border: `1px solid ${ph.c}${ph.hl ? "33" : "22"}`, borderLeft: `4px solid ${ph.c}` }}>
              <div style={{ flexShrink: 0, textAlign: "center", width: 80 }}>
                <div style={{ fontSize: TYPOGRAPHY.h5, fontWeight: 800, color: ph.c, fontFamily: "monospace", lineHeight: 1 }}>{ph.time}</div>
                <div style={{ fontSize: TYPOGRAPHY.overline, color: ph.audio ? "#4ade80" : "#f87171", marginTop: 4, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                  {ph.audio ? <VolumeIcon size={11} color="#4ade80" /> : <VolumeMuteIcon size={11} color="#f87171" />}
                  {ph.audio ? "Audio" : "Muted"}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: TYPOGRAPHY.h6, fontWeight: 700, color: "white" }}>{ph.label}</div>
                <div style={{ fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{ph.desc}</div>
              </div>
              {ph.countdown != null && <div style={{ flexShrink: 0, fontFamily: "monospace", fontSize: TYPOGRAPHY.h5, fontWeight: 700, color: ph.c, minWidth: 88, textAlign: "right" }}>{formatTime(ph.countdown)}</div>}
            </div>
          );
        })}
      </div>
      {(() => { const o = useStagger(5, 8); return <div style={{ opacity: o, marginTop: 14, fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>All times CET · Broadcast simultaneously to all 57 User Groups across Europe</div>; })()}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 12 - How It Works
// ═══════════════════════════════════════════════════════════════════════════════
const SlideHowItWorks: React.FC = () => {
  const steps = [
    { n: "1", icon: <UsersIcon size={26} color={GD_VIOLET} />, title: "Form your team", body: "Gather your team at your local venue before the stream. Your organizer will tell you the team size." },
    { n: "2", icon: <VolumeIcon size={26} color={GD_PINK} />, title: "Watch the instructions", body: "At 18:00 the live stream explains all rules. Arnaud & Loïc cover everything at 18:14 CET." },
    { n: "3", icon: <CheckCircleIcon size={26} color={GD_GOLD} />, title: "Get your team code", body: "At 18:30 your local UG leader gives your team an AWS access code to enter the challenge." },
    { n: "4", icon: <CodeIcon size={26} color={GD_ORANGE} />, title: "Compete for 2 hours", body: "Complete AWS challenges, earn points, and try to be the best team across all 57 cities." },
    { n: "5", icon: <TrophyIcon size={26} color={GD_ACCENT} />, title: "Watch the closing", body: "At 20:30 the stream returns live. Global winners revealed. Stay and celebrate with everyone!" },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SectionLabel icon={<GamepadIcon size={20} color={GD_ACCENT} />} text="How GameDay Works" />
      <div style={{ display: "flex", gap: 14, width: "100%", maxWidth: 1060 }}>
        {steps.map((step, i) => {
          const o = useStagger(i, 7);
          return (
            <div key={step.n} style={{ flex: 1, opacity: o, transform: `translateY(${interpolate(o, [0, 1], [20, 0])}px)`, background: "rgba(255,255,255,0.04)", border: `1px solid ${GD_VIOLET}28`, borderRadius: 16, padding: "20px 14px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${GD_PURPLE}, ${GD_VIOLET})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: TYPOGRAPHY.captionSmall, fontWeight: 800, color: "white", marginBottom: 10 }}>{step.n}</div>
              <div style={{ marginBottom: 10 }}>{step.icon}</div>
              <div style={{ fontSize: TYPOGRAPHY.bodySmall, fontWeight: 700, color: "white", marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{step.body}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 13 - All Organizers
// ═══════════════════════════════════════════════════════════════════════════════
const SlideAllOrganizers: React.FC = () => (
  <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <SectionLabel icon={<UsersIcon size={20} color={GD_ACCENT} />} text="The Team Behind This Event" />
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 1060, marginBottom: 16 }}>
      {ORGANIZERS.map((p, i) => {
        const o = useStagger(i, 5);
        const logo = findLogo(p.role.replace("AWS ", "AWS User Group ").split(",")[0]) ?? findLogo(p.role);
        return (
          <div key={p.name} style={{ opacity: o, transform: `translateY(${interpolate(o, [0, 1], [14, 0])}px)`, display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${GD_PURPLE}33`, borderRadius: 14, padding: "12px 16px", minWidth: 232 }}>
            <Img src={staticFile(p.face)} style={{ width: 52, height: 52, borderRadius: 26, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: TYPOGRAPHY.bodySmall, fontWeight: 700, color: "white" }}>{p.flag} {p.name}</div>
              <div style={{ fontSize: TYPOGRAPHY.labelSmall, color: GD_ACCENT, marginTop: 2 }}>{p.role}</div>
              <div style={{ fontSize: TYPOGRAPHY.overline, color: "rgba(255,255,255,0.4)" }}>{p.country}</div>
            </div>
            {logo && <Img src={logo} style={{ maxWidth: 44, maxHeight: 28, objectFit: "contain", opacity: 0.7 }} />}
          </div>
        );
      })}
    </div>
    {(() => {
      const o = useStagger(ORGANIZERS.length, 5);
      return <div style={{ opacity: o, fontSize: TYPOGRAPHY.labelSmall, fontWeight: 700, color: GD_ORANGE, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><GamepadIcon size={12} color={GD_ORANGE} /> AWS Support &amp; Gamemasters</div>;
    })()}
    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", maxWidth: 1060 }}>
      {AWS_SUPPORTERS.map((p, i) => {
        const o = useStagger(ORGANIZERS.length + 1 + i, 5);
        return (
          <div key={p.name} style={{ opacity: o, transform: `translateY(${interpolate(o, [0, 1], [12, 0])}px)`, display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${GD_ORANGE}28`, borderRadius: 14, padding: "12px 16px", minWidth: 232 }}>
            <Img src={staticFile(p.face)} style={{ width: 52, height: 52, borderRadius: 26, objectFit: "cover", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: TYPOGRAPHY.bodySmall, fontWeight: 700, color: "white" }}>{p.flag} {p.name}</div>
              <div style={{ fontSize: TYPOGRAPHY.labelSmall, color: GD_ORANGE, marginTop: 2 }}>{p.role}</div>
              <div style={{ fontSize: TYPOGRAPHY.overline, color: "rgba(255,255,255,0.4)" }}>{p.country}</div>
            </div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 14 - Get Ready
// ═══════════════════════════════════════════════════════════════════════════════
const SlideGetReady: React.FC = () => {
  const items = [
    { icon: <UsersIcon size={20} color={GD_VIOLET} />, text: "Form your team locally before the stream starts" },
    { icon: <CalendarIcon size={20} color={GD_PINK} />, text: "Be seated with audio ready 5 minutes before 18:00 CET" },
    { icon: <VolumeIcon size={20} color={GD_GOLD} />, text: "Watch the live stream carefully - the rules are explained live by Arnaud & Loïc" },
    { icon: <CheckCircleIcon size={20} color={GD_ORANGE} />, text: "Your UG leader will distribute team codes at 18:30 CET" },
    { icon: <GamepadIcon size={20} color={GD_ACCENT} />, text: "Gameplay runs for 2 hours - stream is muted during this time" },
    { icon: <TrophyIcon size={20} color={GD_GOLD} />, text: "Stay in the stream - audio returns at 20:30 for the global winners reveal" },
    { icon: <HeartIcon size={20} color={GD_PINK} />, text: "After the ceremony your local UG continues with their own local schedule" },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SectionLabel icon={<CheckCircleIcon size={20} color={GD_ACCENT} />} text="Get Ready - Your Checklist" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 800, width: "100%" }}>
        {items.map((item, i) => {
          const o = useStagger(i, 6);
          return (
            <div key={i} style={{ opacity: o, transform: `translateX(${interpolate(o, [0, 1], [20, 0])}px)`, display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, fontSize: TYPOGRAPHY.body, color: "rgba(255,255,255,0.88)" }}>
              {item.icon}<span style={{ lineHeight: 1.4 }}>{item.text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 15 - Audio Check
// ═══════════════════════════════════════════════════════════════════════════════
const SlideAudioCheck: React.FC = () => {
  const pulse = usePulse(48);
  const o = useEntry(0);
  const items = [
    { icon: <CheckCircleIcon size={20} color="#4ade80" />, text: "Make sure your venue audio is connected to this stream", c: "#4ade80" },
    { icon: <VolumeIcon size={20} color="#4ade80" />, text: "The live stream at 18:00 CET requires audio - test NOW", c: "#4ade80" },
    { icon: <BookOpenIcon size={20} color={GD_GOLD} />, text: "If audio fails, use the backup video link your organizer provided", c: GD_GOLD },
    { icon: <VolumeMuteIcon size={20} color={GD_ACCENT} />, text: "Important: stream is muted again during gameplay (18:30–20:30 CET)", c: GD_ACCENT },
  ];
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div style={{ opacity: o, transform: `scale(${interpolate(o, [0, 1], [0.88, 1])})`, textAlign: "center" }}>
        <div style={{ transform: `scale(${pulse})`, display: "flex", justifyContent: "center" }}>
          <VolumeIcon size={88} color={GD_GOLD} />
        </div>
        <div style={{ fontSize: TYPOGRAPHY.h2, fontWeight: 900, color: GD_GOLD, letterSpacing: -1, marginTop: 12, transform: `scale(${pulse})`, textShadow: `0 0 40px ${GD_ORANGE}66` }}>AUDIO CHECK</div>
        <div style={{ fontSize: TYPOGRAPHY.h5, color: "white", fontWeight: 600, marginTop: 8 }}>Can you hear this stream?</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 680 }}>
        {items.map((item, i) => {
          const io = useStagger(2 + i, 7);
          return (
            <div key={i} style={{ opacity: io, transform: `translateX(${interpolate(io, [0, 1], [14, 0])}px)`, display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12 }}>
              {item.icon}<span style={{ fontSize: TYPOGRAPHY.bodySmall, color: item.c, fontWeight: 500, lineHeight: 1.4 }}>{item.text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 16 - Stats V3
// ═══════════════════════════════════════════════════════════════════════════════
const SlideStats: React.FC = () => {
  const stats = [
    { v: "57", l: "User Groups", sub: "Cities across Europe", c: GD_GOLD },
    { v: "20+", l: "Countries", sub: "From Iceland to Turkey", c: GD_PINK },
    { v: "4+", l: "Timezones", sub: "UTC-1 through UTC+3", c: GD_VIOLET },
    { v: "1st", l: "Edition", sub: "History being made today", c: GD_ORANGE },
  ];
  const mapE = useStagger(5, 8);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SectionLabel icon={<TrophyIcon size={20} color={GD_ACCENT} />} text="Community GameDay Europe - By the Numbers" />
      <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
        {stats.map((s, i) => {
          const o = useStagger(i, 8);
          return (
            <div key={s.l} style={{ opacity: o, transform: `scale(${interpolate(o, [0, 1], [0.82, 1])})`, background: "rgba(255,255,255,0.04)", border: `1px solid ${s.c}28`, borderRadius: 20, padding: "28px 36px", textAlign: "center", minWidth: 190 }}>
              <div style={{ fontSize: TYPOGRAPHY.stat, fontWeight: 900, color: s.c, lineHeight: 1, textShadow: `0 0 30px ${s.c}44` }}>{s.v}</div>
              <div style={{ fontSize: TYPOGRAPHY.h6, fontWeight: 700, color: "white", marginTop: 8 }}>{s.l}</div>
              <div style={{ fontSize: TYPOGRAPHY.caption, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.sub}</div>
            </div>
          );
        })}
      </div>
      <div style={{ opacity: mapE, transform: `translateY(${interpolate(mapE, [0, 1], [18, 0])}px)`, maxWidth: 640 }}>
        <Img src={EUROPE_MAP} style={{ width: "100%", opacity: 0.5, borderRadius: 12, filter: "hue-rotate(230deg) saturate(1.4)" }} />
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 17 - UG Spotlight V3 (with logo)
// ═══════════════════════════════════════════════════════════════════════════════
const SlideUGSpotlight: React.FC<{ index: number }> = ({ index }) => {
  const g = SHUFFLED[index % SHUFFLED.length];
  const logo = findLogo(g.name);
  const flagE = useEntry(0, springConfig.emphasis);
  const nameE = useStagger(4, 8);
  const detailsE = useStagger(6, 8);
  const pulse = usePulse(90);
  const displayNum = (index % USER_GROUPS.length) + 1;

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: flagE, fontSize: TYPOGRAPHY.labelSmall, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 5, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <StarIcon size={12} color={GD_ACCENT} /> Competing Today
      </div>

      {/* Logo or flag */}
      <div style={{ opacity: flagE, transform: `scale(${interpolate(flagE, [0, 1], [0.7, 1]) * pulse})`, marginBottom: 20 }}>
        {logo ? (
          <Img src={logo} style={{ maxWidth: 340, maxHeight: 140, objectFit: "contain", borderRadius: 16 }} />
        ) : (
          <div style={{ fontSize: 130, lineHeight: 1, filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))" }}>{g.flag}</div>
        )}
      </div>

      {/* Flag shown below logo when logo exists */}
      {logo && (
        <div style={{ opacity: nameE, transform: `translateY(${interpolate(nameE, [0, 1], [12, 0])}px)`, fontSize: TYPOGRAPHY.flag, lineHeight: 1, marginBottom: 8 }}>{g.flag}</div>
      )}

      {/* Name */}
      <div style={{ opacity: nameE, transform: `translateY(${interpolate(nameE, [0, 1], [22, 0])}px)`, textAlign: "center", marginBottom: 10 }}>
        <div style={{ fontSize: TYPOGRAPHY.h2, fontWeight: 900, color: "white", lineHeight: 1.05, maxWidth: 900, background: `linear-gradient(135deg, #fff, ${GD_ACCENT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{g.name}</div>
        <div style={{ fontSize: TYPOGRAPHY.h5, color: GD_ACCENT, marginTop: 8, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <LocationIcon size={14} color={GD_ACCENT} /> {g.city}
        </div>
      </div>

      {/* Stats */}
      <div style={{ opacity: detailsE, transform: `translateY(${interpolate(detailsE, [0, 1], [14, 0])}px)`, display: "flex", gap: 14, marginTop: 10 }}>
        {[
          { label: "Group", value: `${displayNum} of ${USER_GROUPS.length}`, c: GD_VIOLET },
          { label: "Country", value: `${g.flag} ${g.city.split(", ")[1]?.trim()}`, c: GD_GOLD },
          { label: "City", value: g.city.split(",")[0]?.trim(), c: "#4ade80" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${stat.c}33`, borderRadius: 12, padding: "9px 18px", textAlign: "center" }}>
            <div style={{ fontSize: TYPOGRAPHY.overline, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 2, marginBottom: 3 }}>{stat.label}</div>
            <div style={{ fontSize: TYPOGRAPHY.bodySmall, fontWeight: 700, color: stat.c }}>{stat.value}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD THE SECTION SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════════
type Section = { key: string; name: string; dur: number; el: React.ReactNode };

// ─── Content slide definitions (single source of truth) ──────────────────────
const CONTENT_SLIDES: { key: string; name: string; el: React.ReactNode }[] = [
  { key: "hero", name: "Hero + Countdown", el: <SlideHero /> },
  { key: "whats-happening", name: "What's Happening?", el: <SlideWhatsHappening /> },
  { key: "meet-linda", name: "Meet Linda Mohamed", el: <SlideMeetLinda /> },
  { key: "meet-anda-jerome", name: "Meet Anda & Jerome", el: <SlideMeetAndaJerome /> },
  { key: "meet-gamemasters", name: "Meet Arnaud & Loïc", el: <SlideMeetGamemasters /> },
  { key: "aws-community", name: "What is the AWS Community?", el: <SlideAWSCommunity /> },
  { key: "ug-leader", name: "What is a UG Leader?", el: <SlideUGLeader /> },
  { key: "community-builder", name: "What is a Community Builder?", el: <SlideCommunityBuilder /> },
  { key: "community-hero", name: "What is a Community Hero?", el: <SlideCommunityHero /> },
  { key: "cloud-clubs", name: "What are Cloud Clubs?", el: <SlideCloudClubs /> },
  { key: "schedule", name: "Today's Schedule", el: <SlideSchedule /> },
  { key: "how-it-works", name: "How GameDay Works", el: <SlideHowItWorks /> },
  { key: "all-organizers", name: "The Full Team", el: <SlideAllOrganizers /> },
  { key: "stats", name: "By the Numbers", el: <SlideStats /> },
  { key: "get-ready", name: "Get Ready", el: <SlideGetReady /> },
  { key: "audio-check", name: "Audio Check", el: <SlideAudioCheck /> },
];

const NUM_CYCLES = 2;

function buildSections(): Section[] {
  const out: Section[] = [];
  let ugIdx = 0;

  const nextUGs = (count: number) => {
    for (let i = 0; i < count; i++) {
      const idx = ugIdx % SHUFFLED.length;
      out.push({ key: `ug-${ugIdx}`, name: `UG: ${SHUFFLED[idx].name}`, dur: U, el: <Wrap><SlideUGSpotlight index={ugIdx} /></Wrap> });
      ugIdx++;
    }
  };

  for (let cycle = 1; cycle <= NUM_CYCLES; cycle++) {
    for (let i = 0; i < CONTENT_SLIDES.length; i++) {
      const s = CONTENT_SLIDES[i];
      out.push({ key: `${s.key}-${cycle}`, name: s.name, dur: S, el: <Wrap>{s.el}</Wrap> });
      // Insert 3 UG spotlights after each content slide (except the last in each cycle)
      if (i < CONTENT_SLIDES.length - 1) nextUGs(3);
    }
  }

  // Final hero bookend
  out.push({ key: "hero-end", name: "Hero (Final)", dur: S, el: <Wrap><SlideHero /></Wrap> });

  return out;
}

// ─── Transitions ──────────────────────────────────────────────────────────────
const TRANSITIONS = [
  () => fade(),
  () => slide({ direction: "from-left" }),
  () => fade(),
  () => slide({ direction: "from-bottom" }),
  () => fade(),
  () => slide({ direction: "from-right" }),
];

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export const GameDayPreShowInfoV4: React.FC = () => {
  const frame = useCurrentFrame();
  const sections = buildSections();
  return (
    <GlobalFrameCtx.Provider value={frame}>
      <TransitionSeries>
        {sections.map((s, i) => {
          const items: React.ReactNode[] = [];
          if (i > 0) {
            items.push(
              <TransitionSeries.Transition key={`t-${s.key}`} presentation={TRANSITIONS[i % TRANSITIONS.length]()} timing={linearTiming({ durationInFrames: T })} />
            );
          }
          items.push(
            <TransitionSeries.Sequence key={s.key} durationInFrames={s.dur} name={s.name}>{s.el}</TransitionSeries.Sequence>
          );
          return items;
        })}
      </TransitionSeries>
    </GlobalFrameCtx.Provider>
  );
};
