import React, { useEffect, useState } from "react";
import { GD_DARK, GD_PURPLE, GD_VIOLET, GD_ACCENT, GD_ORANGE, GD_GOLD } from "@compositions/src/design/colors";
import {
  AudioIcon, MutedIcon, GamepadIcon, CalendarIcon,
  CheckCircleIcon, MonitorIcon, ClockIcon, UsersIcon,
  GlobeIcon, ChairIcon, CodeIcon,
} from "./icons";

const BASE = import.meta.env.BASE_URL;
const COMMUNITY_LOGO = `${BASE}assets/aws-community-logo.png`;
const GAMEDAY_LOGO   = `${BASE}assets/logos/gameday-logo-white.png`;

const F = "'Inter', 'Amazon Ember', system-ui, sans-serif";
const DC = "rgba(255,255,255,0.65)";

interface Milestone { label: string; time: string; id: string; desc: string }
interface Props { eventDate: string; timezone: string; milestones: Milestone[] }

function msUntil(date: string, time: string) {
  return Math.max(0, new Date(`${date}T${time}:00`).getTime() - Date.now());
}
function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: String(Math.floor((s % 86400) / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
  };
}

function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

const Digit: React.FC<{ v: string; u: string; small?: boolean }> = ({ v, u, small }) => (
  <div style={{
    background: `linear-gradient(180deg, ${GD_PURPLE}40, ${GD_DARK}dd)`,
    border: `1px solid ${GD_VIOLET}30`,
    borderRadius: small ? 10 : 14,
    padding: small ? "8px 10px" : "14px 20px",
    textAlign: "center",
    minWidth: small ? 52 : 94,
  }}>
    <div style={{ fontSize: small ? 32 : 58, fontWeight: 800, fontFamily: F, color: GD_GOLD, lineHeight: 1 }}>{v}</div>
    <div style={{ fontSize: small ? 9 : 13, color: GD_ACCENT, marginTop: small ? 2 : 4, textTransform: "uppercase", letterSpacing: 1.5 }}>{u}</div>
  </div>
);

const Sep: React.FC<{ small?: boolean }> = ({ small }) => (
  <div style={{ fontSize: small ? 26 : 46, color: GD_GOLD, opacity: 0.5, paddingBottom: small ? 10 : 18, fontWeight: 300 }}>:</div>
);

