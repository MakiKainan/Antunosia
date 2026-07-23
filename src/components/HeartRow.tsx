import React from 'react';

interface HeartRowProps {
  currentHp: number;
  maxHp: number;
}

export const HeartRow: React.FC<HeartRowProps> = ({ currentHp, maxHp }) => {
  const hearts = Array.from({ length: maxHp }, (_, i) => i < currentHp);

  return (
    <div className="flex items-center space-x-1.5" title={`Player HP: ${currentHp}/${maxHp}`}>
      {hearts.map((isFilled, index) => (
        <div key={index} className="w-6 h-6 relative transition-transform duration-200 hover:scale-110">
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full overflow-visible"
          >
            {/* Heart Path with Warm Maroon (#800000) Fill */}
            <path
              d="M 12 21.35 L 10.55 20.03 C 5.4 15.36 2 12.28 2 8.5 C 2 5.42 4.42 3 7.5 3 C 9.24 3 10.91 3.81 12 5.09 C 13.09 3.81 14.76 3 16.5 3 C 19.58 3 22 5.42 22 8.5 C 22 12.28 18.6 15.36 13.45 20.04 L 12 21.35 Z"
              fill={isFilled ? '#800000' : 'none'}
              stroke="#1A1A1A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
