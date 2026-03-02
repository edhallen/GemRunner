import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SideScrollerScene } from "./SideScrollerScene";
import { GameHUD } from "./GameHUD";
import { TouchControls } from "./TouchControls";
import { useTankGame } from "@/lib/stores/useTankGame";

function CameraFollow() {
  const { platformerPlayerX } = useTankGame();
  const { camera } = useThree();

  useFrame(() => {
    // Smooth camera follow with forward look-ahead for Mario/Sonic-style visibility
    const targetX = platformerPlayerX + 2; // Position player left-of-center for forward visibility
    
    // Only follow horizontally - keep Y fixed
    camera.position.x += (targetX - camera.position.x) * 0.12;
    // camera.position.y stays fixed at initial value
    
    // Make camera look at the main gameplay region (keep Y fixed)
    camera.lookAt(targetX, camera.position.y, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

export function SideScroller() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, -3.5, 20], zoom: 170, near: 0.1, far: 200 }}
        orthographic
      >
        <CameraFollow />
        <SideScrollerScene />
      </Canvas>
      <GameHUD />
      <TouchControls mode="platformer" />
    </div>
  );
}
