export interface Position {
  row: number;
  col: number;
}

export type ChestType = 'weapon' | 'extra_turn';

export interface MovementCard {
  id: string;
  baseValue: number; // e.g., 1-6
  modifiedValue: number; // baseValue + steadySteps, etc.
  isRevealed: boolean;
  isSelected: boolean;
}

export type UpgradeRarity = 'common' | 'rare' | 'combo' | 'legendary';

export interface UpgradeCard {
  id: string;
  name: string;
  rarity: UpgradeRarity;
  description: string;
  effectType:
    | 'steady_steps'
    | 'whetstone'
    | 'chest_sense'
    | 'armory_contract'
    | 'marching_orders'
    | 'warlords_momentum'
    | 'twin_draw'
    | 'second_wind';
}

export interface LogEntry {
  id: string;
  turnNumber: number;
  text: string;
  type: 'info' | 'combat' | 'chest' | 'upgrade' | 'warning' | 'victory' | 'defeat';
  timestamp: string;
}

export interface PlayerState {
  position: Position;
  hp: number;
  maxHp: number;
  weaponCount: number;
  weaponBaseDamage: number;
  steadyStepsBonus: number; // +1 to movement card values
  marchingOrdersMin: number; // min movement card value
  chestSenseActive: boolean; // favor weapons
  armoryContractActive: boolean; // +1 weapon at turn start
  twinDrawActive: boolean; // reveal 2 cards instead of 1
  secondWindAvailable: boolean; // survive at 1 HP
  hasSecondWindTriggered: boolean;
  activeUpgrades: string[]; // names of picked upgrades
}

export interface MonsterState {
  position: Position;
  hp: number;
  maxHp: number;
  isStunned: boolean;
}

export type TurnPhase =
  | 'DEAL_CARDS'
  | 'REVEAL_CARDS'
  | 'PLAYER_MOVE'
  | 'COMBAT_RESOLUTION'
  | 'UPGRADE_SELECTION'
  | 'GAME_OVER'
  | 'VICTORY';
