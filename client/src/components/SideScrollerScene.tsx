import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useKeyboardControls, Text } from "@react-three/drei";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controls } from "@/App";
import * as THREE from "three";
import {
  GRAVITY, JUMP_VELOCITY, PLATFORMER_MOVE_SPEED as MOVE_SPEED,
  GROUND_Y, PLAYER_SIZE, PLATFORMER_MISSILE_SPEED as MISSILE_SPEED,
  GEM_COLLECT_RADIUS, ENEMY_COLLISION_RADIUS, ENEMY_STOMP_OFFSET,
  DAMAGE_COOLDOWN_MS, POOP_DAMAGE_COOLDOWN_MS,
  PLAYER_DAMAGE_FROM_ENEMY, PLAYER_DAMAGE_FROM_POOP,
  PLAYER_BOUNCE_VX, PLAYER_BOUNCE_VY, POOP_BOUNCE_VY,
  FLAG_REACH_X, EXPLOSION_DURATION_MS, MAX_EXPLOSIONS,
  HILLS, getTerrainHeight,
} from "@/lib/constants";

// Explosion component with animated scaling/fading using useFrame
function Explosion({ x, y, startTime }: { x: number; y: number; startTime: number }) {
  const group1Ref = useRef<THREE.Mesh>(null);
  const group2Ref = useRef<THREE.Mesh>(null);
  const group3Ref = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    const age = Date.now() - startTime;
    const scale = 1 + (age / 500) * 2;
    const opacity = 1 - (age / 500);
    
    if (group1Ref.current) {
      group1Ref.current.scale.set(scale * 0.5, scale * 0.5, 1);
      (group1Ref.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
    if (group2Ref.current) {
      group2Ref.current.scale.set(scale * 0.7, scale * 0.7, 1);
      (group2Ref.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.7;
    }
    if (group3Ref.current) {
      group3Ref.current.scale.set(scale, scale, 1);
      (group3Ref.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.5;
    }
  });
  
  return (
    <group position={[x, y, 0.8]}>
      <mesh ref={group1Ref}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color="#FF4500" transparent />
      </mesh>
      <mesh ref={group2Ref}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color="#FFA500" transparent />
      </mesh>
      <mesh ref={group3Ref}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color="#FFFF00" transparent />
      </mesh>
    </group>
  );
}

export function SideScrollerScene() {
  const platformerPlayerX = useTankGame(state => state.platformerPlayerX);
  const platformerPlayerY = useTankGame(state => state.platformerPlayerY);
  const platformerPlayerVX = useTankGame(state => state.platformerPlayerVX);
  const platformerPlayerVY = useTankGame(state => state.platformerPlayerVY);
  const platformerIsGrounded = useTankGame(state => state.platformerIsGrounded);
  const platformerEnemies = useTankGame(state => state.platformerEnemies);
  const platformerGems = useTankGame(state => state.platformerGems);
  const platformerPlatforms = useTankGame(state => state.platformerPlatforms);
  const platformerPoopBlobs = useTankGame(state => state.platformerPoopBlobs);
  const platformerMissiles = useTankGame(state => state.platformerMissiles);
  const platformerReachedFlag = useTankGame(state => state.platformerReachedFlag);
  const updatePlatformerPlayer = useTankGame(state => state.updatePlatformerPlayer);
  const updatePlatformerEnemy = useTankGame(state => state.updatePlatformerEnemy);
  const damagePlatformerEnemy = useTankGame(state => state.damagePlatformerEnemy);
  const defeatPlatformerEnemy = useTankGame(state => state.defeatPlatformerEnemy);
  const collectGem = useTankGame(state => state.collectGem);
  const reachFlag = useTankGame(state => state.reachFlag);
  const firePlatformerMissile = useTankGame(state => state.firePlatformerMissile);
  const setPlatformerMissiles = useTankGame(state => state.setPlatformerMissiles);
  const destroyPoopBlob = useTankGame(state => state.destroyPoopBlob);
  const takePlatformerDamage = useTankGame(state => state.takePlatformerDamage);

  const triggerWordDoor = useTankGame(state => state.triggerWordDoor);
  const wordDoorActive = useTankGame(state => state.wordDoorActive);
  const difficultyLevel = useTankGame(state => state.difficultyLevel);
  const currentLevel = useTankGame(state => state.currentLevel);

  const { size, camera } = useThree();
  const [, getKeys] = useKeyboardControls<Controls>();
  const wasJumpPressed = useRef(false);
  const wasMissilePressed = useRef(false);
  const lastDamageTime = useRef(0);
  const lastWordDoorTime = useRef(Date.now());
  const hitSound = useRef<HTMLAudioElement | null>(null);
  const missileSound = useRef<HTMLAudioElement | null>(null);
  
  type Explosion = { id: string; x: number; y: number; time: number };
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  
  // Initialize sound effects
  useEffect(() => {
    hitSound.current = new Audio("/sounds/hit.mp3");
    hitSound.current.volume = 0.3;
    
    missileSound.current = new Audio("/sounds/hit.mp3");
    missileSound.current.volume = 0.5;
  }, []);
  
  // Load textures
  const characterTexture = useLoader(THREE.TextureLoader, "/character.png");
  const gemTexture = useLoader(THREE.TextureLoader, "/gem.png");
  const enemy1Texture = useLoader(THREE.TextureLoader, "/enemy.png");
  const enemy2Texture = useLoader(THREE.TextureLoader, "/enemy2.png");
  const enemy3Texture = useLoader(THREE.TextureLoader, "/enemy3.png");
  const birdTexture = useLoader(THREE.TextureLoader, "/bird.png");
  const treeTexture = useLoader(THREE.TextureLoader, "/tree.png");
  const poopTexture = useLoader(THREE.TextureLoader, "/poop.png");
  const platformTileTexture = useLoader(THREE.TextureLoader, "/platform_tile.png");
  const groundTileTexture = useLoader(THREE.TextureLoader, "/grass.png");
  const randomBg = useMemo(() => {
    const bgs = ["/background2.png", "/background3.png", "/background4.png", "/background5.png", "/background6.png", "/background7.png", "/background8.png", "/background9.png"];
    return bgs[Math.floor(Math.random() * bgs.length)];
  }, [currentLevel]);
  const backgroundTexture = useLoader(THREE.TextureLoader, randomBg);
  const rocketTexture = useLoader(THREE.TextureLoader, "/rocket.png");
  const hillTexture = useLoader(THREE.TextureLoader, "/hill.png");

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
    }
    wasJumpPressed.current = keys.shoot;

    // Fire missile with 'm' key - only trigger on key press (not held)
    if (keys.missile && !wasMissilePressed.current) {
      firePlatformerMissile(newX, newY);
      
      // Play missile firing sound
      if (missileSound.current) {
        missileSound.current.currentTime = 0;
        missileSound.current.play().catch(() => {});
      }
    }
    wasMissilePressed.current = keys.missile;

    // Apply gravity
    if (!platformerIsGrounded) {
      newVY += GRAVITY * delta;
    }

    // Store previous position for collision detection
    const prevY = newY;
    
    // Update position
    newX += newVX * delta;
    newY += newVY * delta;

    // Platform collision: one-way platforms that only block from above.
    // Player can jump through from below but lands when falling onto the surface.
    let grounded = false;
    let platformTop = -Infinity;
    for (const platform of platformerPlatforms) {
      const platformLeft = platform.x - platform.width / 2;
      const platformRight = platform.x + platform.width / 2;
      const platformTopY = platform.y + platform.height / 2;
      const platformBottomY = platform.y - platform.height / 2;
      
      // Check if player is horizontally aligned with platform
      if (newX >= platformLeft && newX <= platformRight) {
        // Check if player crossed the platform surface while falling (prevY was above, newY is at or below)
        if (newVY <= 0 && prevY >= platformTopY && newY <= platformTopY + PLAYER_SIZE / 2) {
          // Land on platform
          platformTop = Math.max(platformTop, platformTopY);
          grounded = true;
        }
      }
    }
    
    // Terrain collision (including hills)
    const terrainHeight = getTerrainHeight(newX);
    
    // Use whichever surface is higher (platform or terrain)
    const finalSurfaceHeight = Math.max(terrainHeight, platformTop);
    
    if (newY <= finalSurfaceHeight + PLAYER_SIZE / 2) {
      newY = finalSurfaceHeight + PLAYER_SIZE / 2;
      newVY = 0;
      grounded = true;
    }

    // Simple bounds (prevent going too far left or too high)
    if (newX < 0) {
      newX = 0;
      newVX = 0;
    }
    // Ceiling clamp: keep player on screen (visible area top ~2.5 units above camera)
    if (newY > 1) {
      newY = 1;
      newVY = 0;
    }

    // Update enemy positions (patrol) - skip distant enemies for collision but still move them
    platformerEnemies.forEach(enemy => {
      if (!enemy.isAlive) return;
      const distToPlayer = Math.abs(enemy.x - newX);

      // Birds fly in arcs, other enemies patrol on ground
      if (enemy.type === 'bird' && enemy.arcStartX !== undefined && enemy.arcEndX !== undefined && enemy.arcHeight !== undefined && enemy.arcTime !== undefined && enemy.arcSpeed !== undefined) {
        // Bird arc movement: birds fly in parabolic arcs between two X points.
        // arcTime progresses 0→1 along the arc; at the endpoints, start/end swap to reverse direction.
        let newArcTime = enemy.arcTime + enemy.arcSpeed * delta;
        
        // Reverse direction when reaching arc bounds
        let arcStartX = enemy.arcStartX;
        let arcEndX = enemy.arcEndX;
        
        if (newArcTime >= 1) {
          newArcTime = 1;
          // Swap start and end to reverse direction
          const temp = arcStartX;
          arcStartX = arcEndX;
          arcEndX = temp;
          newArcTime = 0;
        } else if (newArcTime <= 0) {
          newArcTime = 0;
          // Swap start and end to reverse direction
          const temp = arcStartX;
          arcStartX = arcEndX;
          arcEndX = temp;
          newArcTime = 1;
        }
        
        // Calculate position along arc using parabolic curve
        const arcWidth = Math.abs(arcEndX - arcStartX);
        const normalizedTime = newArcTime; // 0 to 1
        const newEnemyX = arcStartX + (arcEndX - arcStartX) * normalizedTime;
        
        // sin(t*PI) gives a smooth arc: 0 at edges, 1 at center (t=0.5)
        const arcProgress = Math.sin(normalizedTime * Math.PI);
        const newEnemyY = -2 + enemy.arcHeight * arcProgress; // Fly above ground
        
        // Calculate velocity for smooth movement
        const dx = (arcEndX - arcStartX) * enemy.arcSpeed;
        const newVx = dx;
        const dy = enemy.arcHeight * Math.PI * Math.cos(normalizedTime * Math.PI) * enemy.arcSpeed;
        const newVy = dy;
        
        updatePlatformerEnemy(enemy.id, { 
          x: newEnemyX, 
          y: newEnemyY,
          vx: newVx,
          vy: newVy,
          arcTime: newArcTime,
          arcStartX: arcStartX,
          arcEndX: arcEndX,
        });
      } else {
        // Ground enemy patrol movement
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
      }
      
      // Skip player collision for enemies far off-screen
      if (distToPlayer > 15) return;

      // Check collision with player (for all enemy types)
      const currentEnemyX = enemy.x;
      const currentEnemyY = enemy.y;
      const dx = newX - currentEnemyX;
      const dy = newY - currentEnemyY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = ENEMY_COLLISION_RADIUS;

      if (distance < minDistance && enemy.isAlive) {
        // For ground enemies, check if player can jump on them
        if (enemy.type !== 'bird' && newY > currentEnemyY + ENEMY_STOMP_OFFSET && newVY < 0) {
          // Defeat ground enemy by jumping on it!
          defeatPlatformerEnemy(enemy.id);
        } else {
          // Soft collision: push player and enemy apart proportionally to their overlap.
          // This prevents sprites from overlapping while allowing smooth movement.
          const overlap = minDistance - distance;
          const pushX = (dx / distance) * overlap * 0.5;
          const pushY = (dy / distance) * overlap * 0.5;
          
          // Push player away from enemy (prevent overlap)
          newX += pushX;
          newY += pushY;
          
          // Push enemy away from player (prevent overlap) - only for ground enemies
          if (enemy.type !== 'bird') {
            updatePlatformerEnemy(enemy.id, { 
              x: currentEnemyX - pushX,
              y: currentEnemyY - pushY 
            });
          }
          
          // Enemy deals damage (with cooldown to prevent rapid damage)
          const now = Date.now();
          if (now - lastDamageTime.current > DAMAGE_COOLDOWN_MS) {
            takePlatformerDamage(PLAYER_DAMAGE_FROM_ENEMY);
            lastDamageTime.current = now;
            // Play hit sound effect
            if (hitSound.current) {
              hitSound.current.currentTime = 0;
              hitSound.current.play().catch(() => {});
            }
            
            // Apply bounce velocity to player
            const bounceDirection = newX > currentEnemyX ? 1 : -1;
            newVX = bounceDirection * PLAYER_BOUNCE_VX;
            newVY = PLAYER_BOUNCE_VY;
          }
        }
      }
    });

    // Check gem collection (skip distant gems)
    platformerGems.forEach(gem => {
      if (gem.collected) return;
      if (Math.abs(gem.x - newX) > 5) return;

      const dx = newX - gem.x;
      const dy = newY - gem.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < GEM_COLLECT_RADIUS) {
        collectGem(gem.id);
      }
    });

    // Check poop blob collision (skip distant blobs)
    platformerPoopBlobs.forEach(blob => {
      if (Math.abs(blob.x - newX) > 5) return;
      const blobLeft = blob.x - blob.width / 2;
      const blobRight = blob.x + blob.width / 2;
      const blobTop = blob.y + blob.height / 2;
      
      // Check if player is horizontally aligned with blob
      if (newX >= blobLeft && newX <= blobRight) {
        // Check if player is low enough to hit the blob (not jumping high enough)
        // Player needs to be at least 1.5 units above ground to clear the blob
        const playerBottomY = newY - PLAYER_SIZE / 2;
        const clearanceHeight = blobTop + 0.5; // Need to be 0.5 units above blob top to clear it
        
        if (playerBottomY <= clearanceHeight) {
          // Player hit the poop blob! Apply damage with cooldown
          const now = Date.now();
          if (now - lastDamageTime.current > POOP_DAMAGE_COOLDOWN_MS) {
            takePlatformerDamage(PLAYER_DAMAGE_FROM_POOP);
            lastDamageTime.current = now;
            // Play hit sound effect
            if (hitSound.current) {
              hitSound.current.currentTime = 0;
              hitSound.current.play().catch(() => {});
            }
            
            // Apply knockback
            newVY = POOP_BOUNCE_VY;
          }
        }
      }
    });

    // Word door trigger — every ~30 seconds of gameplay (words difficulty only)
    if (difficultyLevel === "words" && !wordDoorActive && Date.now() - lastWordDoorTime.current > 30000) {
      lastWordDoorTime.current = Date.now();
      triggerWordDoor();
    }

    // Check if reached flag (flag is at x = 240)
    if (newX >= FLAG_REACH_X && !platformerReachedFlag) {
      reachFlag();
    }

    // Update player state after all collision resolution
    updatePlatformerPlayer(newX, newY, newVX, newVY, grounded);

    // Update missiles (shoot horizontally to the right)
    // Use functional update to get current missiles from store
    setPlatformerMissiles(
      useTankGame.getState().platformerMissiles
        .map(missile => ({
          ...missile,
          x: missile.x + MISSILE_SPEED * delta,
        }))
        .filter(missile => {
          // Remove missiles that are off-screen (past the level end)
          if (missile.x > 250) return false;

          // Check collision with enemies (skip distant ones)
          for (const enemy of platformerEnemies) {
            if (!enemy.isAlive) continue;
            if (Math.abs(missile.x - enemy.x) > 3) continue;

            const dx = missile.x - enemy.x;
            const dy = missile.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 0.8) {
              // Create explosion effect
              setExplosions((prev: Explosion[]) => [
                ...prev.slice(-MAX_EXPLOSIONS + 1), {
                id: `explosion-${Date.now()}-${Math.random()}`,
                x: enemy.x,
                y: enemy.y,
                time: Date.now()
              }]);
              
              // Damage enemy instead of instant defeat (1 damage per missile hit)
              damagePlatformerEnemy(enemy.id, 1);

              return false; // Remove missile after hit
            }
          }

          // Check collision with poop blobs (allow clearing obstacles)
          for (const blob of platformerPoopBlobs) {
            const blobLeft = blob.x - blob.width / 2;
            const blobRight = blob.x + blob.width / 2;
            const blobTop = blob.y + blob.height;
            const blobBottom = blob.y;

            if (
              missile.x >= blobLeft &&
              missile.x <= blobRight &&
              missile.y >= blobBottom &&
              missile.y <= blobTop
            ) {
              setExplosions((prev: Explosion[]) => [
                ...prev.slice(-MAX_EXPLOSIONS + 1),
                {
                  id: `explosion-${Date.now()}-${Math.random()}`,
                  x: blob.x,
                  y: blob.y + blob.height / 2,
                  time: Date.now(),
                },
              ]);

              destroyPoopBlob(blob.id);
              return false;
            }
          }

          return true; // Keep missile
        })
    );
    
    // Clean up old explosions (after 0.5 seconds) - use functional update
    setExplosions((prev: Explosion[]) => {
      if (prev.length === 0) return prev;
      const now = Date.now();
      const filtered = prev.filter((explosion: Explosion) => now - explosion.time < EXPLOSION_DURATION_MS);
      return filtered.length === prev.length ? prev : filtered;
    });
  });

  return (
    <group>
      {/* Tiled Background - entire image visible vertically, tiles horizontally, aspect ratio preserved */}
      {(() => {
        const viewportHeight = size.height / camera.zoom;
        // Full viewport height so background fills the screen
        const bgHeight = viewportHeight;
        const bgWidth = bgHeight * (2928 / 352); // preserve aspect ratio
        const camY = camera.position.y;
        // Tile enough to cover the full level width
        const tileCount = Math.ceil(260 / bgWidth) + 1;
        return [...Array(tileCount)].map((_, i) => (
          <sprite key={`bg-${i}`} position={[i * bgWidth + bgWidth / 2, camY, -5]} scale={[bgWidth, bgHeight, 1]}>
            <spriteMaterial map={backgroundTexture} transparent={false} />
          </sprite>
        ));
      })()}

      {/* Tiled Ground - preserving grass.png aspect ratio (750:183), top at GROUND_Y */}
      {(() => {
        const tileWidth = 2;
        const tileHeight = tileWidth * (183 / 750);
        const tileY = GROUND_Y - tileHeight / 2; // top of tile aligns with GROUND_Y
        return [...Array(Math.ceil(260 / tileWidth) + 1)].map((_, i) => (
          <sprite key={`ground-${i}`} position={[i * tileWidth + tileWidth / 2, tileY, 0]} scale={[tileWidth, tileHeight, 1]}>
            <spriteMaterial map={groundTileTexture} transparent={true} />
          </sprite>
        ));
      })()}

      {/* Hills - single hill.png sprite per hill, stretched to hill width, aspect ratio preserved for height */}
      {HILLS.map((hill, idx) => {
        const hillWidth = hill.endX - hill.startX;
        const hillHeight = hillWidth * (697 / 1373); // preserve aspect ratio
        const centerX = (hill.startX + hill.endX) / 2;
        return (
          <sprite key={`hill-${idx}`} position={[centerX, GROUND_Y + hillHeight / 2, -0.1]} scale={[hillWidth, hillHeight, 1]}>
            <spriteMaterial map={hillTexture} transparent={true} />
          </sprite>
        );
      })}

      {/* Platforms - floating in the sky */}
      {platformerPlatforms.map(platform => {
        // Each tile is 1 unit wide; show multiple tiles for wider platforms
        const numTiles = Math.ceil(platform.width);
        const tiles = [];
        for (let i = 0; i < numTiles; i++) {
          const tileX = platform.x - platform.width / 2 + 0.5 + i;
          tiles.push(
            <sprite key={`${platform.id}-tile-${i}`} position={[tileX, platform.y, -0.2]} scale={[1, platform.height, 1]}>
              <spriteMaterial map={platformTileTexture} transparent={true} />
            </sprite>
          );
        }
        return <group key={platform.id}>{tiles}</group>;
      })}

      {/* Poop Blobs - obstacles on ground that player must jump over */}
      {platformerPoopBlobs.map(blob => (
        <sprite key={blob.id} position={[blob.x, blob.y + blob.height / 2, -0.15]} scale={[blob.width, blob.height, 1]}>
          <spriteMaterial map={poopTexture} transparent={true} />
        </sprite>
      ))}

      {/* Trees - positioned behind character at ground level */}
      {[...Array(50)].map((_, i) => (
        <sprite key={`tree-${i}`} position={[i * 5 + 2, GROUND_Y + 1, -0.5]} scale={[3, 3, 1]}>
          <spriteMaterial map={treeTexture} transparent={true} />
        </sprite>
      ))}

      {/* Player - raised by 0.3 units so feet aren't covered */}
      <sprite position={[platformerPlayerX, platformerPlayerY + 0.3, 0]} scale={[1.2, 1.2, 1]}>
        <spriteMaterial map={characterTexture} transparent={true} />
      </sprite>

      {/* Gems */}
      {platformerGems.map(gem => {
        if (gem.collected) return null;
        return (
          <group key={gem.id}>
            <sprite position={[gem.x, gem.y, 0]} scale={gem.letter ? [0.7, 0.7, 1] : [0.6, 0.6, 1]}>
              <spriteMaterial map={gemTexture} transparent={true} />
            </sprite>
            {gem.letter && (
              <Text
                position={[gem.x, gem.y + 0.5, 0.5]}
                fontSize={0.35}
                color="#FFD700"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.04}
                outlineColor="#000000"
                fontWeight="bold"
              >
                {gem.letter}
              </Text>
            )}
          </group>
        );
      })}

      {/* Enemies */}
      {platformerEnemies.map(enemy => {
        if (!enemy.isAlive) return null;
        
        // Select texture based on enemy type
        let texture;
        if (enemy.type === 'enemy1') {
          texture = enemy1Texture;
        } else if (enemy.type === 'enemy2') {
          texture = enemy2Texture;
        } else if (enemy.type === 'enemy3') {
          texture = enemy3Texture;
        } else if (enemy.type === 'bird') {
          // Use enemy3 texture as placeholder for bird (can be replaced with bird.png later)
          texture = birdTexture;
        } else {
          texture = enemy1Texture;
        }
        
        return (
          <sprite
            key={enemy.id}
            position={[enemy.x, enemy.y, 0]}
            scale={enemy.type === 'bird' ? [0.7, 0.7, 1] as [number, number, number] : [0.8, 0.8, 1] as [number, number, number]}
          >
            <spriteMaterial map={texture} transparent={true} />
          </sprite>
        );
      })}

      {/* Flag (win condition) */}
      <group position={[240, GROUND_Y + 2, 0]}>
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 4]} />
          <meshBasicMaterial color="#654321" />
        </mesh>
        <mesh position={[0.5, 0.5, 0]}>
          <planeGeometry args={[1, 0.8]} />
          <meshBasicMaterial color="#00FF00" side={2} />
        </mesh>
      </group>

      {/* Missiles - rocket sprites */}
      {platformerMissiles.map(missile => (
        <sprite key={missile.id} position={[missile.x, missile.y, 0.3]} scale={[1, 0.5, 1]}>
          <spriteMaterial map={rocketTexture} transparent={true} />
        </sprite>
      ))}
      
      {/* Explosions */}
      {explosions.map(explosion => (
        <Explosion key={explosion.id} x={explosion.x} y={explosion.y} startTime={explosion.time} />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </group>
  );
}
