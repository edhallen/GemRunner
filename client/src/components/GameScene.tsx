import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTankGame, type TankType, type PowerUpType } from "@/lib/stores/useTankGame";
import { useKeyboardControls, useTexture } from "@react-three/drei";
import { Controls } from "@/App";

interface Explosion {
  id: string;
  x: number;
  y: number;
  startTime: number;
}

const TANK_IMAGES: Record<TankType, string> = {
  light: "/tanks/tank1.png",
  medium: "/tanks/tank2.png",
  heavy: "/tanks/tank3.png",
  speed: "/tanks/tank4.png"
};

const TANK_SPEEDS: Record<TankType, number> = {
  light: 4,
  medium: 3,
  heavy: 2,
  speed: 5
};

const POWERUP_COLORS: Record<PowerUpType, string> = {
  health: "#22c55e",
  speed: "#fbbf24",
  rapid_fire: "#ef4444"
};

export function GameScene() {
  const {
    playerTank,
    playerX,
    playerY,
    updatePlayerPosition,
    enemies,
    bullets,
    setBullets,
    removeEnemy,
    takeDamage,
    addScore,
    currentLevel,
    setEnemies,
    updateEnemy,
    powerUps,
    setPowerUps,
    collectPowerUp,
    updatePowerUps,
    activePowerUps,
  } = useTankGame();

  const playerRef = useRef<THREE.Sprite>(null);
  const lastShotTime = useRef(0);
  const [, getKeys] = useKeyboardControls<Controls>();
  const [explosions, setExplosions] = useState<Explosion[]>([]);

  useEffect(() => {
    // Increased difficulty: more enemies, higher health, faster speed
    // Enemies now spawn on the RIGHT side (positive X)
    const enemyCount = Math.min(3 + currentLevel * 2, 10);
    const newEnemies = Array.from({ length: enemyCount }, (_, i) => ({
      id: `enemy-${i}-${Date.now()}`,
      x: 8 + Math.random() * 2,
      y: (Math.random() - 0.5) * 16,
      health: 40 + currentLevel * 15,
      speed: 0.7 + currentLevel * 0.3,
      lastShot: 0,
    }));
    setEnemies(newEnemies);
    console.log("Created enemies:", newEnemies.length);

    const powerUpTypes: PowerUpType[] = ["health", "speed", "rapid_fire"];
    const powerUpCount = Math.min(currentLevel, 3);
    const newPowerUps = Array.from({ length: powerUpCount }, (_, i) => ({
      id: `powerup-${i}-${Date.now()}`,
      x: (Math.random() - 0.5) * 16,
      y: (Math.random() - 0.5) * 16,
      type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
      active: true,
    }));
    setPowerUps(newPowerUps);
    console.log("Created power-ups:", newPowerUps.length);
  }, [currentLevel, setEnemies, setPowerUps]);

  useFrame((state, delta) => {
    if (!playerTank) return;

    updatePowerUps();

    const keys = getKeys();
    const speedMultiplier = activePowerUps.has("speed") ? 1.5 : 1;
    const speed = TANK_SPEEDS[playerTank] * delta * speedMultiplier;
    let newX = playerX;
    let newY = playerY;

    // Flipped controls: up/down for vertical movement, left/right for horizontal
    if (keys.forward) {
      newY += speed;
      console.log("Moving up");
    }
    if (keys.back) {
      newY -= speed;
      console.log("Moving down");
    }
    if (keys.left) {
      newX -= speed;
      console.log("Moving left");
    }
    if (keys.right) {
      newX += speed;
      console.log("Moving right");
    }

    newX = Math.max(-9, Math.min(9, newX));
    newY = Math.max(-9, Math.min(9, newY));

    if (newX !== playerX || newY !== playerY) {
      updatePlayerPosition(newX, newY);
    }

    // Shooting logic - player shoots RIGHT (positive X direction)
    let newPlayerBullet = null;
    if (keys.shoot) {
      console.log("Shoot key detected!");
      const now = Date.now();
      const fireRate = activePowerUps.has("rapid_fire") ? 200 : 500;
      if (now - lastShotTime.current > fireRate) {
        console.log("Player shooting! Creating bullet at", playerX, playerY);
        lastShotTime.current = now;
        newPlayerBullet = {
          id: `bullet-${now}`,
          x: playerX + 0.5,
          y: playerY,
          vx: 10,
          vy: 0,
          owner: "player" as const,
        };
        console.log("Created new bullet");
      } else {
        console.log("Shoot on cooldown");
      }
    }

    powerUps.forEach(powerUp => {
      const dx = powerUp.x - playerX;
      const dy = powerUp.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 0.7 && powerUp.active) {
        collectPowerUp(powerUp.id, powerUp.type);
        addScore(50);
      }
    });

    const updatedBullets = bullets
      .map(b => ({
        ...b,
        x: b.x + b.vx * delta,
        y: b.y + b.vy * delta,
      }))
      .filter(b => Math.abs(b.x) < 12 && Math.abs(b.y) < 12);

    const bulletsToRemove = new Set<string>();
    const enemiesToRemove = new Set<string>();

    updatedBullets.forEach(bullet => {
      if (bullet.owner === "player") {
        enemies.forEach(enemy => {
          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 0.8) {
            bulletsToRemove.add(bullet.id);
            const newHealth = enemy.health - 10;
            
            // Create explosion effect
            setExplosions(prev => [...prev, {
              id: `explosion-${Date.now()}-${Math.random()}`,
              x: enemy.x,
              y: enemy.y,
              startTime: Date.now(),
            }]);
            
            if (newHealth <= 0) {
              enemiesToRemove.add(enemy.id);
              addScore(100);
              console.log("Enemy destroyed!");
            } else {
              updateEnemy(enemy.id, { health: newHealth });
            }
          }
        });
      } else {
        const dx = bullet.x - playerX;
        const dy = bullet.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.6) {
          bulletsToRemove.add(bullet.id);
          takeDamage(10);
          console.log("Player hit!");
        }
      }
    });

    enemiesToRemove.forEach(id => removeEnemy(id));

    const finalBullets = updatedBullets.filter(b => !bulletsToRemove.has(b.id));

    enemies.forEach(enemy => {
      const dx = playerX - enemy.x;
      const dy = playerY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0.1) {
        const moveX = (dx / distance) * enemy.speed * delta * 0.3;
        const moveY = (dy / distance) * enemy.speed * delta * 0.3;
        updateEnemy(enemy.id, {
          x: Math.max(-9, Math.min(9, enemy.x + moveX)),
          y: Math.max(-9, Math.min(9, enemy.y + moveY)),
        });
      }

      const now = Date.now();
      if (now - enemy.lastShot > 2000 && distance < 15) {
        updateEnemy(enemy.id, { lastShot: now });
        
        // Enemies shoot LEFT toward the player (negative X)
        const bulletVx = (dx / distance) * 5;
        const bulletVy = (dy / distance) * 5;
        
        finalBullets.push({
          id: `enemy-bullet-${now}-${enemy.id}`,
          x: enemy.x - 0.5,
          y: enemy.y,
          vx: bulletVx,
          vy: bulletVy,
          owner: "enemy",
        });
      }
    });

    // Add new player bullet if one was created
    if (newPlayerBullet) {
      finalBullets.push(newPlayerBullet);
      console.log("Added player bullet to finalBullets, total:", finalBullets.length);
    }

    setBullets(finalBullets);

    // Remove old explosions (after 500ms)
    const now = Date.now();
    setExplosions(prev => prev.filter(exp => now - exp.startTime < 500));

    if (enemies.length === 0 && currentLevel <= 5) {
      setTimeout(() => {
        useTankGame.getState().setPhase("level_complete");
      }, 1000);
    }
  });

  if (!playerTank) return null;

  // Load textures
  const playerTankTexture = useTexture(TANK_IMAGES[playerTank]);
  const enemyTankTexture = useTexture("/tanks/enemy-tank.png");
  const backgroundTexture = useTexture("/backgrounds/desert-background.png");

  return (
    <group>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial map={backgroundTexture} />
      </mesh>

      {/* Player Tank - now uses actual tank image */}
      <sprite position={[playerX, playerY, 0]} ref={playerRef} scale={[2, 2, 1]}>
        <spriteMaterial map={playerTankTexture} transparent={true} />
      </sprite>

      {/* Enemy Tanks - now use actual enemy tank image */}
      {enemies.map(enemy => (
        <group key={enemy.id}>
          <sprite position={[enemy.x, enemy.y, 0]} scale={[2, 2, 1]}>
            <spriteMaterial map={enemyTankTexture} transparent={true} />
          </sprite>
          {/* Health bar */}
          <mesh position={[enemy.x, enemy.y + 1.2, 0]}>
            <planeGeometry args={[1, 0.2]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[enemy.x - 0.5 + (enemy.health / (30 + currentLevel * 10)), enemy.y + 1.2, 0.01]}>
            <planeGeometry args={[(enemy.health / (30 + currentLevel * 10)), 0.15]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>
      ))}

      {bullets.map(bullet => (
        <mesh key={bullet.id} position={[bullet.x, bullet.y, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={bullet.owner === "player" ? "#fbbf24" : "#ef4444"} />
        </mesh>
      ))}

      {powerUps.map(powerUp => (
        <group key={powerUp.id} position={[powerUp.x, powerUp.y, 0]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshBasicMaterial color={POWERUP_COLORS[powerUp.type]} />
          </mesh>
          <mesh position={[0, 0, 0.3]}>
            <boxGeometry args={[0.3, 0.3, 0.1]} />
            <meshBasicMaterial color={POWERUP_COLORS[powerUp.type]} />
          </mesh>
        </group>
      ))}

      {explosions.map(explosion => {
        const age = (Date.now() - explosion.startTime) / 500;
        const scale = 0.3 + age * 2;
        const opacity = Math.max(0, 1 - age);
        
        return (
          <group key={explosion.id} position={[explosion.x, explosion.y, 0.5]}>
            <mesh>
              <circleGeometry args={[scale, 16]} />
              <meshBasicMaterial color="#ff6600" transparent opacity={opacity} />
            </mesh>
            <mesh>
              <circleGeometry args={[scale * 0.7, 16]} />
              <meshBasicMaterial color="#ffff00" transparent opacity={opacity * 1.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
