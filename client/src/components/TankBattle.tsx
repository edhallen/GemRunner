import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Suspense } from "react";
import { GameScene } from "./GameScene";
import { GameHUD } from "./GameHUD";

export function TankBattle() {
  return (
    <>
      <Canvas
        style={{ background: "#1a1a2e" }}
        gl={{ antialias: false, alpha: false }}
      >
        <OrthographicCamera
          makeDefault
          position={[0, 0, 10]}
          zoom={40}
          near={0.1}
          far={1000}
        />
        
        <ambientLight intensity={1} />
        
        <Suspense fallback={null}>
          <GameScene />
        </Suspense>
      </Canvas>
      
      <GameHUD />
    </>
  );
}
