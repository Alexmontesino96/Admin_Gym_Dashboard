'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Loader2
} from 'lucide-react';
import { nutritionAPI, PlanFollowersResponse, FollowerInfo } from '@/lib/api';

interface FollowersTableProps {
  planId: number;
  initialData?: PlanFollowersResponse;
}

export default function FollowersTable({ planId, initialData }: FollowersTableProps) {
  const [loading, setLoading] = useState(!initialData);
  const [data, setData] = useState<PlanFollowersResponse | null>(initialData || null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Cargar datos
  const fetchFollowers = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await nutritionAPI.getPlanFollowers(planId, pageNum, perPage);
      setData(response);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchFollowers(1);
    }
  }, [planId, initialData]);

  // Obtener icono y color del estado
  const getStatusBadge = (status: FollowerInfo['status']) => {
    const statusConfig = {
      running: {
        icon: <Play size={14} />,
        label: 'En curso',
        className: 'bg-green-100 text-green-700'
      },
      completed: {
        icon: <CheckCircle size={14} />,
        label: 'Completado',
        className: 'bg-blue-100 text-blue-700'
      },
      abandoned: {
        icon: <XCircle size={14} />,
        label: 'Abandonado',
        className: 'bg-red-100 text-red-700'
      },
      paused: {
        icon: <Pause size={14} />,
        label: 'Pausado',
        className: 'bg-amber-100 text-amber-700'
      }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Formatear tiempo relativo
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Sin actividad';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return formatDate(dateString);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin text-green-600" />
      </div>
    );
  }

  if (!data || data.followers.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <User size={32} className="mx-auto mb-2 text-slate-300" />
        <p>No hay seguidores para este plan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Usuario</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Progreso</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-slate-600">Estado</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Inicio</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Última actividad</th>
            </tr>
          </thead>
          <tbody>
            {data.followers.map((follower) => (
              <tr key={follower.user_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    {follower.user_photo ? (
                      <img
                        src={follower.user_photo}
                        alt={follower.user_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <User size={16} className="text-slate-500" />
                      </div>
                    )}
                    <span className="font-medium text-slate-900">{follower.user_name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[100px] bg-slate-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${follower.completion_percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">
                      Día {follower.current_day} ({follower.completion_percentage}%)
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  {getStatusBadge(follower.status)}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {formatDate(follower.started_at)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1 text-sm text-slate-500">
                    <Clock size={14} />
                    <span>{formatRelativeTime(follower.last_activity)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-sm text-slate-600">
            Mostrando {((page - 1) * perPage) + 1} - {Math.min(page * perPage, data.total_followers)} de {data.total_followers}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchFollowers(page - 1)}
              disabled={page === 1 || loading}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
              {page} / {data.pagination.total_pages}
            </span>
            <button
              onClick={() => fetchFollowers(page + 1)}
              disabled={page >= data.pagination.total_pages || loading}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
