// ── Platformer physics ──
export const GRAVITY = -15;
export const JUMP_VELOCITY = 8;
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
