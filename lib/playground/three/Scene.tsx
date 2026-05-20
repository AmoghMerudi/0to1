"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PCFShadowMap } from "three";
import type { Id } from "@/convex/_generated/dataModel";
import type { RoleKey } from "@/lib/dashboard/constants";
import { AgentInfoDrawer } from "@/lib/playground/AgentInfoDrawer";
import { HoverTooltip, PlaygroundHud } from "@/lib/playground/PlaygroundHud";
import { Office } from "./Office";
import { Agents } from "./Agents";
import { Player } from "./Player";
import { TicketBoard } from "./TicketBoard";
import { RoomWorkBoards } from "./RoomWorkBoard";
import { MessageProjectiles } from "./MessageProjectile";
import { PLAYER_SPAWN, CAMERA_POSITION, CAMERA_ZOOM, DESKS } from "./layout";
import { useAgentLiveStates, type PlaygroundRole } from "./useAgentState";
import { useTicketMentions } from "./useTicketMentions";

const SCENE_BACKGROUND =
  "radial-gradient(ellipse 90% 70% at 50% 55%, #F2EDE2 0%, #EAE2D0 60%, #DDD3BB 100%)";
const SCENE_VIGNETTE =
  "linear-gradient(180deg, rgba(20,15,5,0.06) 0%, transparent 18%, transparent 82%, rgba(20,15,5,0.08) 100%)";

/**
 * Pins the default camera to a fixed isometric view of the office.
 * Re-applies orientation every frame so any external mutation can't drift the view.
 * Must run inside <Canvas>.
 */
/* eslint-disable react-hooks/immutability -- R3F camera rig pattern requires
   mutating the camera retrieved from useThree; this is the documented R3F idiom. */
function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    camera.position.set(...CAMERA_POSITION);
    if ("zoom" in camera) {
      (camera as { zoom: number }).zoom = CAMERA_ZOOM;
    }
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useFrame(() => {
    camera.position.set(...CAMERA_POSITION);
    if ("zoom" in camera && (camera as { zoom: number }).zoom !== CAMERA_ZOOM) {
      (camera as { zoom: number }).zoom = CAMERA_ZOOM;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(0, 0, 0);
  });

  return null;
}
/* eslint-enable react-hooks/immutability */

export function PlaygroundScene({ projectId }: { projectId: string }) {
  // The route params come through as a plain string; Convex's Id is just a tag.
  const projectConvexId = projectId as unknown as Id<"projects">;

  const states = useAgentLiveStates();
  const mentions = useTicketMentions(projectConvexId);

  const playerPosRef = useRef({ x: PLAYER_SPAWN.x, z: PLAYER_SPAWN.z });
  const [closestRole, setClosestRole] = useState<PlaygroundRole | null>(null);
  const [hoveredRole, setHoveredRole] = useState<PlaygroundRole | null>(null);
  const [talkingTo, setTalkingTo] = useState<RoleKey | null>(null);

  const handleInteract = useCallback((role: PlaygroundRole) => {
    setTalkingTo((prev) => (prev === role ? null : role));
  }, []);

  const handleHoverChange = useCallback(
    (role: PlaygroundRole, hovered: boolean) => {
      setHoveredRole((prev) => {
        if (hovered) return role;
        return prev === role ? null : prev;
      });
    },
    [],
  );

  // ESC closes the drawer (global listener since the canvas may have focus).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTalkingTo(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tooltipState = hoveredRole && !talkingTo ? states?.[hoveredRole] ?? null : null;
  const tooltipAnchor = hoveredRole ? DESKS[hoveredRole] : null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: SCENE_BACKGROUND,
        overflow: "hidden",
      }}
    >
      {/* Top/bottom darkening vignette over the warm floor — keeps HUD legible. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: SCENE_VIGNETTE,
          zIndex: 1,
        }}
      />

      <Canvas
        shadows={{ type: PCFShadowMap }}
        orthographic
        camera={{
          position: CAMERA_POSITION,
          zoom: CAMERA_ZOOM,
          near: 0.1,
          far: 200,
        }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <CameraRig />

        {/* Lights */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[20, 30, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
          shadow-camera-near={1}
          shadow-camera-far={80}
        />
        {/* Soft fill from the opposite side */}
        <directionalLight position={[-20, 20, -10]} intensity={0.35} />

        <Office />
        <TicketBoard projectId={projectConvexId} />
        <RoomWorkBoards states={states} />
        <Agents
          states={states}
          highlightedRole={closestRole}
          onHoverChange={handleHoverChange}
        />
        <Player
          positionRef={playerPosRef}
          onClosestRoleChange={setClosestRole}
          onInteract={handleInteract}
          paused={!!talkingTo}
        />
        <MessageProjectiles events={mentions} playerPosRef={playerPosRef} />

        {tooltipState && tooltipAnchor && (
          <Html
            position={[tooltipAnchor.x, 3.6, tooltipAnchor.z]}
            center
            distanceFactor={undefined}
            zIndexRange={[100, 0]}
            style={{ pointerEvents: "none" }}
          >
            <HoverTooltip role={tooltipState.role} live={tooltipState} />
          </Html>
        )}

        <EffectComposer>
          <Bloom
            intensity={0.25}
            luminanceThreshold={0.85}
            luminanceSmoothing={0.2}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* HUD overlay */}
      <PlaygroundHud
        projectId={projectConvexId}
        states={states}
        promptRole={talkingTo ?? closestRole}
        talking={!!talkingTo}
      />

      {/* Drawer */}
      {talkingTo && talkingTo !== "user" && (
        <AgentInfoDrawer
          role={talkingTo}
          onClose={() => setTalkingTo(null)}
          projectId={projectConvexId}
          live={states?.[talkingTo as PlaygroundRole] ?? null}
        />
      )}
    </div>
  );
}
