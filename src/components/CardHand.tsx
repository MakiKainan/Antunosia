import React from 'react';
import { MovementCard } from '../types';

interface CardHandProps {
  cards: MovementCard[];
  twinDrawActive: boolean;
  selectedCount: number;
  onRevealCard: (cardId: string) => void;
  isMovePhase: boolean;
  movementPointsLeft: number;
}

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  twinDrawActive,
  selectedCount,
  onRevealCard,
  isMovePhase,
  movementPointsLeft,
}) => {
  const maxToReveal = twinDrawActive ? 2 : 1;
  const canPickMore = selectedCount < maxToReveal;

  const cardOrganicClasses = ['organic-card-1', 'organic-card-2', 'organic-card-3'];

  return (
    <div className="flex flex-col items-center my-2 w-full max-w-md px-2">
      {/* Hand Banner / Instruction */}
      <div className="text-center mb-2 font-serif-warm text-xs text-[#1A1A1A] font-bold tracking-wide uppercase">
        {!isMovePhase ? (
          canPickMore ? (
            <span className="text-[#800000] animate-pulse inline-block">
              🃏 {twinDrawActive ? 'TWIN DRAW: Pick 2 Cards' : 'Pick 1 Card to Flip'}
            </span>
          ) : (
            <span className="text-emerald-800">Cards Revealed — Moving Pawn...</span>
          )
        ) : (
          <span className="text-[#1A1A1A]">
            Moves Left: <span className="font-bold text-[#800000] text-sm">{movementPointsLeft}</span>
          </span>
        )}
      </div>

      {/* 3 Card Slots */}
      <div className="flex items-center justify-center space-x-3 sm:space-x-4 w-full">
        {cards.map((card, idx) => {
          const isInteractable = !isMovePhase && !card.isRevealed && canPickMore;
          const organicClass = cardOrganicClasses[idx % 3];

          return (
            <div
              key={card.id}
              onClick={() => {
                if (isInteractable) {
                  onRevealCard(card.id);
                }
              }}
              className={`
                w-24 h-36 sm:w-28 sm:h-40 border-2 border-black flex flex-col items-center justify-between p-2 select-none
                transition-all duration-200 transform ${organicClass}
                ${
                  card.isRevealed
                    ? 'bg-[#FDFBF7] shadow-solid scale-105'
                    : isInteractable
                    ? 'bg-[#F5F1E9] shadow-solid cursor-pointer hover:-translate-y-2 hover:bg-[#EFE8DC]'
                    : 'bg-[#EFE8DC] opacity-60 cursor-not-allowed shadow-none'
                }
              `}
            >
              {card.isRevealed ? (
                /* REVEALED CARD FACE */
                <div className="flex flex-col items-center justify-between h-full w-full py-1">
                  <span className="text-[10px] font-serif-warm font-bold text-[#800000] self-start tracking-wider">
                    CARD #{idx + 1}
                  </span>

                  <div className="flex flex-col items-center my-auto">
                    <span className="text-3xl sm:text-4xl font-serif-warm font-bold text-[#1A1A1A]">
                      +{card.modifiedValue}
                    </span>
                    <span className="text-[10px] font-serif-warm text-[#1A1A1A] opacity-80 uppercase tracking-widest -mt-1">
                      Moves
                    </span>
                  </div>

                  {card.modifiedValue !== card.baseValue && (
                    <span className="text-[9px] font-serif-warm text-emerald-900 font-bold bg-emerald-100 px-1 border border-emerald-700 rounded-xs">
                      Base {card.baseValue} (+{card.modifiedValue - card.baseValue})
                    </span>
                  )}
                </div>
              ) : (
                /* FACE DOWN CARD BACK */
                <div className="flex flex-col items-center justify-between h-full w-full py-2 relative overflow-hidden">
                  <div className="w-full text-center text-[10px] font-serif-warm font-bold text-[#1A1A1A] opacity-70 tracking-widest">
                    CARD #{idx + 1}
                  </div>

                  {/* Card Back Pattern */}
                  <div className="w-14 h-20 border-2 border-black flex items-center justify-center bg-[#EFE8DC]">
                    <svg viewBox="0 0 40 40" className="w-10 h-10 stroke-black">
                      <path d="M 5 5 L 35 35 M 35 5 L 5 35" strokeWidth="1.5" strokeDasharray="3 3" />
                      <circle cx="20" cy="20" r="10" fill="#FDFBF7" stroke="black" strokeWidth="1.5" />
                      <text x="20" y="24" textAnchor="middle" fontSize="12" fontFamily="Georgia" fontWeight="bold" fill="#800000">
                        ?
                      </text>
                    </svg>
                  </div>

                  <span className="text-[10px] font-serif-warm text-[#1A1A1A] font-bold italic">
                    {isInteractable ? 'Tap to Flip' : 'Locked'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
