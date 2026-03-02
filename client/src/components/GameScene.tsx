import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTankGame, WORD_BANK, type TankType, type PowerUpType } from "@/lib/stores/useTankGame";
import { useProfiles } from "@/lib/stores/useProfiles";
import { useKeyboardControls, useTexture, Text } from "@react-three/drei";
import { Controls } from "@/App";
import {
  TANK_BULLET_SPEED, TANK_MISSILE_SPEED, TANK_FIRE_RATE_MS,
  TANK_RAPID_FIRE_RATE_MS, TANK_MISSILE_COOLDOWN_MS,
  TANK_ARENA_BOUNDS, TANK_BULLET_BOUNDS,
  TANK_BULLET_DAMAGE, TANK_MISSILE_DAMAGE, TANK_ENEMY_BULLET_DAMAGE,
  TANK_PLAYER_HIT_RADIUS, TANK_ENEMY_HIT_RADIUS, TANK_POWERUP_RADIUS,
  SCORE_TANK_ENEMY_KILL, SCORE_TANK_TARGET_KILL, SCORE_TANK_POWERUP,
  MAX_EXPLOSIONS, EXPLOSION_DURATION_MS,
} from "@/lib/constants";

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
    missileCount,
    fireMissile,
    tankTargetWord,
    setTankTargetWord,
    checkTankTargetHit,
    difficultyLevel,
  } = useTankGame();

  const playerRef = useRef<THREE.Sprite>(null);
  const lastShotTime = useRef(0);
  const lastMissileTime = useRef(0);
  const [, getKeys] = useKeyboardControls<Controls>();
  const [explosions, setExplosions] = useState<Explosion[]>([]);

  const targetWordSpoken = useRef(false);

  useEffect(() => {
    // Enemies: start at 2 and increase by 1 each level (2, 3, 4, 5, 6)
    // Enemies now spawn on the RIGHT side (positive X)
    const enemyCount = 1 + currentLevel;

    // Get words for enemy labels based on difficulty
    const profile = useProfiles.getState().getActiveProfile();
    const effectiveLevel = profile?.wordLevel || 1;
    const levelKey = `level${effectiveLevel}` as keyof typeof WORD_BANK;
    const wordPool: string[] = WORD_BANK[levelKey] || WORD_BANK.level1;

    // Pick unique words for each enemy
    const shuffledWords = [...wordPool].sort(() => Math.random() - 0.5);
    const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    const newEnemies = Array.from({ length: enemyCount }, (_, i) => ({
      id: `enemy-${i}-${Date.now()}`,
      x: 8 + Math.random() * 2,
      y: (Math.random() - 0.5) * 16,
      health: 40 + currentLevel * 15,
      speed: 0.7 + currentLevel * 0.3,
      lastShot: 0,
      word: difficultyLevel === "letters"
        ? ALL_LETTERS[i % ALL_LETTERS.length]
        : shuffledWords[i % shuffledWords.length],
    }));
    setEnemies(newEnemies);

    // Pick a target word from the enemies and speak it
    const targetWord = newEnemies[Math.floor(Math.random() * newEnemies.length)].word;
    if (targetWord) {
      setTankTargetWord(targetWord);
      targetWordSpoken.current = false;
    }

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
  }, [currentLevel, setEnemies, setPowerUps]);

  useFrame((state, delta) => {
    if (!playerTank) return;

    // Speak the target word once
    if (tankTargetWord && !targetWordSpoken.current) {
      targetWordSpoken.current = true;
      try {
        const utterance = new SpeechSynthesisUtterance(tankTargetWord);
        utterance.rate = 0.7;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis unavailable
      }
    }

    updatePowerUps();

    const keys = getKeys();
    const speedMultiplier = activePowerUps.has("speed") ? 1.5 : 1;
    const speed = TANK_SPEEDS[playerTank] * delta * speedMultiplier;
    let newX = playerX;
    let newY = playerY;

    // Flipped controls: up/down for vertical movement, left/right for horizontal
    if (keys.forward) {
      newY += speed;
    }
    if (keys.back) {
      newY -= speed;
    }
    if (keys.left) {
      newX -= speed;
    }
    if (keys.right) {
      newX += speed;
    }

    newX = Math.max(-TANK_ARENA_BOUNDS, Math.min(TANK_ARENA_BOUNDS, newX));
    newY = Math.max(-TANK_ARENA_BOUNDS, Math.min(TANK_ARENA_BOUNDS, newY));

    if (newX !== playerX || newY !== playerY) {
      updatePlayerPosition(newX, newY);
    }

    // Shooting logic - player shoots RIGHT (positive X direction)
    let newPlayerBullet = null;
    if (keys.shoot) {
      const now = Date.now();
      const fireRate = activePowerUps.has("rapid_fire") ? TANK_RAPID_FIRE_RATE_MS : TANK_FIRE_RATE_MS;
      if (now - lastShotTime.current > fireRate) {
        lastShotTime.current = now;
        newPlayerBullet = {
          id: `bullet-${now}`,
          x: playerX + 0.5,
          y: playerY,
          vx: TANK_BULLET_SPEED,
          vy: 0,
          owner: "player" as const,
        };
      }
    }

    // Missile firing logic - M key to fire missiles
    if (keys.missile) {
      const now = Date.now();
      if (now - lastMissileTime.current > TANK_MISSILE_COOLDOWN_MS) {
        if (fireMissile()) {
          lastMissileTime.current = now;
          newPlayerBullet = {
            id: `missile-${now}`,
            x: playerX + 0.5,
            y: playerY,
            vx: TANK_MISSILE_SPEED,
            vy: 0,
            owner: "player" as const,
            isMissile: true,
          };
        }
      }
    }

    powerUps.forEach(powerUp => {
      const dx = powerUp.x - playerX;
      const dy = powerUp.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < TANK_POWERUP_RADIUS && powerUp.active) {
        collectPowerUp(powerUp.id, powerUp.type);
        addScore(SCORE_TANK_POWERUP);
      }
    });

    const updatedBullets = bullets
      .map(b => ({
        ...b,
        x: b.x + b.vx * delta,
        y: b.y + b.vy * delta,
      }))
      .filter(b => Math.abs(b.x) < TANK_BULLET_BOUNDS && Math.abs(b.y) < TANK_BULLET_BOUNDS);

    const bulletsToRemove = new Set<string>();
    const enemiesToRemove = new Set<string>();

    // Two-pass collision: first collect hits, then apply removals.
    // This avoids mutating the arrays mid-iteration.
    updatedBullets.forEach(bullet => {
      if (bullet.owner === "player") {
        enemies.forEach(enemy => {
          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < TANK_ENEMY_HIT_RADIUS) {
            bulletsToRemove.add(bullet.id);
            const damage = bullet.isMissile ? TANK_MISSILE_DAMAGE : TANK_BULLET_DAMAGE;
            const newHealth = enemy.health - damage;
            
            // Create explosion effect
            setExplosions(prev => [...prev.slice(-MAX_EXPLOSIONS + 1), {
              id: `explosion-${Date.now()}-${Math.random()}`,
              x: enemy.x,
              y: enemy.y,
              startTime: Date.now(),
            }]);
            
            if (newHealth <= 0) {
              enemiesToRemove.add(enemy.id);
              // Bonus for hitting the target word enemy
              const isTarget = checkTankTargetHit(enemy.id);
              addScore(isTarget ? SCORE_TANK_TARGET_KILL : SCORE_TANK_ENEMY_KILL);
              if (isTarget) {
                // Pick a new target from remaining enemies
                const remaining = enemies.filter(e => e.id !== enemy.id && !enemiesToRemove.has(e.id));
                if (remaining.length > 0) {
                  const next = remaining[Math.floor(Math.random() * remaining.length)];
                  if (next.word) {
                    setTankTargetWord(next.word);
                    targetWordSpoken.current = false;
                  }
                } else {
                  setTankTargetWord(null);
                }
              }
            } else {
              updateEnemy(enemy.id, { health: newHealth });
            }
          }
        });
      } else {
        const dx = bullet.x - playerX;
        const dy = bullet.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < TANK_PLAYER_HIT_RADIUS) {
          bulletsToRemove.add(bullet.id);
          takeDamage(TANK_ENEMY_BULLET_DAMAGE);
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
          x: Math.max(-TANK_ARENA_BOUNDS, Math.min(TANK_ARENA_BOUNDS, enemy.x + moveX)),
          y: Math.max(-TANK_ARENA_BOUNDS, Math.min(TANK_ARENA_BOUNDS, enemy.y + moveY)),
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
    }

    setBullets(finalBullets);

    // Remove old explosions
    const now = Date.now();
    setExplosions(prev => prev.filter(exp => now - exp.startTime < EXPLOSION_DURATION_MS));

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
      {enemies.map(enemy => {
        const isTarget = tankTargetWord && enemy.word?.toUpperCase() === tankTargetWord.toUpperCase();
        return (
          <group key={enemy.id}>
            <sprite position={[enemy.x, enemy.y, 0]} scale={[2, 2, 1]}>
              <spriteMaterial map={enemyTankTexture} transparent={true} />
            </sprite>
            {/* Word label above enemy */}
            {enemy.word && (
              <Text
                position={[enemy.x, enemy.y + 1.6, 0.5]}
                fontSize={0.5}
                color={isTarget ? "#FFD700" : "#FFFFFF"}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000000"
                fontWeight="bold"
              >
                {enemy.word}
              </Text>
            )}
            {/* Target indicator */}
            {isTarget && (
              <mesh position={[enemy.x, enemy.y - 1.3, 0.1]}>
                <planeGeometry args={[0.6, 0.3]} />
                <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
              </mesh>
            )}
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
        );
      })}

      {bullets.map(bullet => {
        const isMissile = bullet.isMissile;
        const size = isMissile ? 0.3 : 0.15;
        const color = isMissile ? "#a855f7" : (bullet.owner === "player" ? "#fbbf24" : "#ef4444");
        
        return (
          <mesh key={bullet.id} position={[bullet.x, bullet.y, 0]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}

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
