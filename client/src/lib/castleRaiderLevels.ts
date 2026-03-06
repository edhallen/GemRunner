import type {
  CastleRaiderKnight, CastleRaiderGem, CastleRaiderCoin,
  CastleRaiderPit, CRBossConfig, CRKnightType, DifficultyLevel,
} from "./stores/useTankGame";
import type { Platform } from "./stores/useTankGame";
import {
  CR_GROUND_Y,
  CR_BASIC_KNIGHT_HP, CR_BASIC_KNIGHT_SPEED,
  CR_ARMORED_KNIGHT_HP, CR_ARMORED_KNIGHT_SPEED,
  CR_DARK_KNIGHT_HP, CR_DARK_KNIGHT_SPEED,
  CR_SKELETON_HP, CR_SKELETON_SPEED,
  CR_EVIL_KNIGHT_HP, CR_EVIL_KNIGHT_SPEED,
  CR_EVIL_DRAGON_HP, CR_EVIL_DRAGON_SPEED,
  CR_BEAST_HP, CR_BEAST_SPEED,
  CR_GOBLIN_HP, CR_GOBLIN_SPEED,
} from "./constants";

export interface CastleRaiderLevelData {
  levelLength: number;
  knights: CastleRaiderKnight[];
  gems: CastleRaiderGem[];
  coins: CastleRaiderCoin[];
  platforms: Platform[];
  pits: CastleRaiderPit[];
  boss: CRBossConfig;
}

// Level scaling parameters
function getLevelParams(level: number) {
  const t = (level - 1) / 9; // 0 to 1 across 10 levels
  return {
    levelLength: Math.round(240 + 360 * t),   // 240 → 600
    numKnights: Math.round(24 + 96 * t),      // 24 → 120
    numPits: Math.round(1 + 7 * t),           // 1 → 8
    numPlatforms: Math.round(8 + 22 * t),     // 8 → 30
    numGems: Math.round(15 + 35 * t),         // 15 → 50
    numCoins: Math.round(8 + 22 * t),         // 8 → 30
    bossHealth: Math.round(10 + 40 * t),      // 10 → 50
  };
}

// Get terrain height at X, accounting for pits (returns deep Y for pit regions)
export function getCRTerrainHeight(x: number, pits: CastleRaiderPit[]): number {
  for (const pit of pits) {
    if (x >= pit.startX && x <= pit.endX) {
      return CR_GROUND_Y - 10; // Deep pit
    }
  }
  return CR_GROUND_Y;
}

function getKnightConfig(type: CRKnightType): { hp: number; speed: number } {
  switch (type) {
    case "basic_knight": return { hp: CR_BASIC_KNIGHT_HP, speed: CR_BASIC_KNIGHT_SPEED };
    case "armored_knight": return { hp: CR_ARMORED_KNIGHT_HP, speed: CR_ARMORED_KNIGHT_SPEED };
    case "dark_knight": return { hp: CR_DARK_KNIGHT_HP, speed: CR_DARK_KNIGHT_SPEED };
    case "skeleton": return { hp: CR_SKELETON_HP, speed: CR_SKELETON_SPEED };
    case "evil_knight": return { hp: CR_EVIL_KNIGHT_HP, speed: CR_EVIL_KNIGHT_SPEED };
    case "evil_dragon": return { hp: CR_EVIL_DRAGON_HP, speed: CR_EVIL_DRAGON_SPEED };
    case "beast": return { hp: CR_BEAST_HP, speed: CR_BEAST_SPEED };
    case "goblin": return { hp: CR_GOBLIN_HP, speed: CR_GOBLIN_SPEED };
  }
}

