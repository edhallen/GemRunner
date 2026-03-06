// ── Platformer physics ──
export const GRAVITY = -15;
export const JUMP_VELOCITY = 9;
export const PLATFORMER_MOVE_SPEED = 4;
export const GROUND_Y = -5;
export const PLAYER_SIZE = 0.5;
export const PLATFORMER_MISSILE_SPEED = 12;
export const MAX_PLATFORMER_MISSILES = 5;

// ── Platformer gameplay ──
export const GEM_COLLECT_RADIUS = 0.6;
export const ENEMY_COLLISION_RADIUS = 0.8;
export const ENEMY_STOMP_OFFSET = 0.2; // How far above enemy player must be to stomp
export const DAMAGE_COOLDOWN_MS = 1000;
export const POOP_DAMAGE_COOLDOWN_MS = 800;
export const PLAYER_DAMAGE_FROM_ENEMY = 10;
export const PLAYER_DAMAGE_FROM_POOP = 5;
export const PLAYER_BOUNCE_VX = 8;
export const PLAYER_BOUNCE_VY = 6;
export const POOP_BOUNCE_VY = 6;
export const LEVEL_END_X = 240;
export const FLAG_REACH_X = 239.5;
export const EXPLOSION_DURATION_MS = 500;
export const MAX_EXPLOSIONS = 20;

// ── Platformer terrain (hills) ──
export const HILLS = [
  { startX: 8, endX: 14, height: 1.5 },
  { startX: 20, endX: 28, height: 2.5 },
  { startX: 35, endX: 42, height: 1.8 },
];

// Returns the ground height at position X, accounting for hills.
export const getTerrainHeight = (x: number): number => {
  for (const hill of HILLS) {
    if (x >= hill.startX && x <= hill.endX) {
      const hillCenter = (hill.startX + hill.endX) / 2;
      const hillWidth = hill.endX - hill.startX;
      const distFromCenter = Math.abs(x - hillCenter);
      const normalizedDist = distFromCenter / (hillWidth / 2);
      const heightMultiplier = Math.cos(normalizedDist * Math.PI / 2);
      return GROUND_Y + hill.height * heightMultiplier;
    }
  }
  return GROUND_Y;
};

// ── Platformer scoring ──
export const SCORE_GEM = 10;
export const SCORE_LETTER_GEM_BONUS = 15;
export const SCORE_SPELLING_LETTER = 25;
export const SCORE_SPELLING_COMPLETE = 200;
export const SCORE_DEFEAT_PLATFORMER_ENEMY = 50;

// ── Tank battle ──
export const TANK_BULLET_SPEED = 10;
export const TANK_MISSILE_SPEED = 12;
export const TANK_FIRE_RATE_MS = 500;
export const TANK_RAPID_FIRE_RATE_MS = 200;
export const TANK_MISSILE_COOLDOWN_MS = 1000;
export const TANK_ARENA_BOUNDS = 9;
export const TANK_BULLET_BOUNDS = 12;
export const TANK_BULLET_DAMAGE = 10;
export const TANK_MISSILE_DAMAGE = 50;
export const TANK_ENEMY_BULLET_DAMAGE = 10;
export const TANK_PLAYER_HIT_RADIUS = 0.6;
export const TANK_ENEMY_HIT_RADIUS = 0.8;
export const TANK_POWERUP_RADIUS = 0.7;

// ── Tank scoring ──
export const SCORE_TANK_ENEMY_KILL = 100;
export const SCORE_TANK_TARGET_KILL = 250;
export const SCORE_TANK_POWERUP = 50;

// ── Quiz / lesson ──
export const LESSON_POINTS_BASE = 4; // getRequiredLessonPoints = LESSON_POINTS_BASE + level
export const TYPING_CORRECT_REQUIRED = 3;

// ── Speech synthesis defaults ──
export const SPEECH_RATE_SLOW = 0.7;
export const SPEECH_RATE_NORMAL = 0.8;

// ── Castle Raider physics ──
export const CR_GRAVITY = -15;
export const CR_JUMP_VELOCITY = 9;
export const CR_MOVE_SPEED = 4;
export const CR_GROUND_Y = -5;
export const CR_PLAYER_SIZE = 0.5;
export const CR_FIREBALL_SPEED = 10;
export const CR_MAX_FIREBALLS = 3;
export const CR_FIREBALL_DAMAGE = 2;

// ── Castle Raider gameplay ──
export const CR_GEM_COLLECT_RADIUS = 0.6;
export const CR_COIN_COLLECT_RADIUS = 0.6;
export const CR_ENEMY_COLLISION_RADIUS = 0.8;
export const CR_DAMAGE_COOLDOWN_MS = 1000;
export const CR_PLAYER_DAMAGE_FROM_KNIGHT = 15;
export const CR_PLAYER_BOUNCE_VX = 8;
export const CR_PLAYER_BOUNCE_VY = 6;
export const CR_PIT_DAMAGE = 20;
export const CR_PIT_INVINCIBILITY_MS = 2000;
export const CR_BOSS_ZONE_SIZE = 15; // final 15 X-units of level
export const CR_BOSS_PROJECTILE_SPEED = 6;
export const CR_FLIGHT_DURATION_MS = 10000;
export const CR_SPELLING_INTERVAL_MS = 45000; // ~45 seconds between challenges

// ── Castle Raider scoring ──
export const CR_SCORE_GEM = 10;
export const CR_SCORE_COIN = 5;
export const CR_SCORE_DEFEAT_KNIGHT = 75;
export const CR_SCORE_SPELLING_CORRECT = 50;
export const CR_SCORE_BOSS_DEFEAT = 500;

// ── Castle Raider store prices (in gems) ──
export const CR_PRICE_HEALTH_POTION = 3;
export const CR_PRICE_EXTRA_LIFE = 8;
export const CR_PRICE_FLIGHT_POTION = 5;

// ── Castle Raider knight types ──
export const CR_BASIC_KNIGHT_HP = 3;
export const CR_BASIC_KNIGHT_SPEED = 0.5;
export const CR_ARMORED_KNIGHT_HP = 6;
export const CR_ARMORED_KNIGHT_SPEED = 0.3;
export const CR_DARK_KNIGHT_HP = 4;
export const CR_DARK_KNIGHT_SPEED = 0.8;
export const CR_DARK_KNIGHT_CHARGE_RANGE = 8;
export const CR_ENEMY_AGGRO_RANGE = 8;

export const CR_SKELETON_HP = 2;
export const CR_SKELETON_SPEED = 0.7;
export const CR_EVIL_KNIGHT_HP = 5;
export const CR_EVIL_KNIGHT_SPEED = 0.4;
export const CR_EVIL_DRAGON_HP = 8;
export const CR_EVIL_DRAGON_SPEED = 0.3;
export const CR_EVIL_DRAGON_SHOOT_RANGE = 10;
export const CR_EVIL_DRAGON_SHOOT_INTERVAL = 2000;
export const CR_BEAST_HP = 7;
export const CR_BEAST_SPEED = 0.6;
export const CR_GOBLIN_HP = 2;
export const CR_GOBLIN_SPEED = 0.9;
