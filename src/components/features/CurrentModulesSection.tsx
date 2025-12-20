'use client';

import React from 'react';
import { Check, Zap, Trophy } from 'lucide-react';
import type { EnrichedModule } from '@/hooks/useModules';

interface CurrentModulesSectionProps {
  activeModules: EnrichedModule[];
  totalModules: number;
}

export default function CurrentModulesSection({
  activeModules,
  totalModules
}: CurrentModulesSectionProps) {
  const activeCount = activeModules.length;
  const inactiveCount = totalModules - activeCount;
  const progressPercentage = (activeCount / totalModules) * 100;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Tu Panel Actual</h2>
          </div>
          <p className="text-slate-700">
            Estás usando{' '}
            <span className="font-bold text-green-600">{activeCount}</span> de{' '}
            <span className="font-bold">{totalModules}</span> funcionalidades
          </p>
        </div>

        {inactiveCount > 0 && (
          <div className="bg-white rounded-2xl px-4 py-3 border-2 border-green-300 shadow-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{inactiveCount}</div>
                <div className="text-xs text-slate-600">por desbloquear</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progreso de activación</span>
          <span className="text-sm font-bold text-green-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-4 shadow-inner border border-green-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 15 && (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
      </div>

      {/* Grid de módulos activos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {activeModules.map((module) => {
          const IconComponent = module.icon;
          return (
            <div
              key={module.code}
              className="bg-white rounded-2xl p-4 border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all duration-200 group cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-semibold text-slate-900 line-clamp-2">
                  {module.displayName}
                </div>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <Check className="w-3 h-3" />
                  <span className="text-xs font-medium">Activo</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje motivacional */}
      {progressPercentage < 100 && (
        <div className="mt-6 bg-white rounded-2xl p-4 border-2 border-green-200 text-center">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-green-600">¡Sigue así!</span> Desbloquea {inactiveCount} módulos
            más para acceder al{' '}
            <span className="font-bold">100% de las funcionalidades</span>
          </p>
        </div>
      )}

      {progressPercentage === 100 && (
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-300 text-center">
          <p className="text-sm">
            <span className="text-2xl">🎉</span>{' '}
            <span className="font-bold text-orange-600">¡Felicidades!</span> Tienes todas las
            funcionalidades activadas
          </p>
        </div>
      )}
    </div>
  );
}
