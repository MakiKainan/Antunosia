import React from 'react';
import { MonsterState } from '../types';

interface BossPortraitProps {
  monster: MonsterState;
  isAttacking?: boolean;
}

export const BossPortrait: React.FC<BossPortraitProps> = ({ monster }) => {
  const hpPercentage = Math.max(0, (monster.hp / monster.maxHp) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-2 my-1">
      {/* Cartoonish Monster Sketch */}
      <div className="relative w-36 h-32 flex items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full overflow-visible transition-transform duration-300 hover:scale-105"
        >
          {/* Sketchy shadow under boss */}
          <ellipse
            cx="60"
            cy="108"
            rx="40"
            ry="7"
            fill="#1A1A1A"
            opacity="0.12"
          />

          {/* Body shape - sketchy double stroke burgundy monster */}
          <g stroke="#800000" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Triangular Left Ear */}
            <path d="M 32 38 L 18 12 L 42 26 Z" />
            <path d="M 34 36 L 20 14 L 40 28 Z" strokeWidth="1" opacity="0.6" />

            {/* Triangular Right Ear */}
            <path d="M 88 38 L 102 12 L 78 26 Z" />
            <path d="M 86 36 L 100 14 L 80 28 Z" strokeWidth="1" opacity="0.6" />

            {/* Main Head Outline - rough double circle */}
            <path d="M 28 45 C 18 65 22 92 60 95 C 98 92 102 65 92 45 C 82 25 38 25 28 45 Z" />
            <path d="M 30 43 C 20 63 24 90 60 93 C 96 90 100 63 90 43 C 80 27 40 27 30 43 Z" strokeWidth="1.2" opacity="0.5" />

            {/* Horns or tufts for extra character */}
            <path d="M 52 28 C 50 18 55 12 58 10" strokeWidth="1.8" />
            <path d="M 68 28 C 70 18 65 12 62 10" strokeWidth="1.8" />

            {/* One Large Oval Eye in center */}
            <ellipse cx="60" cy="52" rx="16" ry="12" />
            <ellipse cx="60" cy="52" rx="15" ry="11" strokeWidth="1" opacity="0.5" />

            {/* Scribbled Dark Pupil inside eye */}
            <path
              d="M 58 50 C 62 48 64 54 59 55 C 56 56 57 51 61 51 Z"
              fill="#800000"
            />
            {/* Eye highlight */}
            <circle cx="56" cy="48" r="2" fill="#FDFBF7" stroke="none" />

            {/* Jagged Toothy Mouth */}
            <path d="M 38 76 L 44 84 L 50 75 L 56 85 L 62 75 L 68 84 L 74 75 L 82 78" />
            <path d="M 38 76 Q 60 90 82 78" />
            
            {/* Angry Brow Sketch */}
            <path d="M 40 38 Q 60 46 80 38" strokeWidth="2" />
          </g>
        </svg>

        {/* HP Badge */}
        <div className="absolute -top-1 -right-2">
          <span className="text-xs font-bold bg-[#800000] text-white px-2 py-0.5 rounded-full border border-black shadow-solid-sm">
            HP {monster.hp}/{monster.maxHp}
          </span>
        </div>

        {/* Stun Indicator Overlay */}
        {monster.isStunned && (
          <div className="absolute -top-2 -left-2 bg-orange-600 text-white font-title px-2 py-0.5 text-xs rounded-full border border-black shadow-solid-sm animate-bounce">
            ⚡ STUNNED!
          </div>
        )}
      </div>

      {/* Boss Name & Health Bar */}
      <div className="w-56 mt-1 text-center">
        <div className="flex items-center justify-between text-xs font-serif-warm text-[#1A1A1A] px-1 mb-1 italic font-semibold">
          <span className="tracking-wide uppercase font-bold text-[#800000]">Scribble Monster</span>
          <span>{monster.hp} / {monster.maxHp} HP</span>
        </div>

        {/* Hand-drawn sketchy health bar container */}
        <div className="w-full h-3.5 bg-[#F5F1E9] border-2 border-black overflow-hidden relative shadow-solid-sm">
          <div
            className="h-full bg-[#800000] transition-all duration-300 ease-out"
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
