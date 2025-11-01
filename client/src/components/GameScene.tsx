import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTankGame, type TankType, type PowerUpType } from "@/lib/stores/useTankGame";
import { useKeyboardControls } from "@react-three/drei";

const TANK_COLORS: Record<TankType, string> = {
  light: "#4ade80",
  medium: "#60a5fa",
  heavy: "#f87171",
  speed: "#fbbf24"
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

  const playerRef = useRef<THREE.Mesh>(null);
  const lastShotTime = useRef(0);
  const [, getKeys] = useKeyboardControls();

  useEffect(() => {
    const enemyCount = Math.min(2 + currentLevel, 6);
    const newEnemies = Array.from({ length: enemyCount }, (_, i) => ({
      id: `enemy-${i}-${Date.now()}`,
      x: (Math.random() - 0.5) * 18,
      y: 8 + Math.random() * 4,
      health: 30 + currentLevel * 10,
      speed: 0.5 + currentLevel * 0.2,
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

    if (keys.forward) {
      newY += speed;
      console.log("Moving forward");
    }
    if (keys.back) {
      newY -= speed;
      console.log("Moving back");
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

    if (keys.shoot) {
      const now = Date.now();
      const fireRate = activePowerUps.has("rapid_fire") ? 200 : 500;
      if (now - lastShotTime.current > fireRate) {
        console.log("Player shooting!");
        lastShotTime.current = now;
        const newBullet = {
          id: `bullet-${now}`,
          x: playerX,
          y: playerY + 0.5,
          vx: 0,
          vy: 10,
          owner: "player" as const,
        };
        setBullets([...bullets, newBullet]);
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
      if (now - enemy.lastShot > 2000 && distance < 8) {
        updateEnemy(enemy.id, { lastShot: now });
        
        const bulletVx = (dx / distance) * 5;
        const bulletVy = (dy / distance) * 5;
        
        finalBullets.push({
          id: `enemy-bullet-${now}-${enemy.id}`,
          x: enemy.x,
          y: enemy.y,
          vx: bulletVx,
          vy: bulletVy,
          owner: "enemy",
        });
      }
    });

    setBullets(finalBullets);

    if (enemies.length === 0 && currentLevel <= 5) {
      setTimeout(() => {
        useTankGame.getState().setPhase("level_complete");
      }, 1000);
    }
  });

  if (!playerTank) return null;

  return (
    <group>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      <mesh position={[playerX, playerY, 0]} ref={playerRef}>
        <boxGeometry args={[0.8, 1, 0.5]} />
        <meshBasicMaterial color={TANK_COLORS[playerTank]} />
      </mesh>
      <mesh position={[playerX, playerY + 0.6, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshBasicMaterial color={TANK_COLORS[playerTank]} />
      </mesh>

      {enemies.map(enemy => (
        <group key={enemy.id}>
          <mesh position={[enemy.x, enemy.y, 0]}>
            <boxGeometry args={[0.8, 1, 0.5]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
          <mesh position={[enemy.x, enemy.y - 0.6, 0]}>
            <boxGeometry args={[0.3, 0.4, 0.3]} />
            <meshBasicMaterial color="#991b1b" />
          </mesh>
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
    </group>
  );
}
