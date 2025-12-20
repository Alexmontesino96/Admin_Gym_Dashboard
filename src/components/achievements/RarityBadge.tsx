'use client';

import { AchievementRarity, RARITY_CONFIG } from '@/lib/api';

interface RarityBadgeProps {
  rarity: AchievementRarity;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function RarityBadge({
  rarity,
  size = 'md',
  showLabel = true,
  className = ''
}: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  // Colores de punto segun rareza
  const dotColors = {
    [AchievementRarity.COMMON]: 'bg-gray-500',
    [AchievementRarity.RARE]: 'bg-blue-500',
    [AchievementRarity.EPIC]: 'bg-purple-500',
    [AchievementRarity.LEGENDARY]: 'bg-yellow-500'
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bgColor} ${config.textColor} border ${config.borderColor}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span className={`${dotSizes[size]} rounded-full ${dotColors[rarity]}`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
