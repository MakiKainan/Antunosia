import React from 'react';
import { PlayerState } from '../types';

interface VictoryScreenProps {
  turnNumber: number;
  player: PlayerState;
  onRestart: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  turnNumber,
  player,
  onRestart,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3">
      <div className="bg-[#FDFBF7] border-[3px] border-black shadow-solid-lg w-full max-w-md p-6 flex flex-col items-center text-center">
        {/* Victory Trophy Sketch */}
        <div className="w-20 h-20 text-[#800000] mb-2">
          <svg viewBox="0 0 64 64" className="w-full h-full stroke-current fill-none" strokeWidth="3">
            <path d="M 16 12 L 48 12 L 44 36 Q 32 46 20 36 Z" fill="#F5F1E9" />
            <path d="M 16 16 C 8 16 8 28 18 28" />
            <path d="M 48 16 C 56 16 56 28 46 28" />
            <path d="M 32 44 L 32 54 M 20 54 L 44 54" strokeLinecap="round" />
            <path d="M 28 22 L 32 18 L 36 22 M 32 18 L 32 30" strokeWidth="2" stroke="black" />
          </svg>
        </div>

        <h1 className="font-serif-warm text-3xl font-bold text-[#800000] mb-1">
          VICTORY!
        </h1>
        <p className="font-serif-warm text-sm text-[#1A1A1A] mb-4 italic">
          You vanquished the Scribble Monster!
        </p>

        {/* Stats Summary */}
        <div className="w-full bg-[#F5F1E9] p-3 border-2 border-black shadow-solid-sm mb-4 font-serif-warm text-xs text-left space-y-1">
          <div>🏆 <span className="font-bold">Total Turns to Win:</span> {turnNumber}</div>
          <div>⚔️ <span className="font-bold">Final Weapon Count:</span> {player.weaponCount}</div>
          <div>💥 <span className="font-bold">Total Damage/Hit:</span> {player.weaponCount * player.weaponBaseDamage}</div>
          <div>✨ <span className="font-bold">Upgrades Used:</span> {player.activeUpgrades.length > 0 ? player.activeUpgrades.join(', ') : 'None'}</div>
        </div>

        <button
          onClick={onRestart}
          className="px-6 py-2.5 bg-[#800000] text-white font-serif-warm font-bold text-sm border-2 border-black shadow-solid hover:bg-black transition-all cursor-pointer"
        >
          🎮 PLAY AGAIN
        </button>
      </div>
    </div>
  );
};
