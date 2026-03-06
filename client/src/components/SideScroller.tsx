import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SideScrollerScene } from "./SideScrollerScene";
import { GameHUD } from "./GameHUD";
import { TouchControls } from "./TouchControls";
import { WordDoorOverlay } from "./WordDoorOverlay";
import { useTankGame } from "@/lib/stores/useTankGame";
import { GROUND_Y } from "@/lib/constants";

function CameraFollow() {
  const { platformerPlayerX } = useTankGame();
  const { camera, size } = useThree();

  useFrame(() => {
    // Smooth camera follow with forward look-ahead for Mario/Sonic-style visibility
    const targetX = platformerPlayerX + 2; // Position player left-of-center for forward visibility

    // Pin bottom of grass tile at screen bottom
    // Grass tile bottom is at GROUND_Y - tileHeight (tileHeight = 2 * 183/750 ≈ 0.49)
    const grassTileHeight = 2 * (183 / 750);
    const halfVisibleHeight = size.height / (2 * camera.zoom);
    const targetY = GROUND_Y - grassTileHeight + halfVisibleHeight;

    // Smooth horizontal follow, snap vertical to keep ground fixed at bottom
    camera.position.x += (targetX - camera.position.x) * 0.12;
    camera.position.y = targetY;

    // Make camera look at where it's positioned
    camera.lookAt(camera.position.x, camera.position.y, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

export function SideScroller() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, -3.5, 20], zoom: 140, near: 0.1, far: 200 }}
        orthographic
      >
        <CameraFollow />
        <SideScrollerScene />
      </Canvas>
      <GameHUD />
      <WordDoorOverlay />
      <TouchControls mode="platformer" />
    </div>
  );
}
