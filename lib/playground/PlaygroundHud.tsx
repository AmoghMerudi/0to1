"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { RoleKey } from "@/lib/dashboard/constants";
import type { AgentLiveState, PlaygroundRole } from "./three/useAgentState";

const C = {
  ink: "#0A0A0A",
  ink2: "#1A1815",
  surface: "#13110E",
  paper: "#FAFAF7",
  hairlineDark: "#26241F",
  hairline: "#BFBCB1",
  fg1: "#FAFAF7",
  fg2: "#BFBCB1",
  fg3: "#8E8B82",
  signal: "#F2C744",
  developer: "#6E8FE5",
  designer: "#C97AB0",
  marketing: "#E08A3C",
  cto: "#6FBFA0",
  cmo: "#9D7AC9",
  ceo: "#F2C744",
};

const ROLE_LABEL: Record<PlaygroundRole, string> = {
  ceo: "CEO",
  cto: "Engineering",
  cmo: "Marketing",
  developer: "Developer",
  designer: "Design",
  marketing: "Marketing",
};

const ROLE_COLOR: Record<PlaygroundRole, string> = {
  ceo: C.ceo,
  cto: C.cto,
  cmo: C.cmo,
  developer: C.developer,
  designer: C.designer,
  marketing: C.marketing,
};

const FONT_SANS = "Geist, system-ui, sans-serif";
const FONT_MONO = "Geist Mono, ui-monospace, monospace";