// ─── Mobile layout ────────────────────────────────────────────────────────────
const MobileCountdown: React.FC<Props> = ({ eventDate, milestones }) => {
  const [, tick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const gameplay = milestones.find(m => m.id === "gameplay")!;
  const closing  = milestones.find(m => m.id === "closing")!;
  const gMs = msUntil(eventDate, gameplay.time);
  const gT  = fmt(gMs);
  const ended = closing && msUntil(eventDate, closing.time) === 0;
  const gLive = gMs === 0 && !ended;

  return (
    <div style={{
      width: "100vw", minHeight: "100vh", position: "relative",
      fontFamily: F, background: GD_DARK, overflowX: "hidden",
    }}>
      {/* Background */}
      <img src={`${BASE}assets/background-landscape.png`} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "fixed", inset: 0, background: "rgba(12,8,32,0.8)" }} />

      <div style={{ position: "relative", zIndex: 1, padding: "32px 20px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        {/* Logos */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={COMMUNITY_LOGO} style={{ height: 50, objectFit: "contain" }} />
          <div style={{ width: 1, height: 32, background: `${GD_PURPLE}55` }} />
          <img src={GAMEDAY_LOGO} style={{ height: 70, objectFit: "contain" }} />
        </div>

        {/* Countdown */}
        <div style={{ textAlign: "center" }}>
          {ended ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: GD_ACCENT, marginBottom: 10 }}>
                Event Complete
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: GD_GOLD, lineHeight: 1.1 }}>That's a wrap.</div>
              <div style={{ fontSize: 13, color: DC, marginTop: 10 }}>Thank you to all user groups across Europe!</div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 14, fontWeight: 700, color: GD_GOLD, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>
                <GamepadIcon size={18} color={GD_GOLD} /> Game Starts In
              </div>
              {gLive ? (
                <div style={{ fontSize: 40, fontWeight: 800, color: "#22c55e" }}>GAME ON</div>
              ) : (
                <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "flex-end" }}>
                  {gT.d > 0 && <><Digit v={String(gT.d)} u="days" small /><Sep small /></>}
                  <Digit v={gT.h} u="hrs" small /><Sep small />
                  <Digit v={gT.m} u="min" small /><Sep small />
                  <Digit v={gT.s} u="sec" small />
                </div>
              )}
              <div style={{ fontSize: 13, color: GD_ACCENT, marginTop: 12, opacity: 0.85 }}>2 hours of competitive cloud gaming</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}>
                <GlobeIcon size={12} color={DC} />
                <span style={{ fontSize: 12, color: DC }}>53+ User Groups · 20+ Countries · 4+ Timezones</span>
              </div>
            </>
          )}
        </div>

        {/* Schedule */}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            <CalendarIcon size={14} /> Schedule (CET)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {milestones.map(ms => {
              const remaining = msUntil(eventDate, ms.time);
              const isLive = remaining === 0;
              const t = fmt(remaining);
              const isPre  = ms.id === "preshow";
              const isGame = ms.id === "gameplay";
              const isMuted = isPre || isGame;
              return (
                <div key={ms.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10,
                  background: isLive ? "#22c55e15" : isGame ? `${GD_GOLD}08` : "rgba(255,255,255,0.03)",
                  border: isLive ? "1px solid #22c55e44" : isGame ? `1px solid ${GD_GOLD}22` : "1px solid rgba(255,255,255,0.05)",
                  opacity: isPre ? 0.55 : 1,
                }}>
                  <div style={{ width: 42, textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: isLive ? "#22c55e" : "white" }}>{ms.time}</div>
                    <div style={{ marginTop: 2 }}>{isMuted ? <MutedIcon size={12} /> : <AudioIcon size={12} />}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isLive ? "#22c55e" : "white" }}>
                      {ms.label}
                      {isPre && <span style={{ fontSize: 10, color: DC, fontWeight: 400, fontStyle: "italic", marginLeft: 6 }}>optional</span>}
                    </div>
                    <div style={{ fontSize: 11, color: DC, marginTop: 1 }}>{ms.desc}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    {isLive ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>LIVE</span>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: isGame ? GD_GOLD : GD_ACCENT }}>
                        {t.d > 0 ? `${t.d}d ` : ""}{t.h}:{t.m}:{t.s}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Get Ready */}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            <CheckCircleIcon size={14} /> Get Ready
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: <UsersIcon size={15} />, text: "Form your team locally before the stream" },
              { icon: <ChairIcon size={15} />,  text: "Be seated with audio ready 5 min before start" },
              { icon: <MonitorIcon size={15} />, text: "Watch the live stream for instructions" },
              { icon: <CodeIcon size={15} />,    text: "Team codes distributed locally, then game on" },
              { icon: <ClockIcon size={15} />,   text: "Stream returns after 2h for the closing ceremony" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textAlign: "center" }}>
          The first-ever AWS Community GameDay across Europe
        </div>
      </div>
    </div>
  );
};

