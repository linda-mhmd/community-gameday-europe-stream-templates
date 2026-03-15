import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Player } from "@remotion/player";
import { GameDayPreShow } from "@compositions/00-GameDayStreamPreShow-Muted";
import { GameDayMainEvent } from "@compositions/01-GameDayStreamMainEvent-Audio";
import { GameDayGameplay } from "@compositions/02-GameDayStreamGameplay-Muted";
import { GameDayClosing } from "@compositions/03-GameDayStreamClosing-Audio";
import {
  EVENT_DATE,
  SCHEDULE,
  TIMEZONE,
  COMPOSITIONS,
} from "./schedule";

type SegmentId = "preshow" | "mainevent" | "gameplay" | "closing" | "end" | "waiting";

/**
 * URL parameter overrides for testing:
 *   ?segment=preshow        → jump directly to a segment
 *   ?time=18:05             → simulate a specific CET time on event day
 *   ?time=17:00&date=2025-06-14  → simulate a specific date + time
 *
 * Examples:
 *   http://localhost:5173/?segment=closing
 *   http://localhost:5173/?time=18:15
 *   http://localhost:5173/?time=20:35&date=2025-06-14
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    segment: params.get("segment"),
    time: params.get("time"),
    date: params.get("date"),
  };
}

function getCurrentSegment(): SegmentId {
  const { segment: urlSegment, time: urlTime, date: urlDate } = getUrlParams();

  // Direct segment override: ?segment=closing
  if (urlSegment) {
    const valid: SegmentId[] = ["preshow", "mainevent", "gameplay", "closing", "end", "waiting"];
    if (valid.includes(urlSegment as SegmentId)) return urlSegment as SegmentId;
  }

  // Determine date and time to use
  let currentDate: string;
  let currentTime: string;

  if (urlTime) {
    // Simulate time: ?time=18:05 (uses EVENT_DATE unless ?date= is also set)
    currentDate = urlDate ?? EVENT_DATE;
    currentTime = urlTime;
  } else {
    // Real clock
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    currentDate = `${get("year")}-${get("month")}-${get("day")}`;
    currentTime = `${get("hour")}:${get("minute")}`;
  }

  if (currentDate !== EVENT_DATE && !urlTime) return "waiting";

  // Walk the schedule backwards to find the active segment
  for (let i = SCHEDULE.length - 1; i >= 0; i--) {
    if (currentTime >= SCHEDULE[i].start) {
      return SCHEDULE[i].id as SegmentId;
    }
  }
  return "waiting";
}

function formatCountdown(targetDate: string, targetTime: string, tz: string): string {
  const target = new Date(`${targetDate}T${targetTime}:00`);
  // Approximate: create target in the event timezone
  const targetStr = target.toLocaleString("en-US", { timeZone: tz });
  const targetMs = new Date(targetStr).getTime();
  const nowStr = new Date().toLocaleString("en-US", { timeZone: tz });
  const nowMs = new Date(nowStr).getTime();
  const diff = targetMs - nowMs;
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Manual override controls ────────────────────────────────────────
const SEGMENTS: { id: SegmentId; label: string }[] = [
  { id: "preshow", label: "0 — Pre-Show" },
  { id: "mainevent", label: "1 — Main Event" },
  { id: "gameplay", label: "2 — Gameplay" },
  { id: "closing", label: "3 — Closing" },
];

export const App: React.FC = () => {
  const [segment, setSegment] = useState<SegmentId>(getCurrentSegment);
  const [override, setOverride] = useState<SegmentId | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Poll every second to check if we should switch segments
  useEffect(() => {
    const interval = setInterval(() => {
      if (!override) {
        setSegment(getCurrentSegment());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [override]);

  const active = override ?? segment;

  // Toggle controls with Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowControls((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleOverride = useCallback((id: SegmentId) => {
    setOverride(id);
    setSegment(id);
  }, []);

  const handleAutoMode = useCallback(() => {
    setOverride(null);
    setSegment(getCurrentSegment());
  }, []);

  // ─── Render ──────────────────────────────────────────────────────
  if (active === "waiting") {
    return <WaitingScreen />;
  }
  if (active === "end") {
    return <EndScreen />;
  }

  const comp = COMPOSITIONS[active];

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0c0820", position: "relative" }}>
      {/* Key forces remount when switching compositions */}
      <Player
        key={active}
        component={
          active === "preshow" ? GameDayPreShow :
          active === "mainevent" ? GameDayMainEvent :
          active === "gameplay" ? GameDayGameplay :
          GameDayClosing
        }
        inputProps={active === "preshow" ? { loopIteration: 0 } : {}}
        durationInFrames={comp.durationInFrames}
        fps={comp.fps}
        compositionWidth={comp.width}
        compositionHeight={comp.height}
        loop={active === "preshow"}
        autoPlay
        controls={false}
        style={{ width: "100%", height: "100%" }}
        initiallyMuted={active === "preshow" || active === "gameplay"}
      />

      {/* Operator controls — toggle with Escape */}
      {showControls && (
        <div style={controlsStyle}>
          <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>
            Press <b>Esc</b> to hide controls
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              onClick={handleAutoMode}
              style={{
                ...btnStyle,
                background: !override ? "#6c3fa0" : "#333",
              }}
            >
              ⏱ Auto
            </button>
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleOverride(s.id)}
                style={{
                  ...btnStyle,
                  background: active === s.id ? "#8b5cf6" : "#333",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>
            {override ? `Manual: ${active}` : `Auto mode — current: ${active}`}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Waiting / End screens ───────────────────────────────────────────
const WaitingScreen: React.FC = () => {
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(EVENT_DATE, SCHEDULE[0].start, TIMEZONE));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={screenStyle}>
      <h1 style={{ fontSize: 32, color: "#c084fc" }}>AWS Community GameDay Europe</h1>
      <p style={{ fontSize: 20, marginTop: 16, color: "#8b5cf6" }}>Stream starts in</p>
      <p style={{ fontSize: 64, fontFamily: "monospace", color: "#fbbf24", marginTop: 8 }}>{countdown}</p>
      <p style={{ fontSize: 14, marginTop: 24, opacity: 0.5 }}>
        {EVENT_DATE} — {SCHEDULE[0].start} CET
      </p>
    </div>
  );
};

const EndScreen: React.FC = () => (
  <div style={screenStyle}>
    <h1 style={{ fontSize: 32, color: "#fbbf24" }}>🎉 Stream Ended</h1>
    <p style={{ fontSize: 18, marginTop: 16, color: "#c084fc" }}>
      Thank you for joining AWS Community GameDay Europe!
    </p>
  </div>
);

// ─── Styles ──────────────────────────────────────────────────────────
const screenStyle: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "#0c0820",
  color: "white",
};

const controlsStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 12,
  left: 12,
  background: "rgba(0,0,0,0.85)",
  padding: "8px 12px",
  borderRadius: 8,
  color: "white",
  fontSize: 13,
  zIndex: 9999,
};

const btnStyle: React.CSSProperties = {
  border: "none",
  color: "white",
  padding: "4px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
};
