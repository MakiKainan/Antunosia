import React from 'react';
import { Sword } from 'lucide-react';

interface WeaponIndicatorProps {
  weaponCount: number;
  weaponBaseDamage: number;
}

export const WeaponIndicator: React.FC<WeaponIndicatorProps> = ({
  weaponCount,
  weaponBaseDamage,
}) => {
  const totalDamage = weaponCount * weaponBaseDamage;

  return (
    <div
      className="flex items-center space-x-2 bg-[#F5F1E9] px-3 py-1 border-2 border-black shadow-solid-sm text-[#1A1A1A]"
      title={`Weapons: ${weaponCount}, Base Damage: ${weaponBaseDamage}, Total Hit Damage: ${totalDamage}`}
    >
      {/* Stacked sword icons */}
      <div className="relative flex items-center h-5 w-6">
        {weaponCount === 0 ? (
          <Sword className="w-4 h-4 opacity-40 text-gray-500" />
        ) : (
          Array.from({ length: Math.min(weaponCount, 4) }).map((_, i) => (
            <Sword
              key={i}
              className="w-4 h-4 absolute stroke-[2.2]"
              style={{
                left: `${i * 4}px`,
                top: `${i * -1}px`,
                zIndex: i,
              }}
            />
          ))
        )}
      </div>

      {/* Weapon Stats Text */}
      <div className="flex flex-col text-xs font-serif-warm leading-tight">
        <span className="font-bold flex items-center gap-1">
          x{weaponCount} Weapon{weaponCount === 1 ? '' : 's'}
        </span>
        <span className="text-[10px] opacity-80 italic">
          {weaponCount === 0
            ? '0 damage'
            : `${totalDamage} dmg / hit`}
        </span>
      </div>
    </div>
  );
};
