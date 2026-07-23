import { UpgradeCard, UpgradeRarity } from '../types';
import { UPGRADE_POOL_WEIGHTS } from '../constants';

export const ALL_UPGRADES: UpgradeCard[] = [
  // Common
  {
    id: 'steady_steps',
    name: 'Steady Steps',
    rarity: 'common',
    description: '+1 value added to every movement card dealt.',
    effectType: 'steady_steps',
  },
  {
    id: 'whetstone',
    name: 'Whetstone',
    rarity: 'common',
    description: '+1 to base weapon damage per weapon hit.',
    effectType: 'whetstone',
  },
  {
    id: 'chest_sense',
    name: 'Chest Sense',
    rarity: 'common',
    description: 'Skews chest contents to heavily favor weapons over extra turns.',
    effectType: 'chest_sense',
  },
  {
    id: 'upwind_gust',
    name: 'Gathering Gust',
    rarity: 'common',
    description: '+1 to the movement points every upwind grants. Stacks.',
    effectType: 'upwind_gust',
  },
  {
    id: 'upwind_gale',
    name: 'Rising Gale',
    rarity: 'common',
    description: '+1 active upwind kept on the board. Stacks.',
    effectType: 'upwind_gale',
  },

  // Rare
  {
    id: 'armory_contract',
    name: 'Armory Contract',
    rarity: 'rare',
    description: 'Gain +1 weapon for free at the start of every turn.',
    effectType: 'armory_contract',
  },
  {
    id: 'marching_orders',
    name: 'Marching Orders',
    rarity: 'rare',
    description: 'Raises minimum possible value of movement cards to 3.',
    effectType: 'marching_orders',
  },

  // Combo
  {
    id: 'warlords_momentum',
    name: "Warlord's Momentum",
    rarity: 'combo',
    description: 'Bundles Armory Contract (+1 weapon/turn) and Marching Orders (min card 3).',
    effectType: 'warlords_momentum',
  },

  // Legendary
  {
    id: 'twin_draw',
    name: 'Twin Draw',
    rarity: 'legendary',
    description: 'Reveal 2 movement cards each turn instead of 1. Combine both values!',
    effectType: 'twin_draw',
  },
  {
    id: 'second_wind',
    name: 'Second Wind',
    rarity: 'legendary',
    description: 'When about to drop to 0 HP, survive at 1 HP instead (one-time use).',
    effectType: 'second_wind',
  },
  {
    id: 'upwind_reserves',
    name: 'Windward Reserves',
    rarity: 'legendary',
    description: 'Leftover movement points carry into your next turn instead of being lost.',
    effectType: 'upwind_reserves',
  },
];

/**
 * Draws 3 distinct random upgrades based on rarity weights.
 * Excludes one-time rare/combo/legendary upgrades that have already been picked.
 */
export function drawRandomUpgrades(
  count: number = 3,
  pickedUpgradeIds: string[] = []
): UpgradeCard[] {
  // Filter available pool
  const availablePool = ALL_UPGRADES.filter((card) => {
    // Commons are stackable
    if (card.rarity === 'common') return true;
    // Non-commons are unique (one-time toggle)
    if (pickedUpgradeIds.includes(card.id)) return false;
    // If warlords_momentum was picked, exclude armory_contract & marching_orders, and vice versa
    if (
      pickedUpgradeIds.includes('warlords_momentum') &&
      (card.id === 'armory_contract' || card.id === 'marching_orders')
    ) {
      return false;
    }
    if (
      (pickedUpgradeIds.includes('armory_contract') ||
        pickedUpgradeIds.includes('marching_orders')) &&
      card.id === 'warlords_momentum'
    ) {
      return false;
    }
    return true;
  });

  const selectedCards: UpgradeCard[] = [];
  const selectedIds = new Set<string>();

  while (selectedCards.length < count && availablePool.length > 0) {
    // 1. Roll a target rarity
    const rarity = rollRarity();
    // 2. Find cards matching rarity
    let candidates = availablePool.filter(
      (c) => c.rarity === rarity && !selectedIds.has(c.id)
    );

    // Fallback if no cards of that rarity remain
    if (candidates.length === 0) {
      candidates = availablePool.filter((c) => !selectedIds.has(c.id));
    }

    if (candidates.length === 0) break; // pool exhausted

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    selectedCards.push(chosen);
    selectedIds.add(chosen.id);
  }

  return selectedCards;
}

function rollRarity(): UpgradeRarity {
  const totalWeight =
    UPGRADE_POOL_WEIGHTS.common +
    UPGRADE_POOL_WEIGHTS.rare +
    UPGRADE_POOL_WEIGHTS.combo +
    UPGRADE_POOL_WEIGHTS.legendary;

  let roll = Math.random() * totalWeight;

  if (roll < UPGRADE_POOL_WEIGHTS.common) return 'common';
  roll -= UPGRADE_POOL_WEIGHTS.common;

  if (roll < UPGRADE_POOL_WEIGHTS.rare) return 'rare';
  roll -= UPGRADE_POOL_WEIGHTS.rare;

  if (roll < UPGRADE_POOL_WEIGHTS.combo) return 'combo';

  return 'legendary';
}