// ─── Desktop layout ───────────────────────────────────────────────────────────
const DesktopCountdown: React.FC<Props> = ({ eventDate, milestones }) => {
  const [, tick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const gameplay = milestones.find(m => m.id === "gameplay")!;
  const closing  = milestones.find(m => m.id === "closing")!;
  const gMs = msUntil(eventDate, gameplay.time);
  const gT  = fmt(gMs);
  const ended = closing && msUntil(eventDate, closing.time) === 0;
  const gLive = gMs === 0 && !ended;

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", fontFamily: F, overflow: "hidden", background: GD_DARK }}>
      {/* Background */}
      <img src={`${BASE}assets/background-landscape.png`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(12,8,32,0.75)" }} />
      {/* Hex grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
        <defs><pattern id="hex" width="60" height="52" patternUnits="userSpaceOnUse">
          <path d="M30 0 L60 15 L60 37 L30 52 L0 37 L0 15 Z" fill="none" stroke={GD_PURPLE} strokeWidth={0.5} />
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>

      {/* Left: logos + hero countdown */}
      <div style={{ position: "absolute", left: 0, top: 0, width: "55%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <img src={COMMUNITY_LOGO} style={{ height: 100, objectFit: "contain" }} />
          <div style={{ width: 1, height: 60, background: `${GD_PURPLE}55` }} />
          <img src={GAMEDAY_LOGO} style={{ height: 140, objectFit: "contain" }} />
        </div>

        <div style={{ textAlign: "center" }}>
          {ended ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: GD_ACCENT, marginBottom: 16 }}>
                Event Complete · Across Europe
              </div>
              <div style={{ fontSize: 64, fontWeight: 900, color: GD_GOLD, lineHeight: 1.1, marginBottom: 16 }}>That's a wrap.</div>
              <div style={{ fontSize: 17, color: DC, marginBottom: 8 }}>Thank you to all user groups across Europe!</div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 20, fontWeight: 700, color: GD_GOLD, textTransform: "uppercase", letterSpacing: 4, marginBottom: 14 }}>
                <GamepadIcon size={24} color={GD_GOLD} /> Game Starts In
              </div>
              {gLive ? (
                <div style={{ fontSize: 68, fontWeight: 800, color: "#22c55e", textShadow: "0 0 40px #22c55e44" }}>GAME ON</div>
              ) : (
                <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "flex-end" }}>
                  {gT.d > 0 && <><Digit v={String(gT.d)} u="days" /><Sep /></>}
                  <Digit v={gT.h} u="hours" /><Sep />
                  <Digit v={gT.m} u="min" /><Sep />
                  <Digit v={gT.s} u="sec" />
                </div>
              )}
              <div style={{ fontSize: 17, color: GD_ACCENT, marginTop: 18, opacity: 0.85 }}>2 hours of competitive cloud gaming</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 }}>
                <GlobeIcon size={16} color={DC} />
                <span style={{ fontSize: 15, color: DC }}>53+ User Groups across 20+ Countries in 4+ Timezones</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: schedule + checklist */}
      <div style={{ position: "absolute", right: 0, top: 0, width: "45%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 36px 0 0", marginTop: -20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>
            <CalendarIcon size={18} /> Schedule (CET)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {milestones.map(ms => {
              const remaining = msUntil(eventDate, ms.time);
              const isLive = remaining === 0;
              const t = fmt(remaining);
              const isPre  = ms.id === "preshow";
              const isGame = ms.id === "gameplay";
              const isMuted = isPre || isGame;
              return (
                <div key={ms.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "11px 16px", borderRadius: 12,
                  background: isLive ? "#22c55e15" : isGame ? `${GD_GOLD}08` : "rgba(255,255,255,0.03)",
                  border: isLive ? "1px solid #22c55e44" : isGame ? `1px solid ${GD_GOLD}22` : "1px solid rgba(255,255,255,0.05)",
                  opacity: isPre ? 0.55 : 1,
                }}>
                  <div style={{ width: 54, textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: isLive ? "#22c55e" : "white" }}>{ms.time}</div>
                    <div style={{ marginTop: 3 }}>{isMuted ? <MutedIcon size={15} /> : <AudioIcon size={15} />}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: isLive ? "#22c55e" : "white" }}>
                      {ms.label}
                      {isPre && <span style={{ fontSize: 12, color: DC, fontWeight: 400, fontStyle: "italic", marginLeft: 8 }}>optional</span>}
                    </div>
                    <div style={{ fontSize: 13, color: DC, marginTop: 2 }}>{ms.desc}</div>
                  </div>
                  <div style={{ width: 105, textAlign: "right" }}>
                    {isLive ? (
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#22c55e" }}>LIVE</span>
                    ) : (
                      <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "monospace", color: isGame ? GD_GOLD : GD_ACCENT }}>
                        {t.d > 0 ? `${t.d}d ` : ""}{t.h}:{t.m}:{t.s}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: GD_ACCENT, textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>
            <CheckCircleIcon size={18} /> Get Ready
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { icon: <UsersIcon size={17} />, text: "Form your team locally before the stream" },
              { icon: <ChairIcon size={17} />,  text: "Be seated with audio ready 5 min before start" },
              { icon: <MonitorIcon size={17} />, text: "Watch the live stream for instructions" },
              { icon: <CodeIcon size={17} />,    text: "Team codes distributed locally, then game on" },
              { icon: <ClockIcon size={17} />,   text: "Stream returns after 2h for the closing ceremony" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 15, color: "rgba(255,255,255,0.9)" }}>
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 34,
        background: `linear-gradient(90deg, ${GD_PURPLE}22, ${GD_VIOLET}11, ${GD_PURPLE}22)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>
          The first-ever AWS Community GameDay across Europe
        </span>
      </div>
    </div>
  );
};

// ─── Responsive wrapper ───────────────────────────────────────────────────────
export const ResponsiveCountdown: React.FC<Props> = (props) => {
  const mobile = useIsMobile();
  return mobile ? <MobileCountdown {...props} /> : <DesktopCountdown {...props} />;
};
