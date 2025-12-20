'use client';

import React, { useState, useMemo } from 'react';
import { Filter, SortDesc } from 'lucide-react';
import ModuleCard from './ModuleCard';
import type { EnrichedModule } from '@/hooks/useModules';

interface ModulesMarketplaceProps {
  modules: EnrichedModule[];
  onActivate: (code: string) => Promise<void>;
}

type FilterType = 'all' | 'base' | 'premium';
type SortType = 'popular' | 'rating' | 'new';

export default function ModulesMarketplace({ modules, onActivate }: ModulesMarketplaceProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('popular');

  const filteredAndSortedModules = useMemo(() => {
    let result = [...modules];

    // Filtrar
    if (filter === 'base') {
      result = result.filter(m => !m.is_premium);
    } else if (filter === 'premium') {
      result = result.filter(m => m.is_premium);
    }

    // Ordenar
    if (sort === 'popular') {
      result.sort((a, b) =>
        b.socialProof.estimatedGymsUsing - a.socialProof.estimatedGymsUsing
      );
    } else if (sort === 'rating') {
      result.sort((a, b) =>
        b.socialProof.rating - a.socialProof.rating
      );
    } else if (sort === 'new') {
      // Ordenar por badges "new" primero
      result.sort((a, b) => {
        const aHasNew = a.badges.includes('new') ? 1 : 0;
        const bHasNew = b.badges.includes('new') ? 1 : 0;
        return bHasNew - aHasNew;
      });
    }

    return result;
  }, [modules, filter, sort]);

  return (
    <div id="marketplace" className="space-y-8">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Módulos Disponibles
          </h2>
          <p className="text-slate-600">
            Descubre y activa nuevas funcionalidades para tu gimnasio
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Filtros */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('base')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'base'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Base
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'premium'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Premium
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <option value="popular">Más populares</option>
              <option value="rating">Mejor calificados</option>
              <option value="new">Más recientes</option>
            </select>
            <SortDesc className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Filter className="w-4 h-4" />
        <span>
          Mostrando {filteredAndSortedModules.length} de {modules.length} módulos
        </span>
      </div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedModules.map((module, index) => (
          <div
            key={module.code}
            className="animate-slide-in-bottom"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'backwards'
            }}
          >
            <ModuleCard
              module={module}
              onActivate={() => onActivate(module.code)}
            />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredAndSortedModules.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Filter className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No hay módulos disponibles
          </h3>
          <p className="text-slate-600">
            Intenta con otro filtro o criterio de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
