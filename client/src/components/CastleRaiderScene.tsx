import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useKeyboardControls, Text } from "@react-three/drei";
import { useTankGame, DRAGON_IMAGES } from "@/lib/stores/useTankGame";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controls } from "@/App";
import * as THREE from "three";
import {
  CR_GRAVITY, CR_JUMP_VELOCITY, CR_MOVE_SPEED, CR_GROUND_Y, CR_PLAYER_SIZE,
  CR_FIREBALL_SPEED, CR_FIREBALL_DAMAGE,
  CR_GEM_COLLECT_RADIUS, CR_COIN_COLLECT_RADIUS, CR_ENEMY_COLLISION_RADIUS,
  CR_DAMAGE_COOLDOWN_MS, CR_PLAYER_DAMAGE_FROM_KNIGHT,
  CR_PLAYER_BOUNCE_VX, CR_PLAYER_BOUNCE_VY,
  CR_BOSS_ZONE_SIZE, CR_BOSS_PROJECTILE_SPEED,
  CR_DARK_KNIGHT_CHARGE_RANGE, CR_DARK_KNIGHT_SPEED, CR_ENEMY_AGGRO_RANGE,
  CR_EVIL_DRAGON_SHOOT_RANGE, CR_EVIL_DRAGON_SHOOT_INTERVAL,
  EXPLOSION_DURATION_MS, MAX_EXPLOSIONS,
} from "@/lib/constants";
import { getCRTerrainHeight } from "@/lib/castleRaiderLevels";

type ExplosionData = { id: string; x: number; y: number; time: number };

function Explosion({ x, y, startTime }: { x: number; y: number; startTime: number }) {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const ref3 = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const age = Date.now() - startTime;
    const scale = 1 + (age / 500) * 2;
    const opacity = 1 - age / 500;
    if (ref1.current) { ref1.current.scale.set(scale * 0.5, scale * 0.5, 1); (ref1.current.material as THREE.MeshBasicMaterial).opacity = opacity; }
    if (ref2.current) { ref2.current.scale.set(scale * 0.7, scale * 0.7, 1); (ref2.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.7; }
    if (ref3.current) { ref3.current.scale.set(scale, scale, 1); (ref3.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.5; }
  });

  return (
    <group position={[x, y, 0.8]}>
      <mesh ref={ref1}><sphereGeometry args={[0.3, 8, 8]} /><meshBasicMaterial color="#FF4500" transparent /></mesh>
      <mesh ref={ref2}><sphereGeometry args={[0.3, 8, 8]} /><meshBasicMaterial color="#FFA500" transparent /></mesh>
      <mesh ref={ref3}><sphereGeometry args={[0.3, 8, 8]} /><meshBasicMaterial color="#FFFF00" transparent /></mesh>
    </group>
  );
}

