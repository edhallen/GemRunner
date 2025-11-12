import { useFrame, useLoader } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useEffect, useRef } from "react";
import { Controls } from "@/App";
import * as THREE from "three";

const GRAVITY = -15;
const JUMP_VELOCITY = 14;
const MOVE_SPEED = 4;
const GROUND_Y = -2;
const PLAYER_SIZE = 0.5;
const MISSILE_SPEED = 12;

// Hill terrain data - [startX, endX, height]
const HILLS = [
  { startX: 8, endX: 14, height: 1.5 },
  { startX: 20, endX: 28, height: 2.5 },
  { startX: 35, endX: 42, height: 1.8 },
];

// Function to get terrain height at a given X position
const getTerrainHeight = (x: number): number => {
  for (const hill of HILLS) {
    if (x >= hill.startX && x <= hill.endX) {
      // Simple linear interpolation for hill slopes
      const hillCenter = (hill.startX + hill.endX) / 2;
      const hillWidth = hill.endX - hill.startX;
      const distFromCenter = Math.abs(x - hillCenter);
      const normalizedDist = distFromCenter / (hillWidth / 2);
      // Smooth hill curve using cosine
      const heightMultiplier = Math.cos(normalizedDist * Math.PI / 2);
      return GROUND_Y + hill.height * heightMultiplier;
    }
  }
  return GROUND_Y;
};

