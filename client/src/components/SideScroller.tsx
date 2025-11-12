import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SideScrollerScene } from "./SideScrollerScene";
import { GameHUD } from "./GameHUD";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useEffect } from "react";

function CameraFollow() {
  const { platformerPlayerX } = useTankGame();
  const { camera } = useThree();

  useFrame(() => {
    // Smooth camera follow with tighter tracking for zoomed view
    const targetX = Math.max(0, platformerPlayerX - 3); // Keep player closer to center
    camera.position.x += (targetX - camera.position.x) * 0.12;
  });

  return null;
}

export function SideScroller() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 20], zoom: 70, near: 0.1, far: 200 }}
        orthographic
      >
        <CameraFollow />
        <SideScrollerScene />
      </Canvas>
      <GameHUD />
    </div>
  );
}
