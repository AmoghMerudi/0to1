"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  AGENT_REGISTRY,
  type ToolCategory,
} from "@/lib/dashboard/agent-registry";
import { ROLES, MANAGER, type RoleKey } from "@/lib/dashboard/constants";
import type { AgentLiveState, PlaygroundRole } from "./three/useAgentState";

const C = {
  ink: "#0A0A0A",
  ink2: "#1A1815",
  surface: "#13110E",
  hairlineDark: "#26241F",
  hairline: "#BFBCB1",
  fg1: "#FAFAF7",
  fg2: "#BFBCB1",
  fg3: "#8E8B82",
  signal: "#F2C744",
  signalInk: "#1A1404",
  green: "#7FCFA0",
  greenDot: "#2E8B57",
  red: "#F0A097",
  redDot: "#C8483A",
};

const FONT_SANS = "Geist, system-ui, sans-serif";
const FONT_MONO = "Geist Mono, ui-monospace, monospace";

const ROLE_LABEL: Record<PlaygroundRole, string> = {
  ceo: "CEO",
  cto: "Engineering",
  cmo: "Marketing",
  developer: "Developer",
  designer: "Design",
  marketing: "Marketing",
};

const CATEGORY_LABEL: Record<ToolCategory, string> = {
  ticket: "Ticket ops",
  sandbox: "Sandbox",
  search: "Search",
  communication: "Communication",
  skill: "Skills",
};

const CATEGORY_COLOR: Record<ToolCategory, string> = {
  ticket: "#F2C744",
  sandbox: "#6E8FE5",
  search: "#7FCFA0",
  communication: "#E08AC9",
  skill: "#C97AB0",
};

const TOOL_TAGS: Record<PlaygroundRole, string[]> = {
  ceo: ["convex", "analytics", "strategy"],
  cto: ["github", "convex", "vercel"],
  cmo: ["analytics", "posthog", "brand"],
  developer: ["github", "vercel", "e2b", "composio"],
  designer: ["google-ai-studio", "cloudinary", "composio"],
  marketing: ["twitter", "linkedin", "email"],
};

