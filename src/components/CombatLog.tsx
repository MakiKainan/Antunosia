import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';

interface CombatLogProps {
  logs: LogEntry[];
}

export const CombatLog: React.FC<CombatLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full bg-[#F8F5F0] border-2 border-black shadow-solid-sm p-3 my-2">
      <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-2">
        <span className="font-serif-warm text-xs font-bold text-[#800000] tracking-wider uppercase flex items-center gap-1">
          📜 Adventure & Combat Log
        </span>
        <span className="text-[10px] font-serif-warm text-[#1A1A1A] opacity-70">
          {logs.length} Entries
        </span>
      </div>

      {/* Log Feed */}
      <div
        ref={scrollRef}
        className="h-32 overflow-y-auto space-y-1.5 pr-1 font-serif-warm text-xs"
      >
        {logs.length === 0 ? (
          <div className="text-center text-[#1A1A1A] opacity-50 py-6 italic">
            Flip a movement card to begin your journey...
          </div>
        ) : (
          logs.map((log) => {
            let colorClass = 'text-[#1A1A1A]';
            if (log.type === 'combat') colorClass = 'text-[#800000] font-bold';
            if (log.type === 'chest') colorClass = 'text-orange-700 font-bold';
            if (log.type === 'upgrade') colorClass = 'text-purple-900 font-bold';
            if (log.type === 'victory') colorClass = 'text-emerald-800 font-bold';
            if (log.type === 'defeat') colorClass = 'text-red-900 font-bold';
            if (log.type === 'warning') colorClass = 'text-amber-800 font-bold';

            return (
              <div
                key={log.id}
                className={`flex items-start gap-1.5 leading-snug border-b border-[#E5DFD3] pb-1 ${colorClass}`}
              >
                <span className="text-[10px] font-bold text-[#800000] min-w-[32px]">
                  T#{log.turnNumber}
                </span>
                <span>{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
