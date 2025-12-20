'use client';

import React, { useState } from 'react';
import { Check, Star, Users, ChevronRight } from 'lucide-react';
import ModuleBadge from './ModuleBadge';
import type { EnrichedModule } from '@/hooks/useModules';

interface ModuleCardProps {
  module: EnrichedModule;
  onActivate: () => void;
}

export default function ModuleCard({ module, onActivate }: ModuleCardProps) {
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await onActivate();
    } finally {
      setIsActivating(false);
    }
  };

  const IconComponent = module.icon;

  return (
    <div className="group relative bg-white rounded-3xl shadow-lg border-2 border-slate-200 hover:border-indigo-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
      {/* Badges superiores */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-10">
        {module.badges.map((badge) => (
          <ModuleBadge key={badge} type={badge} />
        ))}
        {module.isActive && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
            <Check className="w-3 h-3" />
            Activado
          </span>
        )}
      </div>

      {/* Icono grande */}
      <div className="pt-16 pb-6 px-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
          <IconComponent className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Contenido */}
      <div className="px-6 pb-6 space-y-4">
        {/* Título y tagline */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            {module.displayName}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {module.tagline}
          </p>
        </div>

        {/* Beneficios */}
        <div className="space-y-2 py-4">
          {module.benefits.slice(0, 3).map((benefit, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <span className="text-sm text-slate-700 font-medium">
              {module.socialProof.estimatedGymsUsing.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-slate-900">
              {module.socialProof.rating.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">
              ({module.socialProof.reviewsCount})
            </span>
          </div>
        </div>

        {/* FOMO messages */}
        {module.fomoMessages.length > 0 && (
          <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <p className="text-xs text-orange-800 font-medium">
              {module.fomoMessages[0]}
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-2 pt-2">
          {module.isActive ? (
            <button
              className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>Ver módulo</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isActivating ? (
                <span>Activando...</span>
              ) : (
                <>
                  <span>Activar ahora</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}

          {module.pricing && !module.isActive && (
            <div className="text-center">
              <p className="text-xs text-slate-500">
                Prueba gratis {module.pricing.trialDays} días - sin tarjeta
              </p>
            </div>
          )}
        </div>

        {/* Activaciones esta semana */}
        {module.socialProof.activationsThisWeek > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>{module.socialProof.activationsThisWeek} activaciones esta semana</span>
          </div>
        )}
      </div>
    </div>
  );
}