function Eyebrow({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: color ?? C.fg3,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function AgentInfoDrawer({
  role,
  onClose,
  projectId,
  live,
}: {
  role: RoleKey;
  onClose: () => void;
  projectId?: Id<"projects">;
  live?: AgentLiveState | null;
}) {
  const playgroundRole =
    role !== "user" ? (role as PlaygroundRole) : null;

  const overview = useQuery(api.agentSteps.getAgentsDashboardOverview);
  const steps = useQuery(
    api.queries.getAgentRecentSteps,
    playgroundRole ? { agentId: playgroundRole, limit: 7 } : "skip",
  );
  const mentions = useQuery(
    api.queries.getRecentMentionsByAgent,
    playgroundRole && projectId
      ? { projectId, agentId: playgroundRole, limit: 4 }
      : "skip",
  );

  const stats = useMemo(() => {
    if (!overview || !playgroundRole) {
      return { resolved: 0, active: 0, blocked: 0 };
    }
    const entry = overview.find((o) => o.agentId === playgroundRole);
    return entry?.stats ?? { resolved: 0, active: 0, blocked: 0 };
  }, [overview, playgroundRole]);

  if (role === "user") return null;
  const meta = ROLES[role];
  const detail = AGENT_REGISTRY[role];
  if (!detail || !playgroundRole) return null;
  const manager = MANAGER[role];

  const toolsByCat: Partial<Record<ToolCategory, typeof detail.tools>> = {};
  for (const t of detail.tools) {
    (toolsByCat[t.category] ||= []).push(t);
  }

  const stateLabel =
    live?.state === "blocked"
      ? "BLOCKED"
      : live?.state === "idle"
        ? "IDLE"
        : "WORKING";
  const stateColor =
    live?.state === "blocked"
      ? C.redDot
      : live?.state === "idle"
        ? C.fg3
        : C.signal;
  const stateText =
    live?.state === "blocked"
      ? C.red
      : live?.state === "idle"
        ? C.fg2
        : C.signal;

  const currentTitle = live?.currentTicketTitle ?? null;
  const currentTicketShort = live?.currentTicketId
    ? `TKT-${live.currentTicketId.slice(-4).toUpperCase()}`
    : null;
  const tools = TOOL_TAGS[playgroundRole] ?? [];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 400,
        background: C.surface,
        color: C.fg1,
        borderLeft: `1px solid ${C.hairlineDark}`,
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT_SANS,
        boxShadow: "-20px 0 40px -20px rgba(10,10,10,0.45)",
        zIndex: 50,
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 22px 18px",
          borderBottom: `1px solid ${C.hairlineDark}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <Eyebrow>Agent inspector</Eyebrow>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: C.fg3,
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.16em",
            }}
          >
            ESC ✕
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: meta.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${C.fg1}`,
              fontFamily: FONT_MONO,
              fontSize: 22,
              fontWeight: 700,
              color: meta.fg,
              letterSpacing: "-0.02em",
            }}
          >
            {meta.initial}
          </div>
          <div>
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: C.fg1,
                display: "block",
              }}
            >
              {meta.label}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <span
                className={live?.state === "working" ? "pulse" : undefined}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: stateColor,
                }}
              />
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  color: stateText,
                }}
              >
                {stateLabel}
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  letterSpacing: "0.04em",
                  color: C.fg3,
                }}
              >
                · {ROLE_LABEL[playgroundRole]}
              </span>
            </div>
            {manager && (
              <div
                style={{
                  marginTop: 4,
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  color: C.fg3,
                  letterSpacing: "0.04em",
                }}
              >
                reports to {ROLES[manager].label} · {detail.model}
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            marginTop: 18,
            background: C.hairlineDark,
            border: `1px solid ${C.hairlineDark}`,
          }}
        >
          <StatCell label="Resolved" value={stats.resolved} tone="green" />
          <StatCell label="Active" value={stats.active} tone="signal" />
          <StatCell label="Blocked" value={stats.blocked} tone="red" />
        </div>
      </div>

      {/* Current ticket */}
      <div
        style={{
          padding: "16px 22px",
          borderBottom: `1px solid ${C.hairlineDark}`,
        }}
      >
        <Eyebrow>Current ticket</Eyebrow>
        {currentTitle ? (
          <div
            style={{
              marginTop: 10,
              padding: "12px 14px",
              background: C.ink2,
              border: `1px solid ${C.hairlineDark}`,
              borderLeft: `3px solid ${C.signal}`,
              borderRadius: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {currentTicketShort && (
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    color: C.fg1,
                  }}
                >
                  {currentTicketShort}
                </span>
              )}
              {live?.state === "blocked" && (
                <span
                  style={{
                    padding: "2px 6px",
                    background: C.redDot,
                    color: C.fg1,
                    fontFamily: FONT_MONO,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                  }}
                >
                  BLOCKED
                </span>
              )}
            </div>
            <span
              style={{
                display: "block",
                marginTop: 6,
                fontFamily: FONT_SANS,
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.005em",
                lineHeight: 1.35,
                color: C.fg1,
              }}
            >
              {currentTitle}
            </span>
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
        ) : (
          <div
            style={{
              marginTop: 10,
              padding: "12px 14px",
              background: C.ink2,
              border: `1px dashed ${C.hairlineDark}`,
              borderRadius: 2,
              fontFamily: FONT_MONO,
              fontSize: 11,
              color: C.fg3,
              letterSpacing: "0.04em",
            }}
          >
            no ticket assigned
          </div>
        )}
      </div>

      {/* Recent activity timeline */}
      <div
        style={{
          padding: "16px 22px 12px",
          borderBottom: `1px solid ${C.hairlineDark}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Eyebrow>Recent activity</Eyebrow>
          <span
            className="pulse"
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.16em",
              color: C.signal,
            }}
          >
            ● LIVE
          </span>
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 5,
              top: 6,
              bottom: 6,
              width: 1,
              background: C.hairlineDark,
            }}
          />
          {steps === undefined ? (
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: C.fg3,
                paddingLeft: 24,
              }}
            >
              loading…
            </span>
          ) : steps.length === 0 ? (
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: C.fg3,
                paddingLeft: 24,
              }}
            >
              no recent steps
            </span>
          ) : (
            steps.map((step) => {
              const tone =
                step.status === "failed"
                  ? "red"
                  : step.status === "running"
                    ? "signal"
                    : "green";
              const dotBg =
                tone === "signal"
                  ? C.signal
                  : tone === "green"
                    ? C.greenDot
                    : C.redDot;
              const arrow =
                step.status === "completed"
                  ? "→ OK"
                  : step.status === "failed"
                    ? "→ FAIL"
                    : "running";
              const arrowColor =
                step.status === "completed"
                  ? C.green
                  : step.status === "failed"
                    ? C.red
                    : C.signal;
              return (
                <div
                  key={step._id}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    padding: "6px 0",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: dotBg,
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 10,
                      color: C.fg3,
                      letterSpacing: "0.04em",
                      width: 56,
                      flexShrink: 0,
                    }}
                  >
                    {formatTime(step.startedAt)}
                  </span>
                  <span
                    style={{
                      minWidth: 0,
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: C.fg1,
                      lineHeight: 1.45,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 11,
                        color: C.fg2,
                      }}
                    >
                      {step.toolName}
                    </span>{" "}
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: 10,
                        color: arrowColor,
                        letterSpacing: "0.10em",
                      }}
                    >
                      {arrow}
                    </span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* @-mentions */}
      <div
        style={{
          padding: "14px 22px",
          borderBottom: `1px solid ${C.hairlineDark}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Eyebrow>Recent @-mentions</Eyebrow>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.16em",
              color: C.fg3,
            }}
          >
            {mentions?.length ?? 0}
          </span>
        </div>
        <div
          style={{
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {mentions === undefined ? (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.fg3 }}>
              loading…
            </span>
          ) : mentions.length === 0 ? (
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.fg3 }}>
              no mentions yet
            </span>
          ) : (
            mentions.map((m) => {
              const authorMeta =
                m.author in ROLES
                  ? ROLES[m.author as RoleKey]
                  : null;
              return (
                <div
                  key={m._id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: authorMeta?.color ?? C.fg3,
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      color: C.fg3,
                      letterSpacing: "0.04em",
                      width: 58,
                      flexShrink: 0,
                    }}
                  >
                    {m.author}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      color: C.fg2,
                      lineHeight: 1.4,
                      minWidth: 0,
                      wordBreak: "break-word",
                    }}
                  >
                    {m.content}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Capabilities */}
      <div
        style={{
          padding: "16px 22px",
          borderBottom: `1px solid ${C.hairlineDark}`,
        }}
      >
        <Eyebrow>Capabilities</Eyebrow>
        <div style={{ marginTop: 12 }}>
          {(Object.keys(toolsByCat) as ToolCategory[]).map((cat) => (
            <div key={cat} style={{ marginBottom: 14 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  background: `${CATEGORY_COLOR[cat]}22`,
                  color: CATEGORY_COLOR[cat],
                  border: `1px solid ${CATEGORY_COLOR[cat]}55`,
                  borderRadius: 1,
                  marginBottom: 6,
                }}
              >
                {CATEGORY_LABEL[cat]}
              </span>
              {toolsByCat[cat]!.map((t) => (
                <div
                  key={t.name}
                  style={{
                    padding: "6px 0",
                    borderBottom: `1px solid ${C.hairlineDark}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: 12,
                      color: C.fg1,
                      fontWeight: 600,
                      display: "block",
                    }}
                  >
                    {t.name}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: C.fg3,
                      lineHeight: 1.4,
                      marginTop: 2,
                      display: "block",
                    }}
                  >
                    {t.description}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      {detail.skills.length > 0 && (
        <div
          style={{
            padding: "16px 22px",
            borderBottom: `1px solid ${C.hairlineDark}`,
          }}
        >
          <Eyebrow>Skills</Eyebrow>
          <div style={{ marginTop: 10 }}>
            {detail.skills.map((s) => (
              <div
                key={s.name}
                style={{
                  padding: "8px 10px",
                  background: C.ink2,
                  border: `1px solid ${C.hairlineDark}`,
                  borderRadius: 2,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 12,
                    color: C.signal,
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  {s.name}
                </span>
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    color: C.fg2,
                    lineHeight: 1.4,
                    marginTop: 2,
                    display: "block",
                  }}
                >
                  {s.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: "14px 22px 22px", display: "flex", gap: 6 }}>
        <ActionBtn>+ Inject ticket</ActionBtn>
        <ActionBtn>Open log</ActionBtn>
        <ActionBtn danger>Pause</ActionBtn>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "signal" | "green" | "red";
}) {
  const color =
    tone === "signal" ? C.signal : tone === "green" ? C.green : C.red;
  return (
    <div style={{ background: C.surface, padding: "10px 12px" }}>
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 9,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.fg3,
        }}
      >
        {label}
      </span>
      <div
        style={{
          marginTop: 4,
          display: "flex",
          alignItems: "baseline",
          gap: 5,
        }}
      >
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  danger,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      style={{
        background: "transparent",
        border: `1px solid ${danger ? C.redDot : C.hairline}`,
        color: danger ? C.red : C.fg1,
        padding: "6px 10px",
        fontFamily: FONT_SANS,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        borderRadius: 2,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
