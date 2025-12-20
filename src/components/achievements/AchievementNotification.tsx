'use client';

import { useState, useEffect, useCallback } from 'react';
import { Achievement, RARITY_CONFIG, AchievementRarity } from '@/lib/api';
import { X, Star, Sparkles } from 'lucide-react';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoCloseMs?: number;
}

export default function AchievementNotification({
  achievement,
  onClose,
  autoCloseMs = 5000
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const config = RARITY_CONFIG[achievement.rarity];

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Animacion de entrada
    setTimeout(() => setIsVisible(true), 50);

    // Auto-cierre
    if (autoCloseMs > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [autoCloseMs, handleClose]);

  // Colores de fondo segun rareza
  const bgGradients = {
    [AchievementRarity.COMMON]: 'from-gray-50 to-gray-100 border-gray-300',
    [AchievementRarity.RARE]: 'from-blue-50 to-blue-100 border-blue-300',
    [AchievementRarity.EPIC]: 'from-purple-50 to-purple-100 border-purple-300',
    [AchievementRarity.LEGENDARY]: 'from-yellow-50 to-amber-100 border-yellow-400'
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-[100] max-w-sm w-full
        transition-all duration-300 ease-out
        ${isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          relative overflow-hidden rounded-xl border-2 shadow-2xl
          bg-gradient-to-br ${bgGradients[achievement.rarity]}
        `}
      >
        {/* Efecto de brillo para legendarios */}
        {achievement.rarity === AchievementRarity.LEGENDARY && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -inset-full top-0 block w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer" />
          </div>
        )}

        {/* Header */}
        <div className="relative px-4 py-3 bg-white/50 border-b border-white/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${config.textColor}`} />
            <span className={`font-semibold ${config.textColor}`}>
              Nuevo Logro Desbloqueado
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="relative p-4">
          <div className="flex items-start gap-4">
            {/* Icono grande con animacion */}
            <div
              className={`
                flex-shrink-0 w-16 h-16 rounded-xl
                flex items-center justify-center text-4xl
                ${config.bgColor}
                animate-bounce-slow
              `}
            >
              {achievement.icon}
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-lg text-slate-900 truncate">
                {achievement.title}
              </h4>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {achievement.description}
              </p>

              {/* Puntos y rareza */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>+{achievement.points_awarded} pts</span>
                </div>
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${config.bgColor} ${config.textColor}
                  `}
                >
                  {config.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso de cierre */}
        {autoCloseMs > 0 && (
          <div className="h-1 bg-white/30">
            <div
              className={`h-full ${config.bgColor} animate-shrink`}
              style={{
                animationDuration: `${autoCloseMs}ms`,
                animationTimingFunction: 'linear'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
