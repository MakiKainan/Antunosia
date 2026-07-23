import {
  BOARD_SIZE,
  SUDOKU_BOX_ROWS,
  SUDOKU_BOX_COLS,
  CARD_VALUE_WEIGHTS,
} from '../constants';
import { Position } from '../types';

/**
 * Calculates the Sudoku box index (0 to 5) for a given row and col on a 6x6 grid with 2x3 boxes.
 */
export function getSudokuBoxIndex(row: number, col: number): number {
  const boxRow = Math.floor(row / SUDOKU_BOX_ROWS); // 0 or 1
  const boxCol = Math.floor(col / SUDOKU_BOX_COLS); // 0, 1, or 2
  return boxRow * 3 + boxCol;
}

/**
 * Checks if a cell is occupied by player or monster.
 */
export function isOccupiedByUnit(
  pos: Position,
  playerPos: Position,
  monsterPos: Position
): boolean {
  return (
    (pos.row === playerPos.row && pos.col === playerPos.col) ||
    (pos.row === monsterPos.row && pos.col === monsterPos.col)
  );
}

/**
 * Checks if adding a chest at candidate position violates Sudoku constraints
 * (same row, same column, or same 2x3 box as an existing chest).
 */
export function isValidChestPlacement(
  candidate: Position,
  existingChests: Position[],
  playerPos: Position,
  monsterPos: Position
): boolean {
  // Can't place on player or monster
  if (isOccupiedByUnit(candidate, playerPos, monsterPos)) {
    return false;
  }

  // Can't place on existing chest
  if (
    existingChests.some(
      (c) => c.row === candidate.row && c.col === candidate.col
    )
  ) {
    return false;
  }

  const candidateBox = getSudokuBoxIndex(candidate.row, candidate.col);

  for (const chest of existingChests) {
    // Same row check
    if (chest.row === candidate.row) return false;
    // Same col check
    if (chest.col === candidate.col) return false;
    // Same Sudoku box check
    if (getSudokuBoxIndex(chest.row, chest.col) === candidateBox) return false;
  }

  return true;
}

/**
 * Generates `count` chest positions on the board satisfying Sudoku box/row/col constraints.
 */
export function generateInitialChests(
  count: number,
  playerPos: Position,
  monsterPos: Position
): Position[] {
  const chests: Position[] = [];

  for (let attempt = 0; attempt < 50; attempt++) {
    chests.length = 0; // reset
    const allCells: Position[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!isOccupiedByUnit({ row: r, col: c }, playerPos, monsterPos)) {
          allCells.push({ row: r, col: c });
        }
      }
    }

    // Shuffle cells
    allCells.sort(() => Math.random() - 0.5);

    for (const cell of allCells) {
      if (isValidChestPlacement(cell, chests, playerPos, monsterPos)) {
        chests.push(cell);
        if (chests.length === count) return chests;
      }
    }
  }

  // Fallback if random constraint solver fails
  return chests;
}

/**
 * Spawns a single replacement chest maintaining Sudoku constraints relative to existing chests.
 */
export function spawnReplacementChest(
  existingChests: Position[],
  playerPos: Position,
  monsterPos: Position
): Position | null {
  const validCells: Position[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const candidate = { row: r, col: c };
      if (isValidChestPlacement(candidate, existingChests, playerPos, monsterPos)) {
        validCells.push(candidate);
      }
    }
  }

  if (validCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * validCells.length);
    return validCells[randomIndex];
  }

  // Relaxed fallback: place on any unoccupied cell
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const candidate = { row: r, col: c };
      if (
        !isOccupiedByUnit(candidate, playerPos, monsterPos) &&
        !existingChests.some((chestPos) => chestPos.row === r && chestPos.col === c)
      ) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Draws a random movement card value based on weighted probability distribution.
 */
export function drawWeightedMovementValue(
  steadyStepsBonus: number = 0,
  marchingOrdersMin: number = 1
): number {
  const totalWeight = CARD_VALUE_WEIGHTS.reduce((acc, item) => acc + item.weight, 0);
  let randomVal = Math.random() * totalWeight;

  let baseVal = 1;
  for (const item of CARD_VALUE_WEIGHTS) {
    if (randomVal <= item.weight) {
      baseVal = item.value;
      break;
    }
    randomVal -= item.weight;
  }

  // Apply Marching Orders (raises min value)
  const clampedVal = Math.max(baseVal, marchingOrdersMin);
  // Apply Steady Steps (+1 or more to card value)
  return clampedVal + steadyStepsBonus;
}

/**
 * Returns orthogonal Manhattan distance between two positions.
 */
export function getManhattanDistance(posA: Position, posB: Position): number {
  return Math.abs(posA.row - posB.row) + Math.abs(posA.col - posB.col);
}

/**
 * Returns whether two positions are adjacent orthogonally.
 */
export function isAdjacent(posA: Position, posB: Position): boolean {
  return getManhattanDistance(posA, posB) === 1;
}

/**
 * Returns whether two positions are adjacent or identical.
 */
export function isAdjacentOrSame(posA: Position, posB: Position): boolean {
  return getManhattanDistance(posA, posB) <= 1;
}

/**
 * BFS to find all reachable cells within `maxMoves` orthogonal steps.
 */
export function getReachableCells(
  start: Position,
  maxMoves: number
): { position: Position; cost: number; path: Position[] }[] {
  if (maxMoves <= 0) return [];

  const queue: { position: Position; cost: number; path: Position[] }[] = [
    { position: start, cost: 0, path: [start] },
  ];
  const visited = new Map<string, number>();
  visited.set(`${start.row},${start.col}`, 0);

  const results: { position: Position; cost: number; path: Position[] }[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.cost > 0) {
      results.push(current);
    }

    if (current.cost >= maxMoves) continue;

    const neighbors: Position[] = [
      { row: current.position.row - 1, col: current.position.col },
      { row: current.position.row + 1, col: current.position.col },
      { row: current.position.row, col: current.position.col - 1 },
      { row: current.position.row, col: current.position.col + 1 },
    ];

    for (const n of neighbors) {
      if (n.row >= 0 && n.row < BOARD_SIZE && n.col >= 0 && n.col < BOARD_SIZE) {
        const key = `${n.row},${n.col}`;
        const newCost = current.cost + 1;

        if (!visited.has(key) || visited.get(key)! > newCost) {
          visited.set(key, newCost);
          queue.push({
            position: n,
            cost: newCost,
            path: [...current.path, n],
          });
        }
      }
    }
  }

  return results;
}