const panelStyle: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.hairlineDark}`,
  borderRadius: 4,
  color: C.fg1,
  fontFamily: FONT_SANS,
  boxShadow: "0 8px 24px -8px rgba(10,10,10,0.45)",
};

function formatElapsed(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function useElapsedClock(startedAt: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return formatElapsed(now - startedAt);
}

// ─── Top-left: workspace + breadcrumb ─────────────────────────────
export function TopLeftHud({
  workspace,
  sessionStartedAt,
}: {
  workspace: string;
  sessionStartedAt: number;
}) {
  const day = useMemo(() => {
    const d = new Date(sessionStartedAt);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `day 1 · ${hh}:${mm}`;
  }, [sessionStartedAt]);

  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 24,
        display: "flex",
        gap: 12,
        alignItems: "stretch",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          background: C.ink,
          color: C.signal,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_SANS,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "-0.04em",
          borderRadius: 4,
          border: `1px solid ${C.hairlineDark}`,
        }}
      >
        0to1
        <span style={{ color: C.signal }}>.</span>
      </div>
      <div
        style={{
          ...panelStyle,
          padding: "7px 14px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: "0.04em",
              color: C.fg3,
            }}
          >
            /dashboard
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.fg3 }}>›</span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: C.signal,
            }}
          >
            /playground
          </span>
        </div>
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: C.fg1,
            whiteSpace: "nowrap",
            maxWidth: 280,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {workspace}
        </span>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.04em",
            color: C.fg3,
            marginTop: 1,
          }}
        >
          {day}
        </span>
      </div>
    </div>
  );
}

// ─── Top-right: live counts ───────────────────────────────────────
export function TopRightHud({
  agentCount,
  ticketsInFlight,
  sandboxes,
  sessionStartedAt,
}: {
  agentCount: number;
  ticketsInFlight: number;
  sandboxes: number;
  sessionStartedAt: number;
}) {
  const elapsed = useElapsedClock(sessionStartedAt);
  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        right: 24,
        display: "flex",
        gap: 12,
        alignItems: "stretch",
        pointerEvents: "none",
      }}
    >
      <div style={{ ...panelStyle, padding: "10px 18px", display: "flex", gap: 24 }}>
        <Stat label="Agents" value={agentCount} signal />
        <Divider />
        <Stat label="In flight" value={ticketsInFlight} />
        <Divider />
        <Stat label="e2b boxes" value={sandboxes} />
      </div>
      <div
        style={{
          ...panelStyle,
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.18em",
            fontWeight: 600,
            color: C.signal,
          }}
        >
          ● REC
        </span>
        <span style={{ width: 1, height: 16, background: C.hairlineDark }} />
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: "0.18em",
            color: C.fg2,
          }}
        >
          {elapsed}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, signal }: { label: string; value: number; signal?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
        minWidth: 64,
      }}
    >
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.fg3,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        {signal && (
          <span
            className="pulse"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.signal,
            }}
          />
        )}
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: C.fg1,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, background: C.hairlineDark }} />;
}

// ─── Bottom-right: role legend ────────────────────────────────────
export function LegendHud({
  states,
}: {
  states: Record<PlaygroundRole, AgentLiveState> | null;
}) {
  const items = useMemo(() => {
    const order: PlaygroundRole[] = ["developer", "designer", "marketing", "cto", "cmo", "ceo"];
    return order.map((role) => ({
      role,
      color: ROLE_COLOR[role],
      label: ROLE_LABEL[role],
      n: states?.[role] ? 1 : 0,
    }));
  }, [states]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      <div style={{ ...panelStyle, padding: "12px 14px", minWidth: 220 }}>
        <Eyebrow>Legend</Eyebrow>
        <div
          style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 7 }}
        >
          {items.map((it) => (
            <div
              key={it.role}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: it.color,
                  borderRadius: "50%",
                }}
              />
              <span
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  fontWeight: 500,
                  color: C.fg1,
                }}
              >
                {it.label}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: C.fg3,
                }}
              >
                ×{it.n}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: C.hairlineDark, margin: "12px 0 10px" }} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ width: 10, height: 2, background: C.signal }} />
          <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500, color: C.fg1 }}>
            @-mention in flight
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
          <span
            style={{
              width: 10,
              height: 10,
              border: `1.5px dashed ${C.signal}`,
              borderRadius: "50%",
            }}
          />
          <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500, color: C.fg1 }}>
            Active focus ring
          </span>
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: C.fg3,
      }}
    >
      {children}
    </span>
  );
}

// ─── Bottom-left: controls cluster ────────────────────────────────
export function ControlsHud({
  promptRole,
  talking,
}: {
  promptRole: PlaygroundRole | null;
  talking: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 24,
        pointerEvents: "none",
      }}
    >
      <div style={{ ...panelStyle, padding: "14px 14px", minWidth: 240 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Eyebrow>Controls</Eyebrow>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.14em",
              color: C.fg3,
            }}
          >
            FIXED ISO
          </span>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 22px)",
              gridTemplateRows: "repeat(2, 22px)",
              gap: 3,
            }}
          >
            <KeyCap empty />
            <KeyCap label="W" />
            <KeyCap empty />
            <KeyCap label="A" />
            <KeyCap label="S" />
            <KeyCap label="D" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, color: C.fg1 }}>
              Move avatar
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.fg3, letterSpacing: "0.04em" }}>
              walk · arrow keys also work
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${C.hairlineDark}`,
          }}
        >
          <div style={{ display: "flex", gap: 3 }}>
            <KeyCap label="E" small />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                fontWeight: 500,
                color: promptRole && !talking ? C.signal : C.fg1,
              }}
            >
              {talking
                ? "Close conversation"
                : promptRole
                  ? `Talk to ${ROLE_LABEL[promptRole]}`
                  : "Talk to nearest agent"}
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.fg3, letterSpacing: "0.04em" }}>
              walk near a desk · press E
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${C.hairlineDark}`,
          }}
        >
          <div style={{ display: "flex", gap: 3 }}>
            <KeyCap label="ESC" small />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 500, color: C.fg1 }}>
              Close drawer
            </span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.fg3, letterSpacing: "0.04em" }}>
              dismiss agent inspector
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyCap({
  label,
  empty,
  small,
}: {
  label?: string;
  empty?: boolean;
  small?: boolean;
}) {
  const h = small ? 18 : 22;
  const w = small && label && label.length > 1 ? Math.max(28, label.length * 8) : h;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 3,
        border: empty ? "1px solid transparent" : `1px solid ${C.hairlineDark}`,
        background: empty ? "transparent" : C.ink2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_MONO,
        fontSize: small ? 10 : 12,
        fontWeight: 600,
        color: C.fg1,
      }}
    >
      {label || ""}
    </div>
  );
}

// ─── Hover tooltip — floats above the agent's head in the 3D scene ────
const TOOLTIP_TOOLS: Record<PlaygroundRole, string[]> = {
  ceo: ["convex", "analytics", "strategy"],
  cto: ["github", "convex", "vercel"],
  cmo: ["analytics", "posthog", "brand"],
  developer: ["github", "vercel", "e2b", "composio"],
  designer: ["google-ai-studio", "cloudinary", "composio"],
  marketing: ["twitter", "linkedin", "email"],
};

const STATE_LABEL: Record<AgentLiveState["state"], string> = {
  working: "WORKING",
  idle: "IDLE",
  blocked: "BLOCKED",
};

function shortTicketId(id: string | null): string | null {
  if (!id) return null;
  const tail = id.slice(-4).toUpperCase();
  return `TKT-${tail}`;
}

export function HoverTooltip({
  role,
  live,
}: {
  role: PlaygroundRole;
  live: AgentLiveState;
}) {
  const roleColor = ROLE_COLOR[role];
  const roleLabel = ROLE_LABEL[role].toUpperCase();
  const stateLabel = STATE_LABEL[live.state];
  const ticketLabel = shortTicketId(live.currentTicketId);
  const tools = TOOLTIP_TOOLS[role] ?? [];
  const thought =
    live.activeStep?.toolName ??
    live.lastStep?.toolName ??
    (live.isThinking ? "thinking…" : null);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          ...panelStyle,
          minWidth: 320,
          maxWidth: 360,
          overflow: "hidden",
          padding: 0,
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: `1px solid ${C.hairlineDark}`,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: roleColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.16em",
              color: C.fg2,
              whiteSpace: "nowrap",
            }}
          >
            {roleLabel} · {role.charAt(0).toUpperCase()}
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              className={live.state === "working" ? "pulse" : undefined}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background:
                  live.state === "blocked" ? "#C8483A" : C.signal,
              }}
            />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.16em",
                color: live.state === "blocked" ? "#F0A097" : C.signal,
              }}
            >
              {stateLabel}
            </span>
          </div>
        </div>

        <div style={{ padding: "10px 12px" }}>
          {ticketLabel && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: C.signal,
                }}
              >
                {ticketLabel}
              </span>
            </div>
          )}
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "-0.005em",
              lineHeight: 1.35,
              color: C.fg1,
            }}
          >
            {live.currentTicketTitle ?? "No active ticket"}
          </div>
          {thought && (
            <div
              style={{
                marginTop: 8,
                padding: "6px 8px",
                background: C.ink2,
                border: `1px solid ${C.hairlineDark}`,
                borderRadius: 2,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: C.fg2,
                }}
              >
                {thought}
              </span>
            </div>
          )}
          {tools.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              {tools.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "3px 7px",
                    border: `1px solid ${C.hairlineDark}`,
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    color: C.fg2,
                    borderRadius: 1,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leader line — dropping down toward the agent below. */}
      <svg
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        width="20"
        height="40"
        viewBox="0 0 20 40"
      >
        <path
          d="M 10 0 L 10 35"
          stroke={C.signal}
          strokeWidth="1.4"
          strokeDasharray="2 3"
        />
        <circle cx="10" cy="36" r="3" fill={C.signal} stroke={C.ink} strokeWidth="0.8" />
      </svg>
    </div>
  );
}

// ─── Center top: phase + breadcrumb pill ──────────────────────────
export function PhasePill({ phase, label }: { phase: string; label: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        whiteSpace: "nowrap",
        background: C.surface,
        border: `1px solid ${C.hairlineDark}`,
        borderRadius: 4,
        padding: "8px 14px",
        color: C.fg1,
        fontFamily: FONT_SANS,
        boxShadow: "0 8px 24px -8px rgba(10,10,10,0.45)",
        pointerEvents: "none",
      }}
    >
      <span
        className="pulse"
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: C.signal,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: "0.18em",
          color: C.signal,
        }}
      >
        {phase}
      </span>
      <span style={{ color: C.hairlineDark }}>|</span>
      <span
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 500,
          fontSize: 12,
          letterSpacing: "-0.005em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Empty state — centered card over the empty scene ─────────────
export function EmptyStateCard() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          ...panelStyle,
          padding: "28px 32px",
          minWidth: 460,
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-flex", gap: 6, marginBottom: 18 }}>
          {[C.developer, C.designer, C.marketing, C.cto, C.cmo].map((c) => (
            <span
              key={c}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: c,
                opacity: 0.35,
              }}
            />
          ))}
        </div>
        <Eyebrow>Playground</Eyebrow>
        <div style={{ marginTop: 10 }}>
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: C.fg1,
            }}
          >
            No agents deployed
          </span>
        </div>
        <div
          style={{
            marginTop: 8,
            maxWidth: 380,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              fontWeight: 400,
              color: C.fg2,
              lineHeight: 1.5,
            }}
          >
            The floor is yours. Deploy your first agent and watch it pick up tickets, talk to the team,
            and ship work. Everything you&apos;d see in production runs here first.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Orchestrator — pulls live counts and renders the whole overlay ──
export function PlaygroundHud({
  projectId,
  states,
  promptRole,
  talking,
}: {
  projectId: Id<"projects">;
  states: Record<PlaygroundRole, AgentLiveState> | null;
  promptRole: RoleKey | null;
  talking: boolean;
}) {
  const project = useQuery(api.projects.getProject, { projectId });
  const inProgress = useQuery(api.queries.getTicketsByStatus, {
    projectId,
    status: "in_progress",
  });
  const inReview = useQuery(api.queries.getTicketsByStatus, {
    projectId,
    status: "in_review",
  });
  const blocked = useQuery(api.queries.getTicketsByStatus, {
    projectId,
    status: "blocked",
  });

  const agentCount = useMemo(() => {
    if (!states) return 0;
    return Object.values(states).length;
  }, [states]);

  const ticketsInFlight = useMemo(() => {
    if (!inProgress || !inReview || !blocked) return 0;
    return inProgress.length + inReview.length + blocked.length;
  }, [inProgress, inReview, blocked]);

  // "Sandboxes" — count agents that are currently working (proxy for active e2b boxes).
  const sandboxes = useMemo(() => {
    if (!states) return 0;
    return Object.values(states).filter((s) => s.state === "working").length;
  }, [states]);

  const [sessionStartedAt] = useState(() => Date.now());

  // Find a working agent's current ticket to display in the phase pill.
  const phaseLabel = useMemo(() => {
    if (!states) return "Booting agents";
    const working = Object.values(states).find(
      (s) => s.state === "working" && s.currentTicketTitle,
    );
    if (working?.currentTicketTitle) return working.currentTicketTitle;
    if (Object.values(states).some((s) => s.state === "working")) {
      return "Agents in flight";
    }
    return "Awaiting tickets";
  }, [states]);

  const workspace = project?.name ?? "Loading…";

  const promptPlaygroundRole: PlaygroundRole | null =
    promptRole && promptRole !== "user" ? (promptRole as PlaygroundRole) : null;

  const isEmpty = states !== null && agentCount === 0;

  return (
    <>
      <TopLeftHud workspace={workspace} sessionStartedAt={sessionStartedAt} />
      <TopRightHud
        agentCount={agentCount}
        ticketsInFlight={ticketsInFlight}
        sandboxes={sandboxes}
        sessionStartedAt={sessionStartedAt}
      />
      <PhasePill phase="PHASE 03" label={phaseLabel} />
      <ControlsHud promptRole={promptPlaygroundRole} talking={talking} />
      <LegendHud states={states} />
      {isEmpty && <EmptyStateCard />}
    </>
  );
}
