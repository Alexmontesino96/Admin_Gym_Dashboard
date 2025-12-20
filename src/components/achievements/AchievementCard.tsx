'use client';

import { Achievement, AchievementRarity, RARITY_CONFIG, formatAchievementDate } from '@/lib/api';
import RarityBadge from './RarityBadge';
import { Star, Clock } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDate?: boolean;
  showPoints?: boolean;
  className?: string;
}

export default function AchievementCard({
  achievement,
  size = 'md',
  showDate = true,
  showPoints = true,
  className = ''
}: AchievementCardProps) {
  const config = RARITY_CONFIG[achievement.rarity];

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl'
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Efecto de brillo para legendarios
  const legendaryGlow = achievement.rarity === AchievementRarity.LEGENDARY
    ? 'ring-2 ring-yellow-400 ring-opacity-50 shadow-lg shadow-yellow-200/50'
    : '';

  // Efecto de brillo para epicos
  const epicGlow = achievement.rarity === AchievementRarity.EPIC
    ? 'ring-1 ring-purple-300 ring-opacity-50 shadow-md shadow-purple-100/50'
    : '';

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border bg-white
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-lg
        ${config.borderColor}
        ${legendaryGlow}
        ${epicGlow}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {/* Fondo decorativo segun rareza */}
      <div
        className={`
          absolute inset-0 opacity-5
          ${config.bgColor}
        `}
      />

      {/* Contenido */}
      <div className="relative z-10">
        {/* Header con icono y badge */}
        <div className="flex items-start justify-between gap-3">
          {/* Icono grande */}
          <div
            className={`
              flex items-center justify-center
              w-14 h-14 rounded-xl
              ${config.bgColor}
              ${iconSizes[size]}
            `}
          >
            {achievement.icon}
          </div>

          {/* Badge de rareza */}
          <RarityBadge rarity={achievement.rarity} size="sm" />
        </div>

        {/* Titulo y descripcion */}
        <div className="mt-3">
          <h3 className={`font-semibold text-slate-900 ${titleSizes[size]}`}>
            {achievement.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {achievement.description}
          </p>
        </div>

        {/* Footer con puntos y fecha */}
        <div className="mt-4 flex items-center justify-between text-sm">
          {showPoints && (
            <div className="flex items-center gap-1 text-amber-600 font-medium">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>+{achievement.points_awarded} pts</span>
            </div>
          )}

          {showDate && (
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatAchievementDate(achievement.earned_at)}</span>
            </div>
          )}
        </div>

        {/* Valor del logro */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className={`text-xs font-medium ${config.textColor}`}>
            {achievement.value} {achievement.unit}
          </div>
        </div>
      </div>

      {/* Efecto de brillo animado para legendarios */}
      {achievement.rarity === AchievementRarity.LEGENDARY && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -inset-full top-0 block w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer" />
        </div>
      )}
    </div>
  );
}
