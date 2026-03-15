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
  formatTime,
  GD_DARK,
  GD_GOLD,
  GD_PURPLE,
  GD_VIOLET,
  GD_PINK,
  GD_ACCENT,
  GD_ORANGE,
  TYPOGRAPHY,
} from "./shared/GameDayDesignSystem";
import { USER_GROUPS } from "./shared/userGroups";
import { LOGO_MAP } from "./archive/CommunityGamedayEuropeV4";
import { ORGANIZERS, AWS_SUPPORTERS } from "./shared/organizers";

// ── Part A Constants ──
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const PART_A_TOTAL_FRAMES = 3600;

// ── Showcase Sub-Phase Timing ──
const HERO_INTRO_END = 1599;
const FAST_SCROLL_START = 1600;
const FAST_SCROLL_END = 3299;
const FINALE_START = 3300;

// ── Derived Data ──
const COUNTRIES = Array.from(new Set(USER_GROUPS.map((g) => g.flag)));
const UNIQUE_FLAGS = Array.from(new Set(USER_GROUPS.map((g) => g.flag)));

// ── Card Accent Colors ──
const CARD_ACCENTS = [GD_VIOLET, GD_PURPLE, GD_PINK, GD_ACCENT, "#6366f1", GD_VIOLET];

// ── Transition Flash Constants ──
const FLASH_DURATION = 60;
const PHASE_BOUNDARY_FRAMES_A = [0];

// ── SegmentTransitionFlash ──
const SegmentTransitionFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const boundary = PHASE_BOUNDARY_FRAMES_A.find((b) => frame >= b && frame < b + FLASH_DURATION);
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

