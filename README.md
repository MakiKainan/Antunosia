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
3. Pick **one destination** up to that many tiles away (1 point per tile,
   orthogonal). You commit to a single move — any leftover points are lost.
4. Land on a chest → open it, a new chest spawns elsewhere to replace it.
5. Land on an **upwind** → gain bonus movement points and pick another
   destination (see below).
6. End of turn → combat resolves automatically, then pick one of three
   upgrade cards.
7. Repeat until the monster is defeated or your hearts run out.

You may also click your own tile to hold position and end the turn without moving.

## Weapons

- You start with zero weapons and cannot attack until you find one.
- Each weapon collected stacks: damage = `weaponCount x WEAPON_BASE_DAMAGE`.
  Two weapons double your damage, three triple it, and so on.
- The board always keeps a fixed number of chests active — collecting one
  spawns a replacement elsewhere, so weapon-farming is always an option.

## Upwind

- A second board entity that spawns like a chest (same sudoku box/row/col
  constraint) and keeps a fixed count active.
- Landing on an upwind grants `UPWIND_MOVEMENT_BONUS = 2` movement points and
  lets you pick **another** destination that same turn — it's the only way to
  extend a turn's movement, since a normal move ends your turn.
- Collecting one spawns a replacement elsewhere, so upwinds can be chained.

## Combat

- Combat resolves automatically at the **end of every turn**, regardless of
  where you are on the board — the monster is a constant threat even while you
  farm weapons. There's no "attack when adjacent" step anymore.
- Monster: `MONSTER_MAX_HP = 10`. Player: `PLAYER_MAX_HP = 3` hearts.
- You attack first (if armed). Land a hit of `STUN_THRESHOLD` damage or more
  in one go and the monster is stunned, skipping its counterattack this turn.
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
| Common | Gathering gust | +1 to the movement points every upwind grants. Stacks. |
| Common | Rising gale | +1 active upwind kept on the board. Stacks. |
| Rare | Armory contract | Free +1 weapon at the start of every turn. |
| Rare | Marching orders | Raises the minimum possible movement roll. |
| Combo | Warlord's momentum | Armory contract + Marching orders, bundled. |
| Legendary | Twin draw | Reveal 2 of 3 cards instead of 1; movement = their sum. |
| Legendary | Second wind | Survive your first drop to 0 HP at 1 HP instead. One-time. |
| Legendary | Windward reserves | Leftover movement points carry into your next turn. |

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
| `UPWIND_COUNT_ON_BOARD` | 2 | Upwinds kept active on the board at once |
| `UPWIND_MOVEMENT_BONUS` | 2 | Movement points granted per upwind |
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
npm run dev
```

Vite serves the app on port 3000 (`npm run build` / `npm run preview` for a
production bundle).

## Open design questions

Things worth pinning down as the prototype takes shape:

- Combat now happens every turn from turn 1, so an unarmed player takes 1 damage
  per turn and dies in `PLAYER_MAX_HP` turns. Is that opening pressure right, or
  should the monster hold fire until the player finds a first weapon?
- Should the sudoku-box constraint on chest placement extend to where the
  monster itself spawns each run? (The monster is currently fixed.)
- Should a normal move be allowed to path *through* the monster's cell, or route
  around it? (Today the pathing ignores it; you just can't land there.)

## Credits

Concept scribbled down during a five-minute idea break, then built out turn
by turn with Claude.
