'use client';

import { useState, useEffect } from 'react';
import {
  achievementsAPI,
  AchievementsResponse,
  AchievementRarity,
  RARITY_CONFIG,
  NextMilestone,
  Achievement,
  ACHIEVEMENT_TYPE_CONFIG,
  AchievementType
} from '@/lib/api';
import { AchievementCard, RarityBadge, ProgressRing } from '@/components/achievements';
import {
  Trophy,
  Star,
  Target,
  Flame,
  Award,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

type RarityTab = 'all' | AchievementRarity;

export default function LogrosClient() {
  const [achievements, setAchievements] = useState<AchievementsResponse | null>(null);
  const [nextMilestones, setNextMilestones] = useState<NextMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RarityTab>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [achievementsData, milestonesData] = await Promise.all([
        achievementsAPI.getMyAchievements(),
        achievementsAPI.getNextMilestones()
      ]);

      setAchievements(achievementsData);
      setNextMilestones(milestonesData);
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError('No se pudieron cargar los logros. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los achievements en un solo array
  const getAllAchievements = (): Achievement[] => {
    if (!achievements) return [];
    return [
      ...achievements.by_rarity.legendary,
      ...achievements.by_rarity.epic,
      ...achievements.by_rarity.rare,
      ...achievements.by_rarity.common
    ];
  };

  // Filtrar achievements por tab activo
  const getFilteredAchievements = (): Achievement[] => {
    if (!achievements) return [];
    if (activeTab === 'all') return getAllAchievements();
    return achievements.by_rarity[activeTab] || [];
  };

  // Estadisticas por tipo
  const getStatsByType = () => {
    const allAchievements = getAllAchievements();
    const stats: Record<string, number> = {};

    allAchievements.forEach(a => {
      stats[a.achievement_type] = (stats[a.achievement_type] || 0) + 1;
    });

    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-600">Cargando tus logros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-slate-600">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!achievements) return null;

  const filteredAchievements = getFilteredAchievements();
  const statsByType = getStatsByType();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            Mis Logros
          </h1>
          <p className="text-slate-600 mt-1">
            Tu progreso y logros desbloqueados
          </p>
        </div>

        {/* Puntos totales */}
        <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
          <span className="text-2xl font-bold text-amber-700">
            {achievements.total_points}
          </span>
          <span className="text-amber-600">puntos</span>
        </div>
      </div>

      {/* Estadisticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(RARITY_CONFIG).map(([rarity, config]) => {
          const count = achievements.by_rarity[rarity as keyof typeof achievements.by_rarity]?.length || 0;
          return (
            <div
              key={rarity}
              className={`
                p-4 rounded-xl border-2 transition-all cursor-pointer
                ${activeTab === rarity ? `${config.borderColor} ${config.bgColor}` : 'border-slate-200 bg-white hover:border-slate-300'}
              `}
              onClick={() => setActiveTab(rarity as AchievementRarity)}
            >
              <div className="flex items-center justify-between">
                <RarityBadge rarity={rarity as AchievementRarity} size="sm" />
                <span className={`text-2xl font-bold ${config.textColor}`}>
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proximos hitos */}
      {nextMilestones.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Proximos Hitos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nextMilestones.map((milestone, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 flex items-center gap-4"
              >
                <ProgressRing milestone={milestone} size="sm" showDetails={false} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate" title={milestone.title}>
                    {milestone.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {milestone.current_value}/{milestone.target_value} {milestone.description.split(' ')[0]}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-amber-600 font-medium">
                      +{milestone.points_reward} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logros recientes */}
      {achievements.recent.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-900">Logros Recientes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.recent.slice(0, 3).map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* Tabs de filtro */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4 overflow-x-auto pb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
              ${activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }
            `}
          >
            Todos ({getAllAchievements().length})
          </button>
          {Object.entries(RARITY_CONFIG).map(([rarity, config]) => {
            const count = achievements.by_rarity[rarity as keyof typeof achievements.by_rarity]?.length || 0;
            return (
              <button
                key={rarity}
                onClick={() => setActiveTab(rarity as AchievementRarity)}
                className={`
                  px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2
                  ${activeTab === rarity
                    ? `border-${config.color}-600 ${config.textColor}`
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }
                `}
              >
                <RarityBadge rarity={rarity as AchievementRarity} size="sm" showLabel={false} />
                {config.label} ({count})
              </button>
            );
          })}
        </nav>
      </div>

      {/* Grid de logros */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <Award className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">
            No hay logros en esta categoria
          </h3>
          <p className="mt-2 text-slate-600">
            Sigue entrenando para desbloquear mas logros
          </p>
        </div>
      )}

      {/* Estadisticas por tipo */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-900">Logros por Categoria</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(ACHIEVEMENT_TYPE_CONFIG).map(([type, config]) => {
            const count = statsByType[type] || 0;
            return (
              <div
                key={type}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{config.label}</p>
                  <p className="text-lg font-bold text-slate-700">{count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Banner motivacional */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Flame className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Sigue asi</h3>
            <p className="text-indigo-100 mt-1">
              Cada entrenamiento te acerca a nuevos logros. Tu dedicacion es tu mayor recompensa.
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-indigo-200" />
        </div>
      </div>
    </div>
  );
}
