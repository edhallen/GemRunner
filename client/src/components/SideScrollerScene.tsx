import { useFrame, useLoader } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useTankGame } from "@/lib/stores/useTankGame";
import { useEffect, useRef, useState } from "react";
import { Controls } from "@/App";
import * as THREE from "three";

const GRAVITY = -15;
const JUMP_VELOCITY = 14;
const MOVE_SPEED = 4;
const GROUND_Y = -5;
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
  const takePlatformerDamage = useTankGame(state => state.takePlatformerDamage);

  const [, getKeys] = useKeyboardControls<Controls>();
  const wasJumpPressed = useRef(false);
  const wasMissilePressed = useRef(false);
  const lastDamageTime = useRef(0);
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
  const treeTexture = useLoader(THREE.TextureLoader, "/tree.png");

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
      
      // Play missile firing sound
      if (missileSound.current) {
        missileSound.current.currentTime = 0;
        missileSound.current.play().catch(err => console.log("Missile sound failed:", err));
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

    // Platform collision detection
    let grounded = false;
    let platformTop = -Infinity;
    
    // Check collision with platforms
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

    // Simple bounds (prevent going too far left)
    if (newX < 0) {
      newX = 0;
      newVX = 0;
    }

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
      const dy = newY - newEnemyY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = 0.8; // Minimum allowed distance between sprites

      if (distance < minDistance && enemy.isAlive) {
        // Check if player is jumping on enemy (player above enemy and moving down)
        if (newY > newEnemyY + 0.2 && newVY < 0) {
          // Defeat enemy!
          defeatPlatformerEnemy(enemy.id);
        } else {
          // Calculate overlap and push sprites apart
          const overlap = minDistance - distance;
          const pushX = (dx / distance) * overlap * 0.5;
          const pushY = (dy / distance) * overlap * 0.5;
          
          // Push player away from enemy (prevent overlap)
          newX += pushX;
          newY += pushY;
          
          // Push enemy away from player (prevent overlap)
          updatePlatformerEnemy(enemy.id, { 
            x: newEnemyX - pushX,
            y: newEnemyY - pushY 
          });
          
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
            
            // Apply bounce velocity to player
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

    // Check poop blob collision (player must jump over them)
    platformerPoopBlobs.forEach(blob => {
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
          if (now - lastDamageTime.current > 800) {
            takePlatformerDamage(15);
            lastDamageTime.current = now;
            console.log("Player hit poop blob!");
            
            // Play hit sound effect
            if (hitSound.current) {
              hitSound.current.currentTime = 0;
              hitSound.current.play().catch(err => console.log("Audio play failed:", err));
            }
            
            // Apply knockback
            newVY = 6; // Push player up
          }
        }
      }
    });

    // Check if reached flag (flag is at x = 120)
    if (newX >= 119.5 && !platformerReachedFlag) {
      console.log("Player reached the flag!");
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
          if (missile.x > 130) return false;

          // Check collision with enemies
          for (const enemy of platformerEnemies) {
            if (!enemy.isAlive) continue;

            const dx = missile.x - enemy.x;
            const dy = missile.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 0.8) {
              console.log("Missile hit enemy! Creating explosion at:", enemy.x, enemy.y);
              
              // Create explosion effect
              setExplosions((prev: Explosion[]) => [...prev, {
                id: `explosion-${Date.now()}-${Math.random()}`,
                x: enemy.x,
                y: enemy.y,
                time: Date.now()
              }]);
              
              // Damage enemy instead of instant defeat (1 damage per missile hit)
              damagePlatformerEnemy(enemy.id, 1);
              console.log(`Enemy ${enemy.id} damaged! Health: ${enemy.health - 1}/${enemy.maxHealth}`);
              
              return false; // Remove missile after hit
            }
          }

          return true; // Keep missile
        })
    );
    
    // Clean up old explosions (after 0.5 seconds) - use functional update
    setExplosions((prev: Explosion[]) => {
      if (prev.length === 0) return prev;
      const now = Date.now();
      const filtered = prev.filter((explosion: Explosion) => now - explosion.time < 500);
      return filtered.length === prev.length ? prev : filtered;
    });
  });

  return (
    <group>
      {/* Sky/Background */}
      <mesh position={[60, 1, -5]}>
        <planeGeometry args={[250, 30]} />
        <meshBasicMaterial color="#87CEEB" />
      </mesh>

      {/* Ground */}
      <mesh position={[60, GROUND_Y - 0.5, 0]}>
        <boxGeometry args={[250, 1, 1]} />
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

      {/* Platforms - floating in the sky */}
      {platformerPlatforms.map(platform => (
        <mesh key={platform.id} position={[platform.x, platform.y, -0.2]}>
          <boxGeometry args={[platform.width, platform.height, 1]} />
          <meshBasicMaterial color="#A0522D" />
        </mesh>
      ))}

      {/* Poop Blobs - obstacles on ground that player must jump over */}
      {platformerPoopBlobs.map(blob => (
        <mesh key={blob.id} position={[blob.x, blob.y, -0.15]} scale={[blob.width, blob.height * 0.6, blob.width * 0.8]}>
          <sphereGeometry args={[0.5, 16, 12]} />
          <meshBasicMaterial color="#6B4423" />
        </mesh>
      ))}

      {/* Trees - positioned behind character */}
      {[...Array(25)].map((_, i) => (
        <sprite key={`tree-${i}`} position={[i * 5 + 2, GROUND_Y + 1.5, -0.5]} scale={[3, 3, 1]}>
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
          <sprite key={gem.id} position={[gem.x, gem.y, 0]} scale={[0.6, 0.6, 1]}>
            <spriteMaterial map={gemTexture} transparent={true} />
          </sprite>
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
        } else {
          texture = enemy3Texture;
        }
        
        return (
          <sprite key={enemy.id} position={[enemy.x, enemy.y, 0]} scale={[0.8, 0.8, 1]}>
            <spriteMaterial map={texture} transparent={true} />
          </sprite>
        );
      })}

      {/* Flag (win condition) */}
      <group position={[120, GROUND_Y + 2, 0]}>
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 4]} />
          <meshBasicMaterial color="#654321" />
        </mesh>
        <mesh position={[0.5, 0.5, 0]}>
          <planeGeometry args={[1, 0.8]} />
          <meshBasicMaterial color="#00FF00" side={2} />
        </mesh>
      </group>

      {/* Missiles - bright red rectangles */}
      {platformerMissiles.map(missile => (
        <mesh key={missile.id} position={[missile.x, missile.y, 0.3]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.5, 0.25]} />
          <meshBasicMaterial color="#FF0000" side={THREE.DoubleSide} />
        </mesh>
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
