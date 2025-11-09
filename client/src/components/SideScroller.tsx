import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SideScrollerScene } from "./SideScrollerScene";
import { GameHUD } from "./GameHUD";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useEffect } from "react";

function CameraFollow() {
  const { platformerPlayerX } = useTankGame();
  const { camera } = useThree();

  useFrame(() => {
    // Smooth camera follow
    const targetX = Math.max(0, platformerPlayerX - 5); // Keep player slightly left of center
    camera.position.x += (targetX - camera.position.x) * 0.1;
  });

  return null;
}

export function SideScroller() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 20], zoom: 30, near: 0.1, far: 1000 }}
        orthographic
      >
        <CameraFollow />
        <SideScrollerScene />
      </Canvas>
      <GameHUD />
    </div>
  );
}
