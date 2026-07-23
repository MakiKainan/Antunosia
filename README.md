Antunosia

A turn-based roguelite where you draw movement cards, race across a mini-sudoku
board to loot chests, and fight your way past a monster with nothing but the
weapons you managed to scavenge along the way.

> Working title — swap it for whatever fits once the prototype has a face.

## Concept

Every turn you're dealt three face-down cards. Open one for movement points,
spend them crossing a 6x6 board styled like a mini sudoku (six 2x3 boxes), and
either loot a chest, reach the monster, or both. You can't fight until you've
found at least one weapon — so the early game is a scramble to grab loot
before the monster catches up to you.

## Core loop

1. Draw 3 face-down movement cards.
2. Open one (or two, with the right upgrade) to reveal your movement points
   for the turn. Unopened cards are discarded.
3. Move orthogonally across the board, one cell per point.
4. Land on a chest → open it, a new chest spawns elsewhere to replace it.
5. Reach the monster → combat.
6. End of turn → pick one of three upgrade cards.
7. Repeat until the monster is defeated or your hearts run out.

## Weapons

- You start with zero weapons and cannot attack until you find one.
- Each weapon collected stacks: damage = `weaponCount x WEAPON_BASE_DAMAGE`.
  Two weapons double your damage, three triple it, and so on.
- The board always keeps a fixed number of chests active — collecting one
  spawns a replacement elsewhere, so weapon-farming is always an option.

## Combat

- Monster: `MONSTER_MAX_HP = 10`. Player: `PLAYER_MAX_HP = 3` hearts.
- You attack first (if armed). Land a hit of `STUN_THRESHOLD` damage or more
  in one go and the monster is stunned, skipping its next attack.
- If it isn't stunned, it hits back for a flat `MONSTER_HIT_DAMAGE = 1`,
  regardless of its own remaining HP.
- Monster HP hits 0 → you win. Your HP hits 0 → game over.

## Post-turn upgrades

Offered as 3 random picks at the end of every turn, one pick per turn.

| Tier | Name | Effect |
|---|---|---|
| Common | Steady steps | +1 to every movement card's value. Stacks. |
| Common | Whetstone | +1 to weapon base damage. Stacks. |
| Common | Chest sense | Chests skew toward weapons over extra-turns. |
| Rare | Armory contract | Free +1 weapon at the start of every turn. |
| Rare | Marching orders | Raises the minimum possible movement roll. |
| Combo | Warlord's momentum | Armory contract + Marching orders, bundled. |
| Legendary | Twin draw | Reveal 2 of 3 cards instead of 1; movement = their sum. |
| Legendary | Second wind | Survive your first drop to 0 HP at 1 HP instead. One-time. |

## Tunable constants

All balance numbers live as named constants at the top of the source, so the
game can be rebalanced without touching logic:

| Constant | Default | Purpose |
|---|---|---|
| `MONSTER_MAX_HP` | 10 | Monster's total health |
| `PLAYER_MAX_HP` | 3 | Player's hearts |
| `STUN_THRESHOLD` | 3 | Min. single-hit damage to stun the monster |
| `MONSTER_HIT_DAMAGE` | 1 | Flat damage taken per unstunned monster attack |
| `WEAPON_BASE_DAMAGE` | 1 | Damage per stacked weapon |
| `CHEST_COUNT_ON_BOARD` | 3 | Chests kept active on the board at once |
| Movement card range | 1-6 | Weighted toward the middle |

## Tech stack

- Single-page React app, functional components only.
- Game state via `useState` / `useReducer` — no backend, no persistence.
- Suggested components: `BossPortrait`, `HeartRow`, `WeaponIndicator`,
  `Board`, `CardHand`, `CombatLog`, `UpgradeCardModal`, `GameOverScreen`,
  `VictoryScreen`.

## Running locally

```bash
npm install
npm start
```

(Adjust once you know the exact scaffold Google AI Studio exports — Vite and
CRA output slightly different scripts.)

## Open design questions

Things worth pinning down as the prototype takes shape:

- Does reaching 0 weapons mid-combat block the attack button outright, or
  just silently deal 0 damage?
- Can the player retreat from combat once engaged, or is it fight-to-the-death
  once you're adjacent to the monster?
- Should the sudoku-box constraint on chest placement extend to where the
  monster itself spawns each run?
- Is "Twin draw" meant to sum two revealed cards, or let the player see two
  and keep the better one?

## Credits

Concept scribbled down during a five-minute idea break, then built out turn
by turn with Claude.
