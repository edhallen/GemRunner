import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SideScrollerScene } from "./SideScrollerScene";
import { GameHUD } from "./GameHUD";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useEffect } from "react";

function CameraFollow() {
  const { platformerPlayerX } = useTankGame();
  const { camera } = useThree();

  useFrame(() => {
    // Smooth camera follow with forward look-ahead for Mario/Sonic-style visibility
    const targetX = platformerPlayerX + 2; // Position player left-of-center for 6-8 units forward visibility
    camera.position.x += (targetX - camera.position.x) * 0.12;
  });

  return null;
}

export function SideScroller() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, -3.5, 20], zoom: 150, near: 0.1, far: 200 }}
        orthographic
      >
        <CameraFollow />
        <SideScrollerScene />
      </Canvas>
      <GameHUD />
    </div>
  );
}
