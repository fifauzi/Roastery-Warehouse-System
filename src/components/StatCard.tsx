import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
  accentColor?: 'amber' | 'emerald' | 'rose' | 'sky' | 'stone';
  sparklineTrend?: number[]; // optional mini sparkline data
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  description,
  icon,
  accentColor = 'amber',
  onClick,
}) => {
  const colorMap = {
    amber: 'text-[#e07a48] bg-[#e07a48]/10 border-[#e07a48]/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    stone: 'text-[#a69588] bg-[#291f1a] border-[#3d2e25]',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-4 flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-[#a69588] tracking-tight">{label}</span>
        {icon && (
          <div className={`p-1.5 rounded-lg border ${colorMap[accentColor]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono tracking-tight text-[#f5ece5] tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-[#8c7b6f] tracking-tight">
            {unit}
          </span>
        )}
      </div>

      {description && (
        <div className="mt-2.5 text-[11px] text-[#8c7b6f] border-t border-[#31251e] pt-1.5 truncate flex items-center justify-between">
          <span>{description}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#e07a48]/70"></span>
        </div>
      )}
    </div>
  );
};
