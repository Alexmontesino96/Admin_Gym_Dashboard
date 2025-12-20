'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  RealtimeStats,
  PopularClass,
  activityFeedAPI,
  getTrendIcon,
  getTrendLabel,
  HourlyTrend
} from '@/lib/api';
import {
  TrendingUp,
  Users,
  Clock,
  RefreshCw,
  AlertCircle,
  Zap,
  ArrowLeft,
  Shield,
  Dumbbell,
  Heart,
  Activity,
  Timer,
  Sun,
  Moon
} from 'lucide-react';

// Skeleton loader
const RealtimeStatsSkeleton = () => (
  <div className="space-y-6">
    <div className="mb-8">
      <div className="h-9 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
    </div>

    {/* Big Counter Skeleton */}
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8">
      <div className="text-center">
        <div className="h-20 bg-white/20 rounded-xl w-48 mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-white/20 rounded w-64 mx-auto animate-pulse"></div>
      </div>
    </div>

    {/* Areas Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function RealtimeStatsClient() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const response = await activityFeedAPI.getRealtimeStats();
      setStats(response.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando stats en tiempo real:', err);
      setError('Error al cargar las estadisticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();

    // Auto-refresh cada 15 segundos si esta activo
    if (isAutoRefresh) {
      refreshIntervalRef.current = setInterval(loadStats, 15000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loadStats, isAutoRefresh]);

  const getAreaIcon = (area: string) => {
    switch (area.toLowerCase()) {
      case 'cardio':
        return <Heart className="h-6 w-6 text-red-500" />;
      case 'weights':
      case 'pesas':
        return <Dumbbell className="h-6 w-6 text-blue-500" />;
      case 'functional':
      case 'funcional':
        return <Activity className="h-6 w-6 text-green-500" />;
      default:
        return <Zap className="h-6 w-6 text-purple-500" />;
    }
  };

  const getAreaColor = (area: string) => {
    switch (area.toLowerCase()) {
      case 'cardio':
        return 'from-red-500 to-pink-500';
      case 'weights':
      case 'pesas':
        return 'from-blue-500 to-indigo-500';
      case 'functional':
      case 'funcional':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-purple-500 to-violet-500';
    }
  };

  const getAreaBg = (area: string) => {
    switch (area.toLowerCase()) {
      case 'cardio':
        return 'bg-red-50 border-red-200';
      case 'weights':
      case 'pesas':
        return 'bg-blue-50 border-blue-200';
      case 'functional':
      case 'funcional':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-purple-50 border-purple-200';
    }
  };

  if (loading) return <RealtimeStatsSkeleton />;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

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
            <TrendingUp className="h-8 w-8 text-indigo-600" />
            Estadisticas en Tiempo Real
          </h1>
          <p className="text-gray-600 mt-2">
            Visualiza la actividad actual de tu gimnasio
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
              isAutoRefresh
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Timer className="h-4 w-4" />
            {isAutoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>

          {/* Last Update */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadStats}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refrescar"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Big Active Counter */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 shadow-xl">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="text-8xl md:text-9xl font-bold text-white drop-shadow-lg">
              {stats?.active_now || 0}
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
          </div>
          <p className="text-white/90 text-xl mt-4 font-medium">
            Personas entrenando ahora mismo
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-3xl">{getTrendIcon(stats?.hourly_trend || HourlyTrend.STABLE)}</span>
            <span className="text-white/80 text-lg">
              Tendencia: {getTrendLabel(stats?.hourly_trend || HourlyTrend.STABLE)}
            </span>
          </div>
        </div>
      </div>

      {/* Peak Hour Indicator */}
      {stats?.is_peak_hour && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-center gap-3 text-white">
            <Zap className="h-6 w-6 animate-pulse" />
            <span className="text-lg font-semibold">Hora Pico Activa</span>
            <Zap className="h-6 w-6 animate-pulse" />
          </div>
        </div>
      )}

      {/* Peak Hours Info */}
      {stats?.peak_hours && stats.peak_hours.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Horarios Pico del Dia
          </h3>
          <div className="flex flex-wrap gap-3">
            {stats.peak_hours.map((hour, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-orange-50 text-orange-800 px-4 py-2 rounded-full"
              >
                {hour.includes('07:') || hour.includes('08:') || hour.includes('09:') ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="font-medium">{hour}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribution by Area */}
      {stats?.by_area && Object.keys(stats.by_area).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Distribucion por Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(stats.by_area).map(([area, count]) => (
              <div
                key={area}
                className={`rounded-xl border p-6 ${getAreaBg(area)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getAreaIcon(area)}
                    <span className="text-gray-700 font-medium capitalize">{area}</span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900">{count}</div>
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getAreaColor(area)} rounded-full transition-all duration-500`}
                      style={{
                        width: `${Math.min((count / (stats.active_now || 1)) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.active_now ? Math.round((count / stats.active_now) * 100) : 0}% del total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Classes */}
      {stats?.popular_classes && stats.popular_classes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Clases Populares Ahora
          </h3>
          <div className="space-y-4">
            {stats.popular_classes.map((classItem: PopularClass, index: number) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{classItem.name}</h4>
                      <p className="text-sm text-gray-500">
                        {classItem.participants} / {classItem.capacity} participantes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      classItem.percentage >= 90 ? 'text-red-600' :
                      classItem.percentage >= 70 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {classItem.percentage}%
                    </div>
                    <p className="text-xs text-gray-500">ocupacion</p>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      classItem.percentage >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      classItem.percentage >= 70 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                      'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${classItem.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Datos 100% Anonimos</h4>
            <p className="text-sm text-gray-600 mt-1">
              Estas estadisticas se calculan de forma agregada sin identificar usuarios individuales.
              Solo se muestran datos cuando hay 3 o mas personas en cada categoria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
