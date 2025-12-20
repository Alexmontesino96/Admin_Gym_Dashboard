'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  activityFeedAPI,
  ActivityType,
  Activity
} from '@/lib/api';
import {
  ArrowLeft,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FlaskConical,
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react';

interface GenerationLog {
  id: string;
  timestamp: Date;
  activityType: ActivityType;
  count: number;
  status: 'success' | 'not_published' | 'error';
  activity?: Activity;
  reason?: string;
  error?: string;
}

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: string; description: string; color: string }[] = [
  {
    type: ActivityType.TRAINING_COUNT,
    label: 'Personas Entrenando',
    icon: '💪',
    description: 'Personas activas ahora mismo',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    type: ActivityType.CLASS_CHECKIN,
    label: 'Check-in a Clase',
    icon: '📍',
    description: 'Personas que se unieron a una clase',
    color: 'from-green-500 to-emerald-600'
  },
  {
    type: ActivityType.ACHIEVEMENT_UNLOCKED,
    label: 'Logros Desbloqueados',
    icon: '⭐',
    description: 'Logros alcanzados recientemente',
    color: 'from-yellow-500 to-amber-600'
  },
  {
    type: ActivityType.STREAK_MILESTONE,
    label: 'Hitos de Racha',
    icon: '🔥',
    description: 'Rachas consecutivas alcanzadas',
    color: 'from-orange-500 to-red-600'
  },
  {
    type: ActivityType.PR_BROKEN,
    label: 'Récords Rotos',
    icon: '🏆',
    description: 'Récords personales superados',
    color: 'from-purple-500 to-pink-600'
  },
  {
    type: ActivityType.GOAL_COMPLETED,
    label: 'Metas Completadas',
    icon: '🎯',
    description: 'Objetivos alcanzados',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    type: ActivityType.SOCIAL_ACTIVITY,
    label: 'Actividad Social',
    icon: '👥',
    description: 'Interacciones sociales',
    color: 'from-teal-500 to-green-600'
  },
  {
    type: ActivityType.CLASS_POPULAR,
    label: 'Clase Popular',
    icon: '📈',
    description: 'Clases con alta asistencia',
    color: 'from-indigo-500 to-purple-600'
  }
];

export default function AdminTestingClient() {
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<GenerationLog[]>([]);

  const generateActivity = async (activityType: ActivityType) => {
    try {
      setLoading(activityType);
      const response = await activityFeedAPI.generateTestActivity(activityType, count);

      const log: GenerationLog = {
        id: `${Date.now()}_${activityType}`,
        timestamp: new Date(),
        activityType,
        count,
        status: response.status === 'success' ? 'success' : 'not_published',
        activity: response.activity,
        reason: response.reason
      };

      setLogs((prev) => [log, ...prev].slice(0, 50)); // Keep last 50 logs
    } catch (err: any) {
      const log: GenerationLog = {
        id: `${Date.now()}_${activityType}_error`,
        timestamp: new Date(),
        activityType,
        count,
        status: 'error',
        error: err.message || 'Error desconocido'
      };

      setLogs((prev) => [log, ...prev].slice(0, 50));
    } finally {
      setLoading(null);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getStatusBadge = (status: GenerationLog['status']) => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="h-4 w-4" />
            Publicado
          </div>
        );
      case 'not_published':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <AlertTriangle className="h-4 w-4" />
            No publicado
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <XCircle className="h-4 w-4" />
            Error
          </div>
        );
    }
  };

  const getActivityTypeConfig = (type: ActivityType) => {
    return ACTIVITY_TYPES.find((t) => t.type === type) || ACTIVITY_TYPES[0];
  };

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
            <FlaskConical className="h-8 w-8 text-purple-600" />
            Testing Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Genera actividades de prueba para el Activity Feed
          </p>
        </div>
      </div>

      {/* Privacy Warning */}
      <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-semibold text-yellow-900">Umbral de Privacidad</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Las actividades con <strong>count &lt; 3</strong> no se publican por razones de privacidad.
              Solo actividades agregadas con 3+ usuarios se muestran en el feed.
            </p>
          </div>
        </div>
      </div>

      {/* Count Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h3>
        <div className="flex items-center gap-4">
          <label htmlFor="count" className="text-sm font-medium text-gray-700">
            Count (cantidad):
          </label>
          <input
            id="count"
            type="number"
            min="1"
            max="1000"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {count < 3 && (
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              No se publicará (count &lt; 3)
            </div>
          )}
          {count >= 3 && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Se publicará
            </div>
          )}
        </div>
      </div>

      {/* Activity Type Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Actividades</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACTIVITY_TYPES.map((activityType) => (
            <button
              key={activityType.type}
              onClick={() => generateActivity(activityType.type)}
              disabled={loading === activityType.type}
              className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                loading === activityType.type
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg hover:scale-105 cursor-pointer border-gray-200 hover:border-indigo-400'
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activityType.color} flex items-center justify-center text-2xl shadow-md`}>
                  {activityType.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{activityType.label}</h4>
                  <p className="text-xs text-gray-500 mt-1">{activityType.description}</p>
                </div>
                {loading === activityType.type && (
                  <div className="flex items-center gap-2 text-indigo-600 text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generando...
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Log de Actividades Generadas</h3>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No hay actividades generadas aún</p>
            <p className="text-sm text-gray-400 mt-1">
              Haz clic en cualquier botón para generar una actividad de prueba
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.map((log) => {
              const typeConfig = getActivityTypeConfig(log.activityType);
              return (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{typeConfig.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{typeConfig.label}</span>
                          <span className="text-gray-500">·</span>
                          <span className="text-sm text-gray-500">
                            {log.timestamp.toLocaleTimeString('es-ES')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Count: <strong>{log.count}</strong>
                        </p>
                        {log.status === 'success' && log.activity && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                            <p className="text-sm font-medium text-green-900">{log.activity.message}</p>
                            <p className="text-xs text-green-600 mt-1">
                              ID: {log.activity.id} · TTL: {log.activity.ttl_minutes} min
                            </p>
                          </div>
                        )}
                        {log.status === 'not_published' && log.reason && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                            <p className="text-sm text-yellow-800">
                              <strong>Razón:</strong> {log.reason}
                            </p>
                          </div>
                        )}
                        {log.status === 'error' && log.error && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                            <p className="text-sm text-red-800">
                              <strong>Error:</strong> {log.error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>{getStatusBadge(log.status)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/activity-feed"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-indigo-200 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Ver Feed</p>
              <p className="text-xs text-gray-500">Feed de actividades</p>
            </div>
          </Link>

          <Link
            href="/activity-feed/realtime"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-indigo-200 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Tiempo Real</p>
              <p className="text-xs text-gray-500">Estadísticas en vivo</p>
            </div>
          </Link>

          <Link
            href="/activity-feed/rankings"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-indigo-200 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Rankings</p>
              <p className="text-xs text-gray-500">Leaderboards anónimos</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