// ── HeroIntro (frames 0-1599): Multi-scene epic closing ceremony intro ──
// Scene 1 (0-179): "WHAT. A. DAY." dramatic text + GameDay logo
// Scene 2 (180-379): Big stats cascade — 53 groups, 23+ countries, 2 hours
// Scene 3 (380-549): Flag parade — all unique country flags
// Scene 4 (550-1009): Organizer shoutout
// Scene 4b (1010-1399): AWS Supporters
// Scene 5 (1400-1599): "AND NOW... THE RESULTS" dramatic transition

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

  // ── SCENE 4: Community Organizers (frames 520-1009) ──
  const s4Opacity = interpolate(frame, [520, 560, 950, 1009], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const orgTitleSpring = spring({ frame: Math.max(0, frame - 555), fps, config: { damping: 14, stiffness: 120 } });

  // ── SCENE 4b: AWS Supporters (frames 1010-1399) ──
  const s4bOpacity = interpolate(frame, [1010, 1060, 1350, 1399], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const awsTitleSpring = spring({ frame: Math.max(0, frame - 1020), fps, config: { damping: 14, stiffness: 120 } });

  // ── SCENE 5: "AND NOW... THE RESULTS" (frames 1400-1599) ──
  const s5Opacity = interpolate(frame, [1400, 1440, 1550, 1599], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const andNowSpring = spring({ frame: Math.max(0, frame - 1440), fps, config: { damping: 12, stiffness: 100 } });
  const resultsSpring = spring({ frame: Math.max(0, frame - 1470), fps, config: { damping: 8, stiffness: 120 } });
  const resultsPulse = frame >= 1480 ? Math.sin((frame - 1480) * 0.08) * 0.08 + 1 : 1;
  const meetBadgeSpring = spring({ frame: Math.max(0, frame - 1510), fps, config: { damping: 14, stiffness: 120 } });

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
                fontSize: TYPOGRAPHY.h1, fontWeight: 900, fontFamily: "'Inter', sans-serif", letterSpacing: 6,
                color: w.color, opacity: w.spring,
                transform: `translateY(${interpolate(w.spring, [0, 1], [60, 0])}px) scale(${interpolate(w.spring, [0, 1], [0.7, 1])})`,
                textShadow: `0 0 40px ${w.color}40, 0 4px 20px rgba(0,0,0,0.5)`,
              }}>{w.text}.</div>
            ))}
          </div>
          {/* Date */}
          <div style={{ position: "absolute", top: "58%", left: 0, right: 0, textAlign: "center", opacity: dateFade }}>
            <span style={{ fontSize: TYPOGRAPHY.h5, fontWeight: 600, color: GD_GOLD, fontFamily: "'Inter', sans-serif", letterSpacing: 3 }}>17 MARCH 2026</span>
          </div>
          {/* Subtitle */}
          <div style={{ position: "absolute", top: "65%", left: 0, right: 0, textAlign: "center", opacity: subtitleFade }}>
            <span style={{ fontSize: TYPOGRAPHY.body, fontWeight: 400, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", letterSpacing: 2 }}>
              THE FIRST AWS COMMUNITY GAMEDAY EUROPE
            </span>
          </div>
        </AbsoluteFill>
      )}

      {/* ── SCENE 2: Stats cascade ── */}
      {frame >= 160 && frame < 380 && (
        <AbsoluteFill style={{ opacity: s2Opacity }}>
          <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center" }}>
            <span style={{ fontSize: TYPOGRAPHY.bodySmall, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", letterSpacing: 4, textTransform: "uppercase" }}>
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
                    fontSize: TYPOGRAPHY.stat, fontWeight: 900, fontFamily: "'Inter', sans-serif",
                    color: accentColors[i], lineHeight: 1,
                    textShadow: `0 0 30px ${accentColors[i]}50`,
                  }}>
                    <CountUp target={stat.value} frame={frame} startFrame={stat.delay} suffix={stat.suffix} />
                  </div>
                  <div style={{
                    fontSize: TYPOGRAPHY.caption, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginTop: 8,
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
            <div style={{ fontSize: TYPOGRAPHY.body, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", letterSpacing: 4 }}>
              THANK YOU TO EVERY
            </div>
            <div style={{
              fontSize: TYPOGRAPHY.h3, fontWeight: 900, fontFamily: "'Inter', sans-serif", marginTop: 8,
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
                  fontSize: TYPOGRAPHY.flag, opacity: flagSpring,
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
            <span style={{ fontSize: TYPOGRAPHY.bodySmall, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", letterSpacing: 2 }}>
              {`VOLUNTEERS • ACROSS ALL ${COUNTRIES.length}+ PARTICIPATING COUNTRIES • PURE COMMUNITY SPIRIT`}
            </span>
          </div>
        </AbsoluteFill>
      )}

      {/* ── SCENE 4: Organizer shoutout ── */}
      {frame >= 520 && frame < 1010 && (
        <AbsoluteFill style={{ opacity: s4Opacity }}>
          <div style={{
            position: "absolute", top: 40, left: 0, right: 0, textAlign: "center",
            opacity: orgTitleSpring, transform: `translateY(${interpolate(orgTitleSpring, [0, 1], [20, 0])}px)`,
          }}>
            <div style={{ fontSize: TYPOGRAPHY.h6, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", letterSpacing: 5 }}>
              COMMUNITY GAMEDAY EUROPE ORGANIZERS
            </div>
            <div style={{
              fontSize: TYPOGRAPHY.h3, fontWeight: 900, fontFamily: "'Inter', sans-serif", marginTop: 8,
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
                    <div style={{ fontSize: TYPOGRAPHY.h5, fontWeight: 800, color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
                      {org.flag} {org.name}
                    </div>
                    <div style={{ fontSize: TYPOGRAPHY.body, color: "rgba(255,255,255,0.55)", fontFamily: "'Inter', sans-serif", marginTop: 3, whiteSpace: "nowrap" }}>
                      {org.role}
                    </div>
                    <div style={{ fontSize: TYPOGRAPHY.bodySmall, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", marginTop: 1 }}>
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
      {frame >= 1010 && frame < 1400 && (
        <AbsoluteFill style={{ opacity: s4bOpacity }}>
          <div style={{
            position: "absolute", top: 40, left: 0, right: 0, textAlign: "center",
            opacity: awsTitleSpring, transform: `translateY(${interpolate(awsTitleSpring, [0, 1], [20, 0])}px)`,
          }}>
            <div style={{ fontSize: TYPOGRAPHY.bodySmall, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", letterSpacing: 5 }}>
              POWERED BY
            </div>
            <div style={{
              fontSize: TYPOGRAPHY.h4, fontWeight: 900, fontFamily: "'Inter', sans-serif", marginTop: 8,
              color: GD_ORANGE, letterSpacing: 1,
            }}>Thank You, AWS</div>
          </div>
          {/* Subtitle */}
          <div style={{
            position: "absolute", top: 130, left: 0, right: 0, textAlign: "center",
            opacity: interpolate(frame, [1060, 1090], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <span style={{ fontSize: TYPOGRAPHY.captionSmall, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>
              For the GameDay environment, outstanding support during organization, and so much more
            </span>
          </div>
          {/* AWS supporter cards — centered row */}
          <div style={{
            position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 60, justifyContent: "center", alignItems: "flex-start",
          }}>
            {AWS_SUPPORTERS.map((person, i) => {
              const cardSpring = spring({ frame: Math.max(0, frame - 1070 - i * 15), fps, config: { damping: 12, stiffness: 100, mass: 0.8 } });
              const cardScale = interpolate(cardSpring, [0, 1], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={person.name} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                  opacity: cardSpring, transform: `scale(${cardScale}) translateY(${interpolate(cardSpring, [0, 1], [20, 0])}px)`,
                }}>
                  <div style={{
                    width: 140, height: 140, borderRadius: "50%", overflow: "hidden",
                    boxShadow: `0 0 30px ${GD_ORANGE}50, 0 0 60px ${GD_ORANGE}30, 0 4px 16px rgba(0,0,0,0.4)`,
                    border: `2px solid ${GD_ORANGE}40`,
                  }}>
                    <Img src={staticFile(person.face)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ textAlign: "center", maxWidth: 200 }}>
                    <div style={{ fontSize: TYPOGRAPHY.h6, fontWeight: 800, color: "#ffffff", fontFamily: "'Inter', sans-serif" }}>
                      {person.name}
                    </div>
                    <div style={{ fontSize: TYPOGRAPHY.captionSmall, color: GD_ORANGE, fontFamily: "'Inter', sans-serif", marginTop: 4, fontWeight: 600 }}>
                      {person.country}
                    </div>
                    <div style={{ fontSize: TYPOGRAPHY.label, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", marginTop: 3, lineHeight: 1.3 }}>
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
            opacity: interpolate(frame, [1120, 1150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)",
              borderRadius: 12, padding: "10px 24px", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{ fontSize: TYPOGRAPHY.body }}>🙏</span>
              <span style={{ fontSize: TYPOGRAPHY.captionSmall, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", letterSpacing: 1 }}>
                And many more AWS colleagues who made this possible
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── SCENE 5: "AND NOW... THE RESULTS" ── */}
      {frame >= 1400 && (
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
            <span style={{ fontSize: TYPOGRAPHY.h6, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", letterSpacing: 6 }}>
              AND NOW...
            </span>
          </div>
          <div style={{
            position: "absolute", top: "44%", left: 0, right: 0, textAlign: "center",
            opacity: resultsSpring,
            transform: `scale(${resultsPulse * interpolate(resultsSpring, [0, 1], [0.6, 1])})`,
          }}>
            <div style={{
              fontSize: TYPOGRAPHY.h2, fontWeight: 900, fontFamily: "'Inter', sans-serif", letterSpacing: 8,
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
              fontSize: TYPOGRAPHY.captionSmall, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', sans-serif", letterSpacing: 1,
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

// ── FastScroll (frames 1600-1899): Continuous vertical scroll through all groups ──
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
  const scrollDuration = FAST_SCROLL_END - FAST_SCROLL_START;

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
                    <div style={{ fontSize: TYPOGRAPHY.h2, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}>{group.flag}</div>
                  </div>
                )}
                <div style={{ padding: "6px 12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: TYPOGRAPHY.captionSmall, lineHeight: 1 }}>{group.flag}</div>
                    <div style={{ fontSize: TYPOGRAPHY.label, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', sans-serif", lineHeight: 1.2 }}>{group.name}</div>
                  </div>
                  <div style={{ fontSize: TYPOGRAPHY.overline, color: "#94a3b8", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 4, marginLeft: 22 }}>📍 {group.city}</div>
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

// ── Finale: "Winners revealed in seconds" (frames 3300-3599) ──
const WinnersTeaser: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const localFrame = frame - FINALE_START;

  const entryOpacity = interpolate(localFrame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(localFrame, [250, 299], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleSpring = spring({ frame: Math.max(0, localFrame - 10), fps, config: { damping: 12, stiffness: 100 } });
  const countdownSpring = spring({ frame: Math.max(0, localFrame - 40), fps, config: { damping: 10, stiffness: 120 } });
  const pulse = localFrame >= 60 ? Math.sin((localFrame - 60) * 0.06) * 0.06 + 1 : 1;

  // Countdown from 10 to 0
  const secondsLeft = Math.max(0, Math.ceil((PART_A_TOTAL_FRAMES - frame) / FPS));

  return (
    <AbsoluteFill style={{ opacity: entryOpacity * exitOpacity }}>
      {/* Radial burst */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 1000, height: 1000,
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, ${GD_PURPLE}40 0%, ${GD_PINK}15 40%, transparent 70%)`,
        borderRadius: "50%", opacity: titleSpring,
      }} />
      <div style={{
        position: "absolute", top: "28%", left: 0, right: 0, textAlign: "center",
        opacity: titleSpring, transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
      }}>
        <span style={{ fontSize: TYPOGRAPHY.h6, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", letterSpacing: 6 }}>
          GET READY
        </span>
      </div>
      <div style={{
        position: "absolute", top: "40%", left: 0, right: 0, textAlign: "center",
        opacity: countdownSpring, transform: `scale(${pulse * interpolate(countdownSpring, [0, 1], [0.6, 1])})`,
      }}>
        <div style={{
          fontSize: TYPOGRAPHY.h2, fontWeight: 900, fontFamily: "'Inter', sans-serif", letterSpacing: 8,
          background: `linear-gradient(135deg, ${GD_GOLD} 0%, #ffffff 40%, ${GD_GOLD} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 0 30px ${GD_GOLD}40)`,
        }}>WINNERS REVEALED</div>
      </div>
      {/* Countdown number */}
      <div style={{
        position: "absolute", top: "56%", left: 0, right: 0, textAlign: "center",
        opacity: countdownSpring,
      }}>
        <span style={{
          fontSize: TYPOGRAPHY.stat, fontWeight: 900, fontFamily: "'Inter', sans-serif",
          color: GD_ACCENT, textShadow: `0 0 40px ${GD_ACCENT}60`,
        }}>{secondsLeft}</span>
        <div style={{
          fontSize: TYPOGRAPHY.caption, fontWeight: 600, color: "rgba(255,255,255,0.5)",
          fontFamily: "'Inter', sans-serif", letterSpacing: 3, marginTop: 8,
        }}>SECONDS</div>
      </div>
      {/* GameDay badge */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0, display: "flex", justifyContent: "center",
        opacity: interpolate(localFrame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          background: `linear-gradient(135deg, #4f46e5, ${GD_PINK})`, borderRadius: 12, padding: "10px 28px",
          fontSize: TYPOGRAPHY.captionSmall, fontWeight: 700, color: "#ffffff", fontFamily: "'Inter', sans-serif", letterSpacing: 1,
          display: "flex", alignItems: "center",
        }}>
          <Img src={staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png")} style={{ height: 24, marginRight: 8 }} />
          The moment you've been waiting for
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── ShowcasePhase (Hero Intro + Fast Scroll + Winners Teaser) ──
const ShowcasePhase: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame >= FINALE_START) return <WinnersTeaser frame={frame} />;
  if (frame > HERO_INTRO_END) return <FastScroll frame={frame} />;
  return <HeroIntro frame={frame} />;
};

// ── ResultsCountdown ──
const ResultsCountdown: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame <= HERO_INTRO_END) return null;
  const countdown = formatTime(Math.max(0, Math.floor((PART_A_TOTAL_FRAMES - frame) / 30)));
  return (
    <div style={{ position: "absolute", top: 16, right: 16, zIndex: 20 }}>
      <GlassCard style={{ padding: "6px 14px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <div style={{ fontSize: TYPOGRAPHY.overline, fontWeight: 500, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Results in</div>
          <div style={{ fontSize: TYPOGRAPHY.caption, fontWeight: 700, color: GD_GOLD, fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>{countdown}</div>
        </div>
      </GlassCard>
    </div>
  );
};

// ── Part A: Closing Countdown Composition (3600 frames = 2 min) ──
export const GameDayClosingCountdown: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: GD_DARK }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <SegmentTransitionFlash />

      <Sequence name="Showcase (Hero + Scroll)" from={0} durationInFrames={PART_A_TOTAL_FRAMES} layout="none">
        <AbsoluteFill style={{ zIndex: 10 }}>
          <ShowcasePhase frame={frame} />
          <ResultsCountdown frame={frame} />
        </AbsoluteFill>
      </Sequence>

      <AudioBadge muted={false} />
    </AbsoluteFill>
  );
};

// ── Standalone Sub-Composition for Remotion Studio ──
export const ClosingShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: "'Inter', sans-serif", background: GD_DARK }}>
      <BackgroundLayer darken={0.65} />
      <HexGridOverlay />
      <ShowcasePhase frame={frame} />
      <ResultsCountdown frame={frame} />
    </AbsoluteFill>
  );
};