export function CastleRaiderScene() {
  const crPlayerX = useTankGame(s => s.crPlayerX);
  const crPlayerY = useTankGame(s => s.crPlayerY);
  const crPlayerVX = useTankGame(s => s.crPlayerVX);
  const crPlayerVY = useTankGame(s => s.crPlayerVY);
  const crIsGrounded = useTankGame(s => s.crIsGrounded);
  const crFacingRight = useTankGame(s => s.crFacingRight);
  const crKnights = useTankGame(s => s.crKnights);
  const crGems = useTankGame(s => s.crGems);
  const crCoins = useTankGame(s => s.crCoins);
  const crPlatforms = useTankGame(s => s.crPlatforms);
  const crPits = useTankGame(s => s.crPits);
  const crFireballs = useTankGame(s => s.crFireballs);
  const crBossProjectiles = useTankGame(s => s.crBossProjectiles);
  const crBoss = useTankGame(s => s.crBoss);
  const crBossActive = useTankGame(s => s.crBossActive);
  const crInvincibleUntil = useTankGame(s => s.crInvincibleUntil);
  const crFlightUntil = useTankGame(s => s.crFlightUntil);
  const crLevelLength = useTankGame(s => s.crLevelLength);
  const crSpellingChallengeActive = useTankGame(s => s.crSpellingChallengeActive);
  const difficultyLevel = useTankGame(s => s.difficultyLevel);
  const selectedDragon = useTankGame(s => s.selectedDragon);
  const currentLevel = useTankGame(s => s.currentLevel);

  const updateCRPlayer = useTankGame(s => s.updateCRPlayer);
  const setCRFacing = useTankGame(s => s.setCRFacing);
  const fireCRFireball = useTankGame(s => s.fireCRFireball);
  const setCRFireballs = useTankGame(s => s.setCRFireballs);
  const setCRBossProjectiles = useTankGame(s => s.setCRBossProjectiles);
  const damageCRKnight = useTankGame(s => s.damageCRKnight);
  const collectCRGem = useTankGame(s => s.collectCRGem);
  const collectCRCoin = useTankGame(s => s.collectCRCoin);
  const takeCRDamage = useTankGame(s => s.takeCRDamage);
  const crFallInPit = useTankGame(s => s.crFallInPit);
  const damageCRBoss = useTankGame(s => s.damageCRBoss);
  const updateCRLastSafe = useTankGame(s => s.updateCRLastSafe);
  const setCRBossActive = useTankGame(s => s.setCRBossActive);
  const startSpellingChallenge = useTankGame(s => s.startSpellingChallenge);

  // Load textures (same as Gem Runner)
  const groundTileTexture = useLoader(THREE.TextureLoader, "/grass.png");
  const randomBg = useMemo(() => {
    const bgs = ["/background2.png", "/background3.png", "/background4.png", "/background5.png", "/background6.png", "/background7.png", "/background8.png", "/background9.png"];
    return bgs[Math.floor(Math.random() * bgs.length)];
  }, [currentLevel]);
  const backgroundTexture = useLoader(THREE.TextureLoader, randomBg);
  const dragonTexture = useLoader(THREE.TextureLoader, selectedDragon ? DRAGON_IMAGES[selectedDragon] : "/dragon.png");
  const knightTexture = useLoader(THREE.TextureLoader, "/knight.png");
  const knight2Texture = useLoader(THREE.TextureLoader, "/knight2.png");
  const knight3Texture = useLoader(THREE.TextureLoader, "/knight3.png");
  const skeletonTexture = useLoader(THREE.TextureLoader, "/skeleton.png");
  const evilKnightTexture = useLoader(THREE.TextureLoader, "/evil-knight.png");
  const evilDragonTexture = useLoader(THREE.TextureLoader, "/evil-dragon.png");
  const beastTexture = useLoader(THREE.TextureLoader, "/beast.png");
  const goblinTexture = useLoader(THREE.TextureLoader, "/goblin.png");
  const platformTexture = useLoader(THREE.TextureLoader, "/platform.png");
  const gemTexture = useLoader(THREE.TextureLoader, "/gem.png");
  const coinTexture = useLoader(THREE.TextureLoader, "/coin.png");
  const towerTexture = useLoader(THREE.TextureLoader, "/backgroundtower.png");
  const bossCastleTexture = useLoader(THREE.TextureLoader, "/bosscastle.png");

  const { size, camera } = useThree();
  const [, getKeys] = useKeyboardControls<Controls>();
  const wasJumpPressed = useRef(false);
  const wasFirePressed = useRef(false);
  const lastDamageTime = useRef(0);
  const nextSpellingX = useRef(0); // next X threshold that triggers a spelling challenge
  const lastBossShot = useRef(Date.now());
  const evilDragonLastShot = useRef<Record<string, number>>({});

  const [explosions, setExplosions] = useState<ExplosionData[]>([]);

  // F key activates flight potion
  const useCRFlightPotion = useTankGame(s => s.useCRFlightPotion);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "KeyF" && !e.repeat) {
        useCRFlightPotion();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [useCRFlightPotion]);

  // Set first spelling checkpoint at ~20% of level length on mount
  useEffect(() => {
    const spacing = (crLevelLength - CR_BOSS_ZONE_SIZE) / 5; // 4 challenges, spaced in 5 segments
    nextSpellingX.current = spacing;
  }, [crLevelLength]);

  useFrame((_, delta) => {
    if (crSpellingChallengeActive) return; // Paused during spelling

    const keys = getKeys();
    let newVX = crPlayerVX;
    let newVY = crPlayerVY;
    let newX = crPlayerX;
    let newY = crPlayerY;
    const isFlying = Date.now() < crFlightUntil;

    // Horizontal movement
    if (keys.left) {
      newVX = -CR_MOVE_SPEED;
      setCRFacing(false);
    } else if (keys.right) {
      newVX = CR_MOVE_SPEED;
      setCRFacing(true);
    } else {
      newVX = 0;
    }

    // Jump / flight
    if (isFlying) {
      if (keys.shoot) {
        newVY = CR_MOVE_SPEED; // fly up
      } else if (keys.back) {
        newVY = -CR_MOVE_SPEED; // fly down
      } else {
        newVY = 0; // hover
      }
    } else {
      if (keys.shoot && !wasJumpPressed.current && crIsGrounded) {
        newVY = CR_JUMP_VELOCITY;
      }
      wasJumpPressed.current = keys.shoot;
    }

    // Fire fireball
    if (keys.missile && !wasFirePressed.current) {
      fireCRFireball(newX, newY, crFacingRight);
    }
    wasFirePressed.current = keys.missile;

    // Apply gravity (unless flying)
    if (!isFlying && !crIsGrounded) {
      newVY += CR_GRAVITY * delta;
    }

    const prevY = newY;
    newX += newVX * delta;
    newY += newVY * delta;

    // Platform collision (one-way from above)
    let grounded = false;
    let platformTop = -Infinity;
    for (const plat of crPlatforms) {
      const pLeft = plat.x - plat.width / 2;
      const pRight = plat.x + plat.width / 2;
      const pTop = plat.y + plat.height / 2;
      if (newX >= pLeft && newX <= pRight) {
        if (newVY <= 0 && prevY >= pTop && newY <= pTop + CR_PLAYER_SIZE / 2) {
          platformTop = Math.max(platformTop, pTop);
          grounded = true;
        }
      }
    }

    // Terrain collision (with pits)
    const terrainHeight = getCRTerrainHeight(newX, crPits);
    const finalSurface = Math.max(terrainHeight, platformTop);

    if (newY <= finalSurface + CR_PLAYER_SIZE / 2) {
      newY = finalSurface + CR_PLAYER_SIZE / 2;
      newVY = 0;
      grounded = true;
    }

    // Pit detection
    if (terrainHeight < CR_GROUND_Y - 3 && newY < CR_GROUND_Y - 3 && !isFlying) {
      crFallInPit();
      return;
    }

    // Update safe position when grounded and not over pit
    if (grounded && terrainHeight >= CR_GROUND_Y - 1) {
      updateCRLastSafe(newX, newY);
    }

    // Bounds
    if (newX < 0) { newX = 0; newVX = 0; }
    if (newY > 3) { newY = 3; newVY = 0; }

    // Knight AI and collision
    const state = useTankGame.getState();
    state.crKnights.forEach(knight => {
      if (!knight.isAlive) return;
      const distToPlayer = Math.abs(knight.x - newX);
      if (distToPlayer > 20) return;

      // Chase or patrol
      let knightVX = knight.vx;
      const chasing = currentLevel >= 3 && distToPlayer < CR_ENEMY_AGGRO_RANGE;

      if (chasing) {
        // Chase the player — dark knights charge faster
        const chaseSpeed = knight.type === "dark_knight"
          ? CR_DARK_KNIGHT_SPEED * 2
          : knight.speed * 2;
        knightVX = newX > knight.x ? chaseSpeed : -chaseSpeed;
      }

      // Move knight
      let knightX = knight.x + knightVX * delta * 2;

      // Patrol bounds only apply when not chasing
      if (!chasing && (knightX <= knight.patrolLeft || knightX >= knight.patrolRight)) {
        knightVX = -knightVX;
        knightX = Math.max(knight.patrolLeft, Math.min(knight.patrolRight, knightX));
      }

      const knightTerrain = getCRTerrainHeight(knightX, crPits);
      // Don't walk into pits — stop at edge
      if (knightTerrain < CR_GROUND_Y - 3) {
        knightVX = chasing ? 0 : -knight.vx;
        knightX = knight.x;
      }
      const knightY = Math.max(knightTerrain, CR_GROUND_Y) + 0.5;

      useTankGame.getState().setCRKnights(
        useTankGame.getState().crKnights.map(k =>
          k.id === knight.id ? { ...k, x: knightX, y: knightY, vx: knightVX } : k
        )
      );

      // Collision with player
      const dx = newX - knightX;
      const dy = newY - knightY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CR_ENEMY_COLLISION_RADIUS) {
        const now = Date.now();
        if (now - lastDamageTime.current > CR_DAMAGE_COOLDOWN_MS && now > crInvincibleUntil) {
          takeCRDamage(CR_PLAYER_DAMAGE_FROM_KNIGHT);
          lastDamageTime.current = now;
          const bounceDir = newX > knightX ? 1 : -1;
          newVX = bounceDir * CR_PLAYER_BOUNCE_VX;
          newVY = CR_PLAYER_BOUNCE_VY;
        }
      }

      // Evil dragon shoots fireballs at the player
      if (knight.type === "evil_dragon" && distToPlayer < CR_EVIL_DRAGON_SHOOT_RANGE) {
        const now = Date.now();
        const lastShot = evilDragonLastShot.current[knight.id] || 0;
        if (now - lastShot > CR_EVIL_DRAGON_SHOOT_INTERVAL) {
          evilDragonLastShot.current[knight.id] = now;
          const dirX = newX - knightX;
          const dirY = newY - knightY;
          const len = Math.sqrt(dirX * dirX + dirY * dirY);
          const speed = CR_FIREBALL_SPEED;
          setCRBossProjectiles([
            ...useTankGame.getState().crBossProjectiles,
            {
              id: `edragon-${knight.id}-${now}`,
              x: knightX,
              y: knightY,
              vy: (dirY / len) * speed,
              vx: (dirX / len) * speed,
            },
          ]);
        }
      }
    });

    // Gem collection
    state.crGems.forEach(gem => {
      if (gem.collected || Math.abs(gem.x - newX) > 5) return;
      const dx = newX - gem.x;
      const dy = newY - gem.y;
      if (Math.sqrt(dx * dx + dy * dy) < CR_GEM_COLLECT_RADIUS) {
        collectCRGem(gem.id);
      }
    });

    // Coin collection
    state.crCoins.forEach(coin => {
      if (coin.collected || Math.abs(coin.x - newX) > 5) return;
      const dx = newX - coin.x;
      const dy = newY - coin.y;
      if (Math.sqrt(dx * dx + dy * dy) < CR_COIN_COLLECT_RADIUS) {
        collectCRCoin(coin.id);
      }
    });

    // Boss zone activation
    if (state.crBoss && !crBossActive && newX >= crLevelLength - CR_BOSS_ZONE_SIZE) {
      setCRBossActive(true);
    }

    // Boss projectiles
    if (crBossActive && state.crBoss) {
      const now = Date.now();
      const bossHealthRatio = state.crBoss.health / state.crBoss.maxHealth;
      const shotInterval = 800 + bossHealthRatio * 1200; // faster as health drops: 800-2000ms
      if (now - lastBossShot.current > shotInterval) {
        lastBossShot.current = now;
        // Drop rock from above at random X near boss
        const rockX = state.crBoss.x - 5 + Math.random() * 10;
        setCRBossProjectiles([
          ...useTankGame.getState().crBossProjectiles,
          {
            id: `rock-${now}-${Math.random()}`,
            x: rockX,
            y: 5, // from above screen
            vy: -CR_BOSS_PROJECTILE_SPEED,
          },
        ]);
      }
    }

    // Update boss projectiles
    setCRBossProjectiles(
      useTankGame.getState().crBossProjectiles
        .map(p => ({ ...p, x: p.x + (p.vx || 0) * delta, y: p.y + p.vy * delta }))
        .filter(p => {
          if (p.y < CR_GROUND_Y - 2 || p.x < -5 || p.x > crLevelLength + 5) return false;
          // Hit player?
          const dx = newX - p.x;
          const dy = newY - p.y;
          if (Math.sqrt(dx * dx + dy * dy) < 0.8) {
            const now = Date.now();
            if (now - lastDamageTime.current > CR_DAMAGE_COOLDOWN_MS && now > crInvincibleUntil) {
              takeCRDamage(10);
              lastDamageTime.current = now;
              newVY = CR_PLAYER_BOUNCE_VY;
            }
            return false;
          }
          return true;
        })
    );

    // Spelling challenge trigger — based on player progress through the level
    const bossZoneStart = crLevelLength - CR_BOSS_ZONE_SIZE;
    if (!crSpellingChallengeActive && nextSpellingX.current > 0 && newX >= nextSpellingX.current && newX < bossZoneStart) {
      const spacing = bossZoneStart / 5;
      nextSpellingX.current = nextSpellingX.current + spacing; // advance to next checkpoint
      startSpellingChallenge();
    }

    updateCRPlayer(newX, newY, newVX, newVY, grounded);

    // Update fireballs
    setCRFireballs(
      useTankGame.getState().crFireballs
        .map(fb => ({ ...fb, x: fb.x + fb.vx * delta }))
        .filter(fb => {
          if (fb.x > crLevelLength + 5 || fb.x < -5) return false;

          // Hit knights?
          for (const knight of useTankGame.getState().crKnights) {
            if (!knight.isAlive || Math.abs(fb.x - knight.x) > 2) continue;
            const dx = fb.x - knight.x;
            const dy = fb.y - knight.y;
            if (Math.sqrt(dx * dx + dy * dy) < 0.8) {
              setExplosions(prev => [...prev.slice(-MAX_EXPLOSIONS + 1), {
                id: `exp-${Date.now()}-${Math.random()}`, x: knight.x, y: knight.y, time: Date.now(),
              }]);
              damageCRKnight(knight.id, CR_FIREBALL_DAMAGE);
              return false;
            }
          }

          // Hit boss?
          const boss = useTankGame.getState().crBoss;
          if (boss && crBossActive) {
            const dx = fb.x - boss.x;
            const dy = fb.y - (CR_GROUND_Y + 2);
            if (Math.sqrt(dx * dx + dy * dy) < 2) {
              setExplosions(prev => [...prev.slice(-MAX_EXPLOSIONS + 1), {
                id: `exp-${Date.now()}-${Math.random()}`, x: boss.x, y: CR_GROUND_Y + 2, time: Date.now(),
              }]);
              damageCRBoss(CR_FIREBALL_DAMAGE);
              return false;
            }
          }

          return true;
        })
    );

    // Clean up explosions
    setExplosions(prev => {
      if (prev.length === 0) return prev;
      const now = Date.now();
      const filtered = prev.filter(e => now - e.time < EXPLOSION_DURATION_MS);
      return filtered.length === prev.length ? prev : filtered;
    });
  });

  const isInvincible = Date.now() < crInvincibleUntil;
  const isFlying = Date.now() < crFlightUntil;

  return (
    <group>
      {/* Tiled Background — same as Gem Runner (background4.png) */}
      {(() => {
        const viewportHeight = size.height / camera.zoom;
        const bgHeight = viewportHeight;
        const bgWidth = bgHeight * (2928 / 352); // preserve aspect ratio
        const camY = camera.position.y;
        const tileCount = Math.ceil((crLevelLength + 20) / bgWidth) + 1;
        return [...Array(tileCount)].map((_, i) => (
          <sprite key={`bg-${i}`} position={[i * bgWidth + bgWidth / 2, camY, -5]} scale={[bgWidth, bgHeight, 1]}>
            <spriteMaterial map={backgroundTexture} transparent={false} />
          </sprite>
        ));
      })()}

      {/* Tiled Ground — same as Gem Runner (grass.png), with gaps for pits */}
      {(() => {
        const tileWidth = 2;
        const tileHeight = tileWidth * (183 / 750); // preserve grass.png aspect ratio
        const tileY = CR_GROUND_Y - tileHeight / 2; // top aligns with CR_GROUND_Y
        const tiles = [];
        for (let x = 0; x < crLevelLength + 5; x += tileWidth) {
          const midX = x + tileWidth / 2;
          const inPit = crPits.some(p => midX >= p.startX && midX <= p.endX);
          if (inPit) continue;
          tiles.push(
            <sprite key={`ground-${x}`} position={[midX, tileY, 0]} scale={[tileWidth, tileHeight, 1]}>
              <spriteMaterial map={groundTileTexture} transparent={true} />
            </sprite>
          );
        }
        return tiles;
      })()}

      {/* Pit markers (lava glow at bottom) */}
      {crPits.map(pit => {
        const width = pit.endX - pit.startX;
        const cx = (pit.startX + pit.endX) / 2;
        return (
          <mesh key={pit.id} position={[cx, CR_GROUND_Y - 2, -0.5]}>
            <planeGeometry args={[width, 2]} />
            <meshBasicMaterial color="#ff2200" opacity={0.3} transparent />
          </mesh>
        );
      })}

      {/* Platforms — tiled with platform.png */}
      {crPlatforms.map(plat => {
        const numTiles = Math.ceil(plat.width);
        const tiles = [];
        for (let i = 0; i < numTiles; i++) {
          const tileX = plat.x - plat.width / 2 + 0.5 + i;
          tiles.push(
            <sprite key={`${plat.id}-tile-${i}`} position={[tileX, plat.y, -0.2]} scale={[1, plat.height, 1]}>
              <spriteMaterial map={platformTexture} transparent={true} />
            </sprite>
          );
        }
        return <group key={plat.id}>{tiles}</group>;
      })}

      {/* Castle towers in background (decoration) */}
      {[...Array(Math.ceil(crLevelLength / 30))].map((_, i) => (
        <sprite key={`tower-${i}`} position={[i * 30 + 15, CR_GROUND_Y + 1.5, -2]} scale={[3, 4, 1]}>
          <spriteMaterial map={towerTexture} transparent={true} />
        </sprite>
      ))}

      {/* Dragon player */}
      <mesh
        position={[crPlayerX, crPlayerY + 0.3, 0]}
        scale={[crFacingRight ? 1.2 : -1.2, 1.2, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={dragonTexture}
          transparent={true}
          opacity={isInvincible ? 0.5 + Math.sin(Date.now() / 100) * 0.3 : 1}
          color={isInvincible ? "#ff88ff" : isFlying ? "#88ffff" : "#ffffff"}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Knights */}
      {crKnights.map(knight => {
        if (!knight.isAlive) return null;
        // Select texture by knight type
        let tex = knightTexture;
        if (knight.type === "armored_knight") tex = knight2Texture;
        if (knight.type === "dark_knight") tex = knight3Texture;
        if (knight.type === "skeleton") tex = skeletonTexture;
        if (knight.type === "evil_knight") tex = evilKnightTexture;
        if (knight.type === "evil_dragon") tex = evilDragonTexture;
        if (knight.type === "beast") tex = beastTexture;
        if (knight.type === "goblin") tex = goblinTexture;

        const healthPercent = knight.health / knight.maxHealth;
        const healthColor = healthPercent > 0.5 ? "#22cc22" : healthPercent > 0.25 ? "#cccc22" : "#cc2222";

        return (
          <group key={knight.id} position={[knight.x, knight.y, 0]}>
            {/* Knight — flips based on movement direction */}
            <mesh scale={[knight.vx > 0 ? -0.9 : 0.9, 0.9, 1]}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial map={tex} transparent={true} side={THREE.DoubleSide} />
            </mesh>
            {/* Health bar background */}
            <mesh position={[0, 0.7, 0.2]}>
              <planeGeometry args={[0.8, 0.1]} />
              <meshBasicMaterial color="#333333" />
            </mesh>
            {/* Health bar fill */}
            <mesh position={[-0.4 * (1 - healthPercent), 0.7, 0.3]}>
              <planeGeometry args={[0.8 * healthPercent, 0.08]} />
              <meshBasicMaterial color={healthColor} />
            </mesh>
          </group>
        );
      })}

      {/* Gems */}
      {crGems.map(gem => {
        if (gem.collected) return null;
        return (
          <sprite key={gem.id} position={[gem.x, gem.y, 0]} scale={[0.6, 0.6, 1]}>
            <spriteMaterial map={gemTexture} transparent={true} />
          </sprite>
        );
      })}

      {/* Coins */}
      {crCoins.map(coin => {
        if (coin.collected) return null;
        return (
          <sprite key={coin.id} position={[coin.x, coin.y, 0]} scale={[0.5, 0.5, 1]}>
            <spriteMaterial map={coinTexture} transparent={true} />
          </sprite>
        );
      })}

      {/* Fireballs */}
      {crFireballs.map(fb => (
        <group key={fb.id} position={[fb.x, fb.y, 0.3]}>
          <mesh>
            <circleGeometry args={[0.15, 8]} />
            <meshBasicMaterial color="#ff4400" />
          </mesh>
          <mesh>
            <circleGeometry args={[0.1, 8]} />
            <meshBasicMaterial color="#ffaa00" />
          </mesh>
        </group>
      ))}

      {/* Boss projectiles (rocks) and evil dragon fireballs */}
      {crBossProjectiles.map(p => {
        const isFireball = p.id.startsWith("edragon-");
        return (
          <mesh key={p.id} position={[p.x, p.y, 0.3]}>
            <circleGeometry args={[isFireball ? 0.18 : 0.25, isFireball ? 8 : 6]} />
            <meshBasicMaterial color={isFireball ? "#ff4400" : "#666655"} />
          </mesh>
        );
      })}

      {/* Castle Boss */}
      {crBoss && (
        <group position={[crBoss.x, CR_GROUND_Y + 2, -0.3]}>
          <sprite scale={[5, 5, 1]}>
            <spriteMaterial map={bossCastleTexture} transparent={true} />
          </sprite>
          {/* Boss health bar (always visible when active) */}
          {crBossActive && (
            <>
              <mesh position={[0, 3.5, 0.5]}>
                <planeGeometry args={[3, 0.2]} />
                <meshBasicMaterial color="#333333" />
              </mesh>
              <mesh position={[-1.5 * (1 - crBoss.health / crBoss.maxHealth), 3.5, 0.6]}>
                <planeGeometry args={[3 * (crBoss.health / crBoss.maxHealth), 0.16]} />
                <meshBasicMaterial color="#cc2222" />
              </mesh>
              <Text position={[0, 3.9, 0.5]} fontSize={0.3} color="#ff4444" anchorX="center" fontWeight="bold">
                CASTLE BOSS
              </Text>
            </>
          )}
        </group>
      )}

      {/* Explosions */}
      {explosions.map(e => (
        <Explosion key={e.id} x={e.x} y={e.y} startTime={e.time} />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} />
    </group>
  );
}
