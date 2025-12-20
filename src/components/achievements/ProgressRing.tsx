'use client';

import { NextMilestone, RARITY_CONFIG, AchievementRarity } from '@/lib/api';

interface ProgressRingProps {
  milestone: NextMilestone;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export default function ProgressRing({
  milestone,
  size = 'md',
  showDetails = true,
  className = ''
}: ProgressRingProps) {
  const config = RARITY_CONFIG[milestone.rarity];

  const sizes = {
    sm: { ring: 60, stroke: 4, fontSize: 'text-xs' },
    md: { ring: 80, stroke: 6, fontSize: 'text-sm' },
    lg: { ring: 100, stroke: 8, fontSize: 'text-base' }
  };

  const { ring, stroke, fontSize } = sizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (milestone.progress_percentage / 100) * circumference;

  // Colores del anillo segun rareza
  const strokeColors = {
    [AchievementRarity.COMMON]: '#9ca3af', // gray-400
    [AchievementRarity.RARE]: '#3b82f6',   // blue-500
    [AchievementRarity.EPIC]: '#a855f7',   // purple-500
    [AchievementRarity.LEGENDARY]: '#eab308' // yellow-500
  };

  const bgStrokeColors = {
    [AchievementRarity.COMMON]: '#e5e7eb', // gray-200
    [AchievementRarity.RARE]: '#bfdbfe',   // blue-200
    [AchievementRarity.EPIC]: '#e9d5ff',   // purple-200
    [AchievementRarity.LEGENDARY]: '#fef08a' // yellow-200
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Anillo de progreso */}
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg
          className="transform -rotate-90"
          width={ring}
          height={ring}
        >
          {/* Fondo del anillo */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke={bgStrokeColors[milestone.rarity]}
            strokeWidth={stroke}
          />
          {/* Progreso */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke={strokeColors[milestone.rarity]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Contenido central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${config.textColor} ${fontSize}`}>
            {milestone.progress_percentage}%
          </span>
        </div>
      </div>

      {/* Detalles */}
      {showDetails && (
        <div className="mt-3 text-center max-w-[120px]">
          <p className="font-medium text-slate-900 text-sm truncate" title={milestone.title}>
            {milestone.title}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {milestone.current_value}/{milestone.target_value}
          </p>
          <div className={`text-xs font-medium mt-1 ${config.textColor}`}>
            +{milestone.points_reward} pts
          </div>
        </div>
      )}
    </div>
  );
}