export function SideScrollerScene() {
  const {
    platformerPlayerX,
    platformerPlayerY,
    platformerPlayerVX,
    platformerPlayerVY,
    platformerIsGrounded,
    platformerEnemies,
    platformerGems,
    platformerMissiles,
    platformerReachedFlag,
    updatePlatformerPlayer,
    updatePlatformerEnemy,
    defeatPlatformerEnemy,
    collectGem,
    reachFlag,
    firePlatformerMissile,
    setPlatformerMissiles,
    takePlatformerDamage,
  } = useTankGame();

  const [, getKeys] = useKeyboardControls<Controls>();
  const wasJumpPressed = useRef(false);
  const wasMissilePressed = useRef(false);
  const lastDamageTime = useRef(0);
  const hitSound = useRef<HTMLAudioElement | null>(null);
  
  // Initialize sound effect
  useEffect(() => {
    hitSound.current = new Audio("/sounds/hit.mp3");
    hitSound.current.volume = 0.3;
  }, []);
  
  // Load textures
  const characterTexture = useLoader(THREE.TextureLoader, "/character.png");
  const gemTexture = useLoader(THREE.TextureLoader, "/gem.png");
  const enemyTexture = useLoader(THREE.TextureLoader, "/enemy.png");

  useFrame((_, delta) => {
    if (platformerReachedFlag) return;

    const keys = getKeys();
    let newVX = platformerPlayerVX;
    let newVY = platformerPlayerVY;
    let newX = platformerPlayerX;
    let newY = platformerPlayerY;

    // Horizontal movement
    if (keys.left) {
      newVX = -MOVE_SPEED;
    } else if (keys.right) {
      newVX = MOVE_SPEED;
    } else {
      newVX = 0; // Stop when no key pressed
    }

    // Jumping - only trigger on key press (not held)
    if (keys.shoot && !wasJumpPressed.current && platformerIsGrounded) {
      newVY = JUMP_VELOCITY;
      console.log("Jump triggered!");
    }
    wasJumpPressed.current = keys.shoot;

    // Fire missile with 'm' key - only trigger on key press (not held)
    if (keys.missile && !wasMissilePressed.current) {
      console.log("Missile fired at position:", newX, newY);
      firePlatformerMissile(newX, newY);
    }
    wasMissilePressed.current = keys.missile;

    // Apply gravity
    if (!platformerIsGrounded) {
      newVY += GRAVITY * delta;
    }

    // Update position
    newX += newVX * delta;
    newY += newVY * delta;

    // Terrain collision (including hills)
    const terrainHeight = getTerrainHeight(newX);
    let grounded = false;
    if (newY <= terrainHeight + PLAYER_SIZE / 2) {
      newY = terrainHeight + PLAYER_SIZE / 2;
      newVY = 0;
      grounded = true;
    }

    // Simple bounds (prevent going too far left)
    if (newX < 0) {
      newX = 0;
      newVX = 0;
    }

    updatePlatformerPlayer(newX, newY, newVX, newVY, grounded);

    // Update enemy positions (patrol)
    platformerEnemies.forEach(enemy => {
      if (!enemy.isAlive) return;

      let newEnemyX = enemy.x + enemy.vx * delta * 2;
      let newVx = enemy.vx;

      // Reverse at patrol bounds
      if (newEnemyX <= enemy.patrolLeft || newEnemyX >= enemy.patrolRight) {
        newVx = -newVx;
        newEnemyX = Math.max(enemy.patrolLeft, Math.min(enemy.patrolRight, newEnemyX));
      }

      // Enemies follow terrain (walk on hills)
      const enemyTerrainHeight = getTerrainHeight(newEnemyX);
      const newEnemyY = enemyTerrainHeight + 0.5;

      // Update enemy position in store
      updatePlatformerEnemy(enemy.id, { x: newEnemyX, vx: newVx, y: newEnemyY });

      // Check collision with player
      const dx = newX - newEnemyX;
      const dy = newY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.8 && enemy.isAlive) {
        // Check if player is jumping on enemy (player above enemy and moving down)
        if (newY > enemy.y + 0.2 && newVY < 0) {
          // Defeat enemy!
          defeatPlatformerEnemy(enemy.id);
        } else {
          // Enemy deals damage (with cooldown to prevent rapid damage)
          const now = Date.now();
          if (now - lastDamageTime.current > 1000) {
            takePlatformerDamage(10);
            lastDamageTime.current = now;
            console.log("Player took damage from enemy!");
            
            // Play hit sound effect
            if (hitSound.current) {
              hitSound.current.currentTime = 0;
              hitSound.current.play().catch(err => console.log("Audio play failed:", err));
            }
            
            // Bounce player back based on enemy position
            const bounceDirection = newX > newEnemyX ? 1 : -1;
            newVX = bounceDirection * 8; // Push player back
            newVY = 6; // Give slight upward velocity for bounce effect
          }
        }
      }
    });

    // Check gem collection
    platformerGems.forEach(gem => {
      if (gem.collected) return;

      const dx = newX - gem.x;
      const dy = newY - gem.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.6) {
        collectGem(gem.id);
      }
    });

    // Check if reached flag (flag is at x = 48)
    if (newX >= 47.5 && !platformerReachedFlag) {
      console.log("Player reached the flag!");
      reachFlag();
    }

    // Update missiles (shoot horizontally to the right)
    const updatedMissiles = platformerMissiles
      .map(missile => ({
        ...missile,
        x: missile.x + MISSILE_SPEED * delta,
      }))
      .filter(missile => {
        // Remove missiles that are off-screen (past the level end)
        if (missile.x > 60) return false;

        // Check collision with enemies
        for (const enemy of platformerEnemies) {
          if (!enemy.isAlive) continue;

          const dx = missile.x - enemy.x;
          const dy = missile.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 0.8) {
            defeatPlatformerEnemy(enemy.id);
            return false; // Remove missile after hit
          }
        }

        return true; // Keep missile
      });

    setPlatformerMissiles(updatedMissiles);
  });

  return (
    <group>
      {/* Sky/Background */}
      <mesh position={[25, 1, -5]}>
        <planeGeometry args={[100, 30]} />
        <meshBasicMaterial color="#87CEEB" />
      </mesh>

      {/* Ground */}
      <mesh position={[25, GROUND_Y - 0.5, 0]}>
        <boxGeometry args={[100, 1, 1]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>

      {/* Hills - create visual representation that matches collision */}
      {HILLS.map((hill, idx) => {
        // Create hill shape using multiple segments to match cosine curve
        const segments = 12;
        const width = hill.endX - hill.startX;
        const segmentWidth = width / segments;
        
        return (
          <group key={`hill-${idx}`}>
            {[...Array(segments)].map((_, i) => {
              const x = hill.startX + i * segmentWidth + segmentWidth / 2;
              const terrainHeight = getTerrainHeight(x);
              const actualHeight = terrainHeight - GROUND_Y;
              
              return (
                <mesh key={i} position={[x, GROUND_Y + actualHeight / 2, -0.1]}>
                  <boxGeometry args={[segmentWidth * 1.1, actualHeight, 1]} />
                  <meshBasicMaterial color="#6B8E23" />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Platform decorations */}
      {[...Array(20)].map((_, i) => (
        <mesh key={`grass-${i}`} position={[i * 5, GROUND_Y + 0.15, 0.1]}>
          <boxGeometry args={[0.5, 0.3, 0.1]} />
          <meshBasicMaterial color="#228B22" />
        </mesh>
      ))}

      {/* Player - raised by 0.3 units so feet aren't covered */}
      <sprite position={[platformerPlayerX, platformerPlayerY + 0.3, 0]} scale={[1.2, 1.2, 1]}>
        <spriteMaterial map={characterTexture} transparent={true} />
      </sprite>

      {/* Gems */}
      {platformerGems.map(gem => {
        if (gem.collected) return null;
        return (
          <sprite key={gem.id} position={[gem.x, gem.y, 0]} scale={[0.6, 0.6, 1]}>
            <spriteMaterial map={gemTexture} transparent={true} />
          </sprite>
        );
      })}

      {/* Enemies */}
      {platformerEnemies.map(enemy => {
        if (!enemy.isAlive) return null;
        return (
          <sprite key={enemy.id} position={[enemy.x, enemy.y, 0]} scale={[0.8, 0.8, 1]}>
            <spriteMaterial map={enemyTexture} transparent={true} />
          </sprite>
        );
      })}

      {/* Flag (win condition) */}
      <group position={[48, GROUND_Y + 2, 0]}>
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 4]} />
          <meshBasicMaterial color="#654321" />
        </mesh>
        <mesh position={[0.5, 0.5, 0]}>
          <planeGeometry args={[1, 0.8]} />
          <meshBasicMaterial color="#00FF00" side={2} />
        </mesh>
      </group>

      {/* Missiles */}
      {platformerMissiles.map(missile => (
        <mesh key={missile.id} position={[missile.x, missile.y, 0.5]}>
          <boxGeometry args={[0.5, 0.2, 0.2]} />
          <meshBasicMaterial color="#FFFF00" />
        </mesh>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </group>
  );
}
