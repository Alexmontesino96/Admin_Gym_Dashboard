'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  RankingsResponse,
  RankingType,
  RankingPeriod,
  RankingEntry,
  activityFeedAPI,
  getRankingTypeConfig,
  RANKING_TYPE_CONFIG
} from '@/lib/api';
import {
  Trophy,
  Clock,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Shield,
  Flame,
  Target,
  TrendingUp,
  Timer,
  Gem,
  Calendar,
  CalendarDays,
  CalendarRange
} from 'lucide-react';

// Skeleton loader
const RankingsSkeleton = () => (
  <div className="space-y-6">
    <div className="mb-8">
      <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
    </div>

    {/* Tabs Skeleton */}
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 bg-gray-200 rounded-lg w-28 flex-shrink-0 animate-pulse"></div>
      ))}
    </div>

    {/* Rankings List Skeleton */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const rankingTypes: RankingType[] = [
  RankingType.CONSISTENCY,
  RankingType.ATTENDANCE,
  RankingType.IMPROVEMENT,
  RankingType.ACTIVITY,
  RankingType.DEDICATION
];

const periodOptions: { value: RankingPeriod; label: string; icon: React.ReactNode }[] = [
  { value: RankingPeriod.DAILY, label: 'Hoy', icon: <Calendar className="h-4 w-4" /> },
  { value: RankingPeriod.WEEKLY, label: 'Semana', icon: <CalendarDays className="h-4 w-4" /> },
  { value: RankingPeriod.MONTHLY, label: 'Mes', icon: <CalendarRange className="h-4 w-4" /> }
];

const getTypeIcon = (type: RankingType) => {
  switch (type) {
    case RankingType.CONSISTENCY:
      return <Flame className="h-5 w-5" />;
    case RankingType.ATTENDANCE:
      return <Target className="h-5 w-5" />;
    case RankingType.IMPROVEMENT:
      return <TrendingUp className="h-5 w-5" />;
    case RankingType.ACTIVITY:
      return <Timer className="h-5 w-5" />;
    case RankingType.DEDICATION:
      return <Gem className="h-5 w-5" />;
    default:
      return <Trophy className="h-5 w-5" />;
  }
};

const getPositionStyle = (position: number) => {
  switch (position) {
    case 1:
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200';
    case 2:
      return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md';
    case 3:
      return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function RankingsClient() {
  const [selectedType, setSelectedType] = useState<RankingType>(RankingType.CONSISTENCY);
  const [selectedPeriod, setSelectedPeriod] = useState<RankingPeriod>(RankingPeriod.WEEKLY);
  const [rankings, setRankings] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadRankings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activityFeedAPI.getRankings(selectedType, selectedPeriod, 10);
      setRankings(response);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando rankings:', err);
      setError('Error al cargar los rankings');
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedPeriod]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  const typeConfig = getRankingTypeConfig(selectedType);

  if (loading && !rankings) return <RankingsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            href="/activity-feed"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Feed
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500" />
            Rankings Anonimos
          </h1>
          <p className="text-gray-600 mt-2">
            Top 10 en diferentes categorias - Solo valores, sin nombres
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Privacy Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
            <Shield className="h-4 w-4" />
            <span>100% Anonimo</span>
          </div>

          {/* Last Update */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadRankings}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
            title="Refrescar"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Periodo:</span>
          <div className="flex gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === option.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {rankingTypes.map((type) => {
          const config = RANKING_TYPE_CONFIG[type];
          const isActive = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <span className="text-lg">{config.icon}</span>
              {config.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadRankings}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Selected Type Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">
                {typeConfig.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{typeConfig.label}</h2>
                <p className="text-gray-600">{typeConfig.description}</p>
                {rankings?.unit && (
                  <p className="text-sm text-indigo-600 mt-1 font-medium">
                    Unidad: {rankings.unit}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rankings List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {rankings?.rankings && rankings.rankings.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {rankings.rankings.map((entry: RankingEntry) => (
                  <div
                    key={entry.position}
                    className={`px-6 py-4 flex items-center gap-4 transition-colors ${
                      entry.position <= 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Position */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getPositionStyle(entry.position)}`}
                    >
                      {entry.badge || `#${entry.position}`}
                    </div>

                    {/* Position Label */}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Posicion #{entry.position}
                      </p>
                      <p className="text-sm text-gray-500">
                        {entry.position === 1 && 'Lider del ranking'}
                        {entry.position === 2 && 'Segundo lugar'}
                        {entry.position === 3 && 'Tercer lugar'}
                        {entry.position > 3 && `Top ${entry.position}`}
                      </p>
                    </div>

                    {/* Value */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{entry.value}</p>
                      <p className="text-xs text-gray-500">{rankings.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <Trophy className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No hay datos de ranking disponibles</p>
                <p className="text-sm text-gray-400 mt-1">
                  Los rankings aparecen cuando hay suficiente actividad
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Rankings 100% Anonimos</h4>
            <p className="text-sm text-gray-600 mt-1">
              Los rankings muestran solo valores numericos ordenados, sin nombres ni identificadores.
              No es posible saber quien ocupa cada posicion. Los rankings requieren un minimo de 5
              participantes para mostrarse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
