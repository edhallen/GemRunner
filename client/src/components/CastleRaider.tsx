import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CastleRaiderScene } from "./CastleRaiderScene";
import { CastleRaiderHUD } from "./CastleRaiderHUD";
import { SpellingChallengeOverlay } from "./SpellingChallengeOverlay";
import { TouchControls } from "./TouchControls";
import { useTankGame } from "@/lib/stores/useTankGame";
import { CR_GROUND_Y } from "@/lib/constants";

function CameraFollow() {
  const crPlayerX = useTankGame(s => s.crPlayerX);
  const { camera, size } = useThree();

  useFrame(() => {
    const targetX = crPlayerX; // center player on screen

    const grassTileHeight = 0.5;
    const halfVisibleHeight = size.height / (2 * camera.zoom);
    const targetY = CR_GROUND_Y - grassTileHeight + halfVisibleHeight;

    camera.position.x += (targetX - camera.position.x) * 0.12;
    camera.position.y = targetY;
    camera.lookAt(camera.position.x, camera.position.y, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

export function CastleRaider() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, -3.5, 20], zoom: 140, near: 0.1, far: 200 }}
        orthographic
      >
        <CameraFollow />
        <CastleRaiderScene />
      </Canvas>
      <CastleRaiderHUD />
      <SpellingChallengeOverlay />
      <TouchControls mode="castle_raider" />
    </div>
  );
}
