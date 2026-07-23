import React from 'react';
import { PlayerState } from '../types';

interface GameOverScreenProps {
  turnNumber: number;
  player: PlayerState;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  turnNumber,
  player,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3">
      <div className="bg-[#FDFBF7] border-[3px] border-black shadow-solid-lg w-full max-w-md p-6 flex flex-col items-center text-center">
        {/* Defeat Icon */}
        <div className="w-16 h-16 text-[#800000] mb-2">
          <svg viewBox="0 0 64 64" className="w-full h-full stroke-current fill-none" strokeWidth="3">
            <circle cx="32" cy="32" r="28" />
            <path d="M 20 24 L 28 32 M 28 24 L 20 32" strokeLinecap="round" />
            <path d="M 36 24 L 44 32 M 44 24 L 36 32" strokeLinecap="round" />
            <path d="M 20 48 Q 32 38 44 48" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="font-serif-warm text-3xl font-bold text-[#800000] mb-1">
          GAME OVER
        </h1>
        <p className="font-serif-warm text-sm text-[#1A1A1A] mb-4 italic">
          The Scribble Monster defeated your hero...
        </p>

        {/* Stats Summary */}
        <div className="w-full bg-[#F5F1E9] p-3 border-2 border-black shadow-solid-sm mb-4 font-serif-warm text-xs text-left space-y-1">
          <div>⏳ <span className="font-bold">Turns Survived:</span> {turnNumber}</div>
          <div>⚔️ <span className="font-bold">Weapons Collected:</span> {player.weaponCount}</div>
          <div>✨ <span className="font-bold">Upgrades Claimed:</span> {player.activeUpgrades.length > 0 ? player.activeUpgrades.join(', ') : 'None'}</div>
        </div>

        <button
          onClick={onRestart}
          className="px-6 py-2.5 bg-[#800000] text-white font-serif-warm font-bold text-sm border-2 border-black shadow-solid hover:bg-black transition-all cursor-pointer"
        >
          🔄 PLAY AGAIN
        </button>
      </div>
    </div>
  );
};
