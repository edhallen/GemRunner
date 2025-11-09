import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useEffect, useRef } from "react";
import { Controls } from "@/App";

const GRAVITY = -15;
const JUMP_VELOCITY = 14;
const MOVE_SPEED = 4;
const GROUND_Y = 0;
const PLAYER_SIZE = 0.5;
const MISSILE_SPEED = 12;

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
  } = useTankGame();

  const [, getKeys] = useKeyboardControls<Controls>();
  const lastJumpRef = useRef(0);
  const lastMissileRef = useRef(0);

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

    // Jumping - only when grounded and not already jumping
    if (keys.shoot && platformerIsGrounded && Date.now() - lastJumpRef.current > 500) {
      newVY = JUMP_VELOCITY;
      lastJumpRef.current = Date.now();
    }

    // Fire missile with 'm' key
    if (keys.missile && Date.now() - lastMissileRef.current > 300) {
      firePlatformerMissile(newX, newY);
      lastMissileRef.current = Date.now();
    }

    // Apply gravity
    if (!platformerIsGrounded) {
      newVY += GRAVITY * delta;
    }

    // Update position
    newX += newVX * delta;
    newY += newVY * delta;

    // Ground collision
    let grounded = false;
    if (newY <= GROUND_Y + PLAYER_SIZE / 2) {
      newY = GROUND_Y + PLAYER_SIZE / 2;
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

      // Update enemy position in store
      updatePlatformerEnemy(enemy.id, { x: newEnemyX, vx: newVx });

      // Check collision with player
      const dx = newX - newEnemyX;
      const dy = newY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.8 && enemy.isAlive) {
        // Check if player is jumping on enemy (player above enemy and moving down)
        if (newY > enemy.y + 0.2 && newVY < 0) {
          // Defeat enemy!
          defeatPlatformerEnemy(enemy.id);
        }
        // If enemy hits player from side, could add damage here
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

    // Check if reached flag (at x = 50 for now)
    if (newX > 45 && !platformerReachedFlag) {
      reachFlag();
    }

    // Update missiles
    const updatedMissiles = platformerMissiles
      .map(missile => ({
        ...missile,
        y: missile.y + MISSILE_SPEED * delta,
      }))
      .filter(missile => {
        // Remove missiles that are off-screen
        if (missile.y > 15) return false;

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
      <mesh position={[25, 5, -5]}>
        <planeGeometry args={[100, 30]} />
        <meshBasicMaterial color="#87CEEB" />
      </mesh>

      {/* Ground */}
      <mesh position={[25, GROUND_Y - 0.5, 0]}>
        <boxGeometry args={[100, 1, 1]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>

      {/* Platform decorations */}
      {[...Array(20)].map((_, i) => (
        <mesh key={`grass-${i}`} position={[i * 5, GROUND_Y, 0.1]}>
          <boxGeometry args={[0.5, 0.3, 0.1]} />
          <meshBasicMaterial color="#228B22" />
        </mesh>
      ))}

      {/* Player */}
      <mesh position={[platformerPlayerX, platformerPlayerY, 0]}>
        <boxGeometry args={[PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE]} />
        <meshBasicMaterial color="#4169E1" />
      </mesh>

      {/* Gems */}
      {platformerGems.map(gem => {
        if (gem.collected) return null;
        return (
          <mesh key={gem.id} position={[gem.x, gem.y, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        );
      })}

      {/* Enemies */}
      {platformerEnemies.map(enemy => {
        if (!enemy.isAlive) return null;
        return (
          <mesh key={enemy.id} position={[enemy.x, enemy.y, 0]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshBasicMaterial color="#FF0000" />
          </mesh>
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
        <mesh key={missile.id} position={[missile.x, missile.y, 0]}>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshBasicMaterial color="#FF6600" />
        </mesh>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </group>
  );
}
