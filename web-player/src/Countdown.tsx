import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  GD_DARK,
  GD_PURPLE,
  GD_VIOLET,
  GD_ACCENT,
  GD_ORANGE,
  GD_GOLD,
  BackgroundLayer,
  HexGridOverlay,
} from "@compositions/shared/GameDayDesignSystem";

// ─── SVG Icons ───────────────────────────────────────────────────────
const AudioIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const MutedIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = GD_PURPLE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

// ─── Types ───────────────────────────────────────────────────────────
interface Milestone {
  label: string;
  time: string;
  id: string;
  desc: string;
}

interface CountdownProps {
  eventDate: string;
  timezone: string;
  milestones: Milestone[];
}

function msUntil(eventDate: string, time: string, nowMs: number): number {
  const target = new Date(`${eventDate}T${time}:00`).getTime();
  return Math.max(0, target - nowMs);
}

function formatHMS(ms: number): { d: number; h: string; m: string; s: string } {
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { d, h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") };
}

const FONT = "'Amazon Ember', 'Inter', system-ui, sans-serif";

const LOGO = staticFile("AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White Geometric with text.png");
const COMMUNITY_LOGO = staticFile("AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png");

// ─── Timer box ───────────────────────────────────────────────────────
const TimerBox: React.FC<{ value: string; unit: string; pulse: number; large?: boolean }> = ({
  value, unit, pulse, large,
}) => (
  <div style={{
    background: `linear-gradient(180deg, ${GD_PURPLE}33, ${GD_DARK}ee)`,
    border: `1px solid ${GD_VIOLET}22`,
    borderRadius: large ? 10 : 5,
    padding: large ? "8px 12px" : "3px 6px",
    textAlign: "center",
    minWidth: large ? 64 : 36,
  }}>
    <div style={{
      fontSize: large ? 40 : 18,
      fontWeight: 800,
      fontFamily: "'Amazon Ember', monospace",
      color: GD_GOLD,
      textShadow: `0 0 ${(large ? 14 : 6) * pulse}px ${GD_ORANGE}44`,
      lineHeight: 1.1,
    }}>
      {value}
    </div>
    <div style={{ fontSize: large ? 10 : 8, color: GD_ACCENT, marginTop: 1, textTransform: "uppercase", letterSpacing: 1 }}>
      {unit}
    </div>
  </div>
);

const Colon: React.FC<{ pulse: number; large?: boolean }> = ({ pulse, large }) => (
  <div style={{
    fontSize: large ? 32 : 16, color: GD_GOLD, fontWeight: 300,
    paddingBottom: large ? 12 : 6, opacity: 0.3 + pulse * 0.7,
  }}>:</div>
);

// ─── Milestone row ───────────────────────────────────────────────────
const MilestoneRow: React.FC<{
  ms: Milestone; remaining: number; pulse: number; isPreshow: boolean;
}> = ({ ms, remaining, pulse, isPreshow }) => {
  const isLive = remaining === 0;
  const t = formatHMS(remaining);
  const isMuted = ms.id === "preshow" || ms.id === "gameplay";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      opacity: isPreshow ? 0.45 : 1,
      padding: "8px 16px",
      background: isLive ? "#22c55e11" : "transparent",
      borderRadius: 8,
      border: isLive ? "1px solid #22c55e33" : "1px solid transparent",
    }}>
      {/* Time + icon */}
      <div style={{ width: 52, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: isLive ? "#22c55e" : GD_ACCENT, fontFamily: FONT }}>
          {ms.time}
        </div>
        <div style={{ marginTop: 2 }}>
          {isMuted ? <MutedIcon size={12} /> : <AudioIcon size={12} />}
        </div>
      </div>

      {/* Label + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: isPreshow ? 12 : 14, fontWeight: 700, color: isLive ? "#22c55e" : "white",
          fontFamily: FONT,
        }}>
          {ms.label}
          {isPreshow && <span style={{ fontWeight: 400, fontStyle: "italic", color: GD_PURPLE, marginLeft: 6, fontSize: 10 }}>optional</span>}
        </div>
        <div style={{ fontSize: isPreshow ? 10 : 11, color: GD_PURPLE, marginTop: 1 }}>
          {ms.desc}
        </div>
      </div>

      {/* Timer */}
      <div style={{ width: 160, display: "flex", justifyContent: "flex-end" }}>
        {isLive ? (
          <div style={{ fontSize: 16, fontWeight: 700, color: "#22c55e" }}>✓ LIVE</div>
        ) : (
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
            {t.d > 0 && <><TimerBox value={String(t.d)} unit="d" pulse={pulse} /><Colon pulse={pulse} /></>}
            <TimerBox value={t.h} unit="h" pulse={pulse} />
            <Colon pulse={pulse} />
            <TimerBox value={t.m} unit="m" pulse={pulse} />
            <Colon pulse={pulse} />
            <TimerBox value={t.s} unit="s" pulse={pulse} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────
export const CountdownComposition: React.FC<CountdownProps> = ({
  eventDate,
  milestones,
}) => {
  const frame = useCurrentFrame();
  const realNow = Date.now();
  const pulse = interpolate(frame % 60, [0, 30, 60], [0.4, 1, 0.4]);

  const fadeIn = (delay: number) => ({
    opacity: interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
    transform: `translateY(${interpolate(frame, [delay, delay + 20], [15, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" })}px)`,
  });

  // Gameplay hero
  const gameplay = milestones.find((m) => m.id === "gameplay")!;
  const gameplayMs = msUntil(eventDate, gameplay.time, realNow);
  const gameplayTime = formatHMS(gameplayMs);
  const gameplayLive = gameplayMs === 0;

  // Other milestones in schedule order
  const others = milestones.filter((m) => m.id !== "gameplay");

  return (
    <AbsoluteFill style={{ background: GD_DARK, fontFamily: FONT }}>
      <BackgroundLayer darken={0.88} />
      <HexGridOverlay />

      {/* ── Logos ── */}
      <div style={{
        position: "absolute", top: 20, width: "100%",
        display: "flex", justifyContent: "center", alignItems: "center", gap: 20,
        ...fadeIn(0),
      }}>
        <Img src={COMMUNITY_LOGO} style={{ height: 52 }} />
        <div style={{ width: 1, height: 36, background: GD_PURPLE + "44" }} />
        <Img src={LOGO} style={{ height: 44 }} />
      </div>

      {/* ── Hero: GameDay countdown ── */}
      <div style={{
        position: "absolute", top: 100, width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        ...fadeIn(8),
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: GD_GOLD, textTransform: "uppercase",
          letterSpacing: 3, marginBottom: 6,
        }}>
          🎮 Game Starts In
        </div>

        {gameplayLive ? (
          <div style={{ fontSize: 48, fontWeight: 800, color: "#22c55e", textShadow: `0 0 30px #22c55e44` }}>
            GAME ON
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {gameplayTime.d > 0 && (
              <><TimerBox value={String(gameplayTime.d)} unit="days" pulse={pulse} large /><Colon pulse={pulse} large /></>
            )}
            <TimerBox value={gameplayTime.h} unit="hrs" pulse={pulse} large />
            <Colon pulse={pulse} large />
            <TimerBox value={gameplayTime.m} unit="min" pulse={pulse} large />
            <Colon pulse={pulse} large />
            <TimerBox value={gameplayTime.s} unit="sec" pulse={pulse} large />
          </div>
        )}

        <div style={{ fontSize: 12, color: GD_PURPLE, marginTop: 8 }}>
          2 hours of competitive cloud gaming • 53+ User Groups • 20+ countries
        </div>
      </div>

      {/* ── Schedule timeline ── */}
      <div style={{
        position: "absolute", top: 310, left: "50%", transform: "translateX(-50%)",
        width: 580,
        display: "flex", flexDirection: "column", gap: 4,
        ...fadeIn(18),
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: GD_PURPLE, textTransform: "uppercase",
          letterSpacing: 2, marginBottom: 4, paddingLeft: 16,
        }}>
          Full Schedule — {eventDate} CET
        </div>
        {others.map((ms) => (
          <MilestoneRow
            key={ms.id}
            ms={ms}
            remaining={msUntil(eventDate, ms.time, realNow)}
            pulse={pulse}
            isPreshow={ms.id === "preshow"}
          />
        ))}
      </div>

      {/* ── Bottom ── */}
      <div style={{
        position: "absolute", bottom: 14, width: "100%", textAlign: "center",
        fontSize: 10, color: GD_PURPLE,
        opacity: interpolate(frame, [30, 50], [0, 0.4], { extrapolateRight: "clamp" }),
      }}>
        The first-ever AWS Community GameDay across Europe
      </div>
    </AbsoluteFill>
  );
};
