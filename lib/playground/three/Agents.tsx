"use client";

import { DESKS } from "./layout";
import { AgentDesk } from "./AgentDesk";
import type { AgentLiveState, PlaygroundRole } from "./useAgentState";

export function Agents({
  states,
  highlightedRole,
  onHoverChange,
}: {
  states: Record<PlaygroundRole, AgentLiveState> | null;
  highlightedRole: PlaygroundRole | null;
  onHoverChange?: (role: PlaygroundRole, hovered: boolean) => void;
}) {
  return (
    <group>
      {(Object.keys(DESKS) as PlaygroundRole[]).map((role) => (
        <AgentDesk
          key={role}
          role={role}
          anchor={DESKS[role]}
          live={states?.[role] ?? null}
          highlighted={highlightedRole === role}
          onHoverChange={onHoverChange}
        />
      ))}
    </group>
  );
}
