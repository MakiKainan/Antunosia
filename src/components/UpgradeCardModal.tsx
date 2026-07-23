import React from 'react';
import { UpgradeCard } from '../types';

interface UpgradeCardModalProps {
  options: UpgradeCard[];
  onSelectUpgrade: (upgrade: UpgradeCard) => void;
}

export const UpgradeCardModal: React.FC<UpgradeCardModalProps> = ({
  options,
  onSelectUpgrade,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3">
      <div className="bg-[#FDFBF7] border-[3px] border-black shadow-solid-lg w-full max-w-lg p-6 flex flex-col items-center">
        {/* Modal Header */}
        <div className="text-center mb-4">
          <h2 className="font-serif-warm text-2xl font-bold text-[#800000] tracking-wide">
            ✨ End of Turn Upgrade
          </h2>
          <p className="font-serif-warm text-xs text-[#1A1A1A] opacity-80 italic mt-1">
            Select 1 power-up to enhance your hero for the remaining journey:
          </p>
        </div>

        {/* 3 Upgrade Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-2">
          {options.map((card, idx) => {
            const organicClass = ['organic-card-1', 'organic-card-2', 'organic-card-3'][idx % 3];

            return (
              <div
                key={card.id}
                onClick={() => onSelectUpgrade(card)}
                className={`bg-[#F5F1E9] border-2 border-black shadow-solid-sm p-3 flex flex-col justify-between items-center text-center cursor-pointer hover:-translate-y-1.5 hover:bg-[#EFE8DC] transition-all duration-200 min-h-[170px] ${organicClass}`}
              >
                <div>
                  {/* Rarity Pill */}
                  <span
                    className="text-[9px] uppercase font-serif-warm font-bold px-2 py-0.5 border border-black rounded-full bg-[#800000] text-white mb-2 inline-block shadow-solid-sm"
                  >
                    {card.rarity}
                  </span>

                  {/* Title */}
                  <h3 className="font-serif-warm text-sm font-bold text-[#1A1A1A] leading-tight mb-1">
                    {card.name}
                  </h3>

                  {/* Description */}
                  <p className="font-serif-warm text-xs text-[#1A1A1A] opacity-90 leading-snug">
                    {card.description}
                  </p>
                </div>

                {/* Choose Button */}
                <button className="mt-3 px-3 py-1 font-serif-warm text-xs font-bold bg-[#800000] text-white border border-black shadow-solid-sm hover:bg-black transition-colors cursor-pointer">
                  CLAIM ➔
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
