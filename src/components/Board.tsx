import React, { useState } from 'react';
import { Position, TurnPhase } from '../types';
import { BOARD_SIZE, SUDOKU_BOX_ROWS, SUDOKU_BOX_COLS } from '../constants';
import { getSudokuBoxIndex, isAdjacent } from '../utils/boardUtils';
import { Shield, Sparkles } from 'lucide-react';

interface BoardProps {
  playerPos: Position;
  monsterPos: Position;
  chests: Position[];
  phase: TurnPhase;
  movementPoints: number;
  reachableCells: { position: Position; cost: number; path: Position[] }[];
  onCellClick: (targetPos: Position, path?: Position[]) => void;
}

export const Board: React.FC<BoardProps> = ({
  playerPos,
  monsterPos,
  chests,
  phase,
  movementPoints,
  reachableCells,
  onCellClick,
}) => {
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);

  // Map reachable cells for fast lookup
  const reachableMap = new Map<string, { cost: number; path: Position[] }>();
  reachableCells.forEach((item) => {
    reachableMap.set(`${item.position.row},${item.position.col}`, item);
  });

  // Get current hovered path if any
  const hoveredReachable =
    hoveredCell && phase === 'PLAYER_MOVE'
      ? reachableMap.get(`${hoveredCell.row},${hoveredCell.col}`)
      : null;

  const hoveredPathSet = new Set<string>();
  if (hoveredReachable) {
    hoveredReachable.path.forEach((p) =>
      hoveredPathSet.add(`${p.row},${p.col}`)
    );
  }

  return (
    <div className="flex flex-col items-center my-2">
      {/* 6x6 Grid Container */}
      <div className="relative p-1 bg-white border-[3px] border-black shadow-solid rounded-xs">
        <div className="grid grid-cols-6 grid-rows-6 w-[340px] h-[340px] sm:w-[410px] sm:h-[410px] bg-white border-2 border-black">
          {Array.from({ length: BOARD_SIZE }).map((_, row) =>
            Array.from({ length: BOARD_SIZE }).map((_, col) => {
              const key = `${row},${col}`;
              const isPlayer = playerPos.row === row && playerPos.col === col;
              const isMonster = monsterPos.row === row && monsterPos.col === col;
              const isChest = chests.some(
                (c) => c.row === row && c.col === col
              );
              const isReachable = reachableMap.has(key);
              const reachableInfo = reachableMap.get(key);
              const isAdjacentToPlayer = isAdjacent(playerPos, { row, col });
              const isHoveredPath = hoveredPathSet.has(key);

              // Thick Sudoku box borders:
              const isSudokuRowBorder = row > 0 && row % SUDOKU_BOX_ROWS === 0;
              const isSudokuColBorder = col > 0 && col % SUDOKU_BOX_COLS === 0;

              const boxIndex = getSudokuBoxIndex(row, col);

              return (
                <div
                  key={key}
                  onClick={() => {
                    if (phase === 'PLAYER_MOVE' && (isReachable || isAdjacentToPlayer)) {
                      onCellClick({ row, col }, reachableInfo?.path);
                    }
                  }}
                  onMouseEnter={() => setHoveredCell({ row, col })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`
                    relative flex items-center justify-center
                    border border-black select-none transition-colors duration-150 cursor-pointer
                    ${isSudokuRowBorder ? 'border-t-[3px] border-t-black' : ''}
                    ${isSudokuColBorder ? 'border-l-[3px] border-l-black' : ''}
                    ${boxIndex % 2 === 0 ? 'bg-[#FDFBF7]' : 'bg-[#F5F1E9]'}
                    ${
                      isReachable && phase === 'PLAYER_MOVE'
                        ? 'hover:bg-amber-100 ring-2 ring-inset ring-[#800000]'
                        : ''
                    }
                    ${
                      isHoveredPath && phase === 'PLAYER_MOVE'
                        ? 'bg-amber-200'
                        : ''
                    }
                  `}
                >
                  {/* Step cost badge if reachable */}
                  {isReachable && phase === 'PLAYER_MOVE' && !isPlayer && (
                    <span className="absolute top-0.5 right-1 text-[10px] font-bold text-[#800000]">
                      {reachableInfo?.cost}
                    </span>
                  )}

                  {/* Player Pawn */}
                  {isPlayer && (
                    <div className="z-10 flex flex-col items-center justify-center animate-pulse">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 border-2 border-black shadow-inner flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                    </div>
                  )}

                  {/* Monster Lair Pawn */}
                  {isMonster && (
                    <div className="z-10 flex flex-col items-center justify-center">
                      <svg
                        viewBox="0 0 32 32"
                        className="w-7 h-7 sm:w-8 sm:h-8 text-[#800000]"
                      >
                        <path
                          d="M 6 12 L 10 4 L 14 10 L 18 4 L 22 10 L 26 4 L 26 26 L 6 26 Z"
                          fill="none"
                          stroke="#800000"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="16" r="2" fill="#800000" />
                        <path d="M 10 22 Q 16 26 22 22" stroke="#800000" strokeWidth="2" fill="none" />
                      </svg>
                      <span className="text-[8px] font-serif-warm text-[#800000] font-bold -mt-0.5">
                        BOSS
                      </span>
                    </div>
                  )}

                  {/* Chest Icon */}
                  {isChest && !isPlayer && (
                    <div className="z-10 flex flex-col items-center justify-center transition-transform hover:scale-110">
                      <svg
                        viewBox="0 0 28 28"
                        className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600"
                      >
                        <rect
                          x="3"
                          y="10"
                          width="22"
                          height="14"
                          rx="2"
                          fill="#f97316"
                          stroke="black"
                          strokeWidth="2"
                        />
                        <path
                          d="M 3 10 Q 14 3 25 10 Z"
                          fill="#fb923c"
                          stroke="black"
                          strokeWidth="2"
                        />
                        <circle cx="14" cy="16" r="2" fill="black" />
                      </svg>
                    </div>
                  )}

                  {/* Path step dot */}
                  {isHoveredPath && !isPlayer && !isMonster && !isChest && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#800000] opacity-80 animate-ping" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Helper Legend / Board Instruction */}
      <div className="mt-2 text-xs font-serif-warm text-[#1A1A1A] text-center flex items-center justify-center gap-4 italic">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 border border-black bg-[#F5F1E9] inline-block" /> 2x3 Sudoku Boxes
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-orange-500 border border-black inline-block" /> Chest (3)
        </span>
        {phase === 'PLAYER_MOVE' && movementPoints > 0 && (
          <span className="font-bold text-[#800000] not-italic animate-pulse">
            ★ Move points: {movementPoints}
          </span>
        )}
      </div>
    </div>
  );
};
