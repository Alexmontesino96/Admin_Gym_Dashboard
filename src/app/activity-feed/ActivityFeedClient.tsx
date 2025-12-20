'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Activity,
  ActivityFeedResponse,
  RealtimeStats,
  InsightsResponse,
  DailySummaryResponse,
  activityFeedAPI,
  formatActivityTime,
  getActivityTypeConfig,
  getTrendIcon,
  getTrendLabel,
  HourlyTrend
} from '@/lib/api';
import {
  TrendingUp,
  Trophy,
  Users,
  Clock,
  RefreshCw,
  AlertCircle,
  Zap,
  BarChart3,
  Target,
  Flame,
  Star,
  ChevronRight,
  Shield
} from 'lucide-react';

// Skeleton loader
const ActivityFeedSkeleton = () => (
  <div className="space-y-6">
    <div className="mb-8">
      <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
    </div>

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Feed Skeleton */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function ActivityFeedClient() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todos los datos en paralelo
      const [feedResponse, statsResponse, insightsResponse, summaryResponse] = await Promise.all([
        activityFeedAPI.getFeed(20, 0),
        activityFeedAPI.getRealtimeStats(),
        activityFeedAPI.getInsights(),
        activityFeedAPI.getDailySummary()
      ]);

      setActivities(feedResponse.activities);
      setHasMore(feedResponse.has_more);
      setOffset(feedResponse.offset + feedResponse.activities.length);
      setRealtimeStats(statsResponse.data);
      setInsights(insightsResponse.insights);
      setDailySummary(summaryResponse);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando activity feed:', err);
      setError('Error al cargar el feed de actividad');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreActivities = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const response = await activityFeedAPI.getFeed(20, offset);
      setActivities(prev => [...prev, ...response.activities]);
      setHasMore(response.has_more);
      setOffset(prev => prev + response.activities.length);
    } catch (err) {
      console.error('Error cargando mas actividades:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const refreshStats = useCallback(async () => {
    try {
      const [statsResponse, insightsResponse] = await Promise.all([
        activityFeedAPI.getRealtimeStats(),
        activityFeedAPI.getInsights()
      ]);
      setRealtimeStats(statsResponse.data);
      setInsights(insightsResponse.insights);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error refrescando stats:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();

    // Auto-refresh cada 30 segundos
    refreshIntervalRef.current = setInterval(refreshStats, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loadInitialData, refreshStats]);

  if (loading) return <ActivityFeedSkeleton />;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadInitialData}
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="h-8 w-8 text-indigo-600" />
            Feed de Actividad
          </h1>
          <p className="text-gray-600 mt-2">
            Estadisticas anonimas en tiempo real de tu comunidad
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
            <span>Actualizado: {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshStats}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refrescar"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Now */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Activos Ahora</p>
              <p className="text-4xl font-bold mt-1">{realtimeStats?.active_now || 0}</p>
              <div className="flex items-center gap-1 mt-2 text-indigo-100 text-sm">
                <span>{getTrendIcon(realtimeStats?.hourly_trend || HourlyTrend.STABLE)}</span>
                <span>{getTrendLabel(realtimeStats?.hourly_trend || HourlyTrend.STABLE)}</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Asistencias Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{dailySummary?.stats.attendance || 0}</p>
              <p className="text-sm text-gray-500 mt-1">{dailySummary?.stats.classes_completed || 0} clases</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Logros Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{dailySummary?.stats.achievements || 0}</p>
              <p className="text-sm text-gray-500 mt-1">{dailySummary?.stats.personal_records || 0} records</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Active Streaks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Rachas Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{dailySummary?.stats.active_streaks || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Engagement: {dailySummary?.stats.engagement_score || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Insights del Momento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 text-gray-700 shadow-sm"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Highlights */}
      {dailySummary?.highlights && dailySummary.highlights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Destacados del Dia
          </h3>
          <div className="flex flex-wrap gap-3">
            {dailySummary.highlights.map((highlight, index) => (
              <div
                key={index}
                className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/activity-feed/realtime"
          className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Estadisticas en Tiempo Real</h3>
                <p className="text-sm text-gray-500">Distribucion por areas, clases populares, horas pico</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/activity-feed/rankings"
          className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Rankings Anonimos</h3>
                <p className="text-sm text-gray-500">Top 10 en consistencia, asistencia, mejora y mas</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            Actividad Reciente
          </h2>
          <span className="text-sm text-gray-500">{activities.length} actividades</span>
        </div>

        {activities.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Zap className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No hay actividades recientes</p>
            <p className="text-sm text-gray-400 mt-1">Las actividades apareceran aqui cuando haya movimiento</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => {
                const config = getActivityTypeConfig(activity.subtype);
                return (
                  <div
                    key={activity.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                        ${config.color === 'blue' ? 'bg-blue-100' : ''}
                        ${config.color === 'green' ? 'bg-green-100' : ''}
                        ${config.color === 'yellow' ? 'bg-yellow-100' : ''}
                        ${config.color === 'orange' ? 'bg-orange-100' : ''}
                        ${config.color === 'purple' ? 'bg-purple-100' : ''}
                        ${config.color === 'teal' ? 'bg-teal-100' : ''}
                        ${config.color === 'pink' ? 'bg-pink-100' : ''}
                        ${config.color === 'indigo' ? 'bg-indigo-100' : ''}
                        ${config.color === 'gray' ? 'bg-gray-100' : ''}
                        ${config.color === 'amber' ? 'bg-amber-100' : ''}
                      `}>
                        {activity.icon || config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium">{activity.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatActivityTime(activity.timestamp)}
                          </span>
                          {activity.ttl_minutes && (
                            <span className="text-xs text-gray-400">
                              Expira en {activity.ttl_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-700">
                        {activity.count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="px-6 py-4 border-t border-gray-100 text-center">
                <button
                  onClick={loadMoreActivities}
                  disabled={loadingMore}
                  className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Cargando...' : 'Cargar mas actividades'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Privacidad Garantizada</h4>
            <p className="text-sm text-gray-600 mt-1">
              Todos los datos mostrados son completamente anonimos. Solo se muestran estadisticas
              agregadas cuando hay 3 o mas participantes. No se exponen nombres, identidades ni
              informacion personal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
