'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Users,
  Target,
  Star,
  TrendingUp,
  Utensils,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { nutritionAPI, PlanAnalytics } from '@/lib/api';

interface PlanAnalyticsModalProps {
  planId: number;
  planTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanAnalyticsModal({
  planId,
  planTitle,
  isOpen,
  onClose
}: PlanAnalyticsModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<PlanAnalytics | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, planId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await nutritionAPI.getPlanAnalytics(planId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullAnalytics = () => {
    onClose();
    router.push(`/nutricion/planes/${planId}/analytics`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
              <p className="text-sm text-slate-600">{planTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-green-600" />
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* KPIs Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users size={24} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {analytics.followers.total}
                    </p>
                    <p className="text-sm text-slate-600">Seguidores</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target size={24} className="text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {Math.round(analytics.engagement.avg_completion_rate * 100)}%
                    </p>
                    <p className="text-sm text-slate-600">Completado</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star size={24} className="text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {analytics.engagement.avg_satisfaction.toFixed(1)}/5
                    </p>
                    <p className="text-sm text-slate-600">Satisfacción</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp size={24} className="text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {Math.round(analytics.followers.retention_rate * 100)}%
                    </p>
                    <p className="text-sm text-slate-600">Retención</p>
                  </div>
                </div>

                {/* Top 3 comidas */}
                {analytics.meal_performance.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Utensils size={18} className="text-green-600" />
                      <h3 className="font-semibold text-slate-900">Top Comidas</h3>
                    </div>
                    <div className="space-y-2">
                      {analytics.meal_performance
                        .sort((a, b) => b.completion_rate - a.completion_rate)
                        .slice(0, 3)
                        .map((meal, index) => (
                          <div
                            key={meal.meal_id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </span>
                              <span className="text-slate-900 font-medium">
                                {meal.meal_name}
                              </span>
                            </div>
                            <span className="text-green-600 font-semibold">
                              {Math.round(meal.completion_rate * 100)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Estado de seguidores */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-green-700">
                      {analytics.followers.active}
                    </p>
                    <p className="text-xs text-green-600">Activos</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-blue-700">
                      {analytics.followers.completed}
                    </p>
                    <p className="text-xs text-blue-600">Completados</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-red-700">
                      {analytics.followers.abandoned}
                    </p>
                    <p className="text-xs text-red-600">Abandonados</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No hay datos de analytics disponibles</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200">
            <button
              onClick={handleViewFullAnalytics}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Ver Analytics Completos</span>
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