export function generateCastleRaiderLevel(level: number, difficulty: DifficultyLevel = "words"): CastleRaiderLevelData {
  const params = getLevelParams(level);
  const { levelLength } = params;

  // Generate pits (skip for letters difficulty)
  const pits: CastleRaiderPit[] = [];
  if (difficulty !== "letters") {
    const pitZoneStart = 15;
    const pitZoneEnd = levelLength - 20; // leave room for boss
    const pitSpacing = (pitZoneEnd - pitZoneStart) / (params.numPits + 1);
    for (let i = 0; i < params.numPits; i++) {
      const centerX = pitZoneStart + pitSpacing * (i + 1);
      const width = 2 + Math.random() * 2; // 2-4 units wide
      pits.push({
        id: `pit-${i}`,
        startX: centerX - width / 2,
        endX: centerX + width / 2,
      });
    }
  }

  // Generate platforms in pairs: a low platform reachable from ground, then a high one reachable from the low
  // Max jump height ~2.7 units, so low platforms at +1.5 to +2.2 above ground, high at +3 to +4
  const platforms: Platform[] = [];
  const platSpacing = (levelLength - 15) / params.numPlatforms;
  for (let i = 0; i < params.numPlatforms; i++) {
    const x = 8 + i * platSpacing + (Math.random() - 0.5) * 3;
    const isLow = i % 2 === 0; // alternate low and high
    const y = isLow
      ? CR_GROUND_Y + 1.5 + Math.random() * 0.7  // low: reachable from ground (+1.5 to +2.2)
      : CR_GROUND_Y + 2.8 + Math.random() * 0.7;  // high: reachable from low platform (+2.8 to +3.5)
    const width = 2 + Math.random() * 2;
    platforms.push({
      id: `cr-plat-${i}`,
      x,
      y,
      width,
      height: 0.5,
    });
  }

  // Determine available knight types based on level
  const knightTypes: CRKnightType[] = ["basic_knight", "skeleton", "evil_knight", "beast", "goblin"];
  if (level >= 3) knightTypes.push("evil_dragon");
  if (level >= 4) knightTypes.push("armored_knight");
  if (level >= 7) knightTypes.push("dark_knight");

  // Generate knights
  const knights: CastleRaiderKnight[] = [];
  const knightZoneEnd = levelLength - 18; // keep boss zone clear
  const knightSpacing = (knightZoneEnd - 10) / Math.max(1, params.numKnights);
  for (let i = 0; i < params.numKnights; i++) {
    const x = 10 + i * knightSpacing + (Math.random() - 0.5) * 3;
    const type = knightTypes[i % knightTypes.length];
    const config = getKnightConfig(type);

    // Check if over a pit - skip placement there
    const overPit = pits.some(p => x >= p.startX - 1 && x <= p.endX + 1);
    if (overPit) continue;

    knights.push({
      id: `knight-${i}`,
      x,
      y: CR_GROUND_Y + 0.5,
      vx: config.speed,
      patrolLeft: Math.max(5, x - 4),
      patrolRight: Math.min(knightZoneEnd, x + 4),
      isAlive: true,
      type,
      health: config.hp,
      maxHealth: config.hp,
      speed: config.speed,
    });
  }

  // Generate gems (on platforms and ground)
  const gems: CastleRaiderGem[] = [];
  let gemId = 0;
  // Gems on platforms
  for (const plat of platforms) {
    const numOnPlat = Math.floor(plat.width / 0.8);
    const startX = plat.x - (numOnPlat - 1) * 0.4;
    for (let i = 0; i < numOnPlat; i++) {
      gems.push({
        id: `cr-gem-${gemId++}`,
        x: startX + i * 0.8,
        y: plat.y + plat.height / 2 + 0.5,
        collected: false,
      });
    }
  }
  // Extra gems scattered on ground
  const extraGems = Math.max(0, params.numGems - gems.length);
  for (let i = 0; i < extraGems; i++) {
    const x = 5 + Math.random() * (levelLength - 25);
    const overPit = pits.some(p => x >= p.startX && x <= p.endX);
    if (overPit) continue;
    gems.push({
      id: `cr-gem-${gemId++}`,
      x,
      y: CR_GROUND_Y + 0.5 + Math.random() * 1.5,
      collected: false,
    });
  }

  // Generate coins
  const coins: CastleRaiderCoin[] = [];
  for (let i = 0; i < params.numCoins; i++) {
    const x = 8 + Math.random() * (levelLength - 28);
    const overPit = pits.some(p => x >= p.startX && x <= p.endX);
    if (overPit) continue;
    coins.push({
      id: `cr-coin-${i}`,
      x,
      y: CR_GROUND_Y + 0.5 + Math.random() * 2,
      collected: false,
    });
  }

  // Boss at end of level
  const boss: CRBossConfig = {
    health: params.bossHealth,
    maxHealth: params.bossHealth,
    x: levelLength - 5,
  };

  return {
    levelLength,
    knights,
    gems,
    coins,
    platforms,
    pits,
    boss,
  };
}
