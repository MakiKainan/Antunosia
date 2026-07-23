/**
 * TUNABLE GAME BALANCE CONSTANTS
 * Adjust these values to modify prototype difficulty, combat balance, and card weights.
 */

// Monster Stats
export const MONSTER_MAX_HP = 10;
export const MONSTER_HIT_DAMAGE = 1; // Flat damage dealt to player on counterattack
export const STUN_THRESHOLD = 3; // Minimum single-hit damage to stun monster and skip its counterattack

// Player Base Stats
export const PLAYER_MAX_HP = 3; // Hearts
export const INITIAL_WEAPON_COUNT = 0;
export const WEAPON_BASE_DAMAGE = 1; // Base damage per weapon (modified by Whetstone upgrade)

// Board & Chest Constraints
export const BOARD_SIZE = 6;
export const SUDOKU_BOX_ROWS = 2; // 2 rows per box
export const SUDOKU_BOX_COLS = 3; // 3 columns per box (total 6 boxes on a 6x6 grid)
export const CHEST_COUNT_ON_BOARD = 3; // Active chests maintain constraint: max 1 per box, row, & col

// Movement Card Value Distribution (1-6, weighted toward middle values)
export const CARD_VALUE_WEIGHTS: { value: number; weight: number }[] = [
  { value: 1, weight: 1 },
  { value: 2, weight: 3 },
  { value: 3, weight: 4 },
  { value: 4, weight: 4 },
  { value: 5, weight: 3 },
  { value: 6, weight: 1 },
];

// Upgrade Pool Rarity Weights (determines chance of rare/combo/legendary appearing)
export const UPGRADE_POOL_WEIGHTS = {
  common: 60,
  rare: 25,
  combo: 10,
  legendary: 5,
};

// Chest Rewards Probability
export const DEFAULT_CHEST_WEAPON_CHANCE = 0.5; // 50% Weapon, 50% Extra Turn
export const CHEST_SENSE_WEAPON_CHANCE = 0.8; // 80% Weapon when Chest Sense is active

// Default Positions
export const PLAYER_START_POSITION = { row: 5, col: 0 }; // Bottom-left corner
export const MONSTER_FIXED_POSITION = { row: 0, col: 5 }; // Top-right corner
