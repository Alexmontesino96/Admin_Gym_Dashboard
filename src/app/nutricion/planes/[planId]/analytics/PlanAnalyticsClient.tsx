'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Star,
  Target,
  BarChart3,
  Utensils,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  nutritionAPI,
  PlanAnalytics,
  NutritionPlan,
  MealPerformance
} from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import FollowersTable from '@/components/nutrition/FollowersTable';

interface PlanAnalyticsClientProps {
  planId: number;
}

export default function PlanAnalyticsClient({ planId }: PlanAnalyticsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PlanAnalytics | null>(null);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);

  // Cargar datos
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [analyticsData, planData] = await Promise.all([
        nutritionAPI.getPlanAnalytics(planId),
        nutritionAPI.getPlan(planId)
      ]);

      setAnalytics(analyticsData);
      setPlan(planData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [planId]);

  // Preparar datos para el gráfico de completado diario
  const chartData = analytics?.daily_performance.map((day) => ({
    day: `Día ${day.day_number}`,
    completado: Math.round(day.completion_rate * 100),
    abandono: Math.round(day.dropout_rate * 100)
  })) || [];

  // Top 5 comidas
  const topMeals = analytics?.meal_performance
    .sort((a, b) => b.completion_rate - a.completion_rate)
    .slice(0, 5) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar analytics</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <RefreshCw size={16} />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  if (!analytics || !plan) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
        <BarChart3 size={40} className="text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Sin datos de analytics</h3>
        <p className="text-slate-600">Este plan aún no tiene suficientes datos para mostrar estadísticas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Analytics: {analytics.plan_title}
            </h1>
            <p className="text-slate-600">Estadísticas y rendimiento del plan</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-slate-600">Seguidores</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{analytics.followers.total}</p>
          <p className="text-sm text-slate-500">
            {analytics.followers.active} activos
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target size={20} className="text-green-600" />
            </div>
            <span className="text-sm text-slate-600">Completado</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {Math.round(analytics.engagement.avg_completion_rate * 100)}%
          </p>
          <p className="text-sm text-slate-500">
            promedio
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star size={20} className="text-amber-600" />
            </div>
            <span className="text-sm text-slate-600">Satisfacción</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {analytics.engagement.avg_satisfaction.toFixed(1)}
          </p>
          <p className="text-sm text-slate-500">
            de 5 estrellas
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <span className="text-sm text-slate-600">Retención</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {Math.round(analytics.followers.retention_rate * 100)}%
          </p>
          <p className="text-sm text-slate-500">
            {analytics.followers.completed} completados
          </p>
        </div>
      </div>

      {/* Gráfico de progreso diario */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Tasa de Completado por Día
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completado"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2 }}
                  name="Completado %"
                />
                <Line
                  type="monotone"
                  dataKey="abandono"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2 }}
                  name="Abandono %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top comidas y Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 comidas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Utensils size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Top 5 Comidas
            </h3>
          </div>
          <div className="space-y-3">
            {topMeals.map((meal, index) => (
              <div
                key={meal.meal_id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{meal.meal_name}</p>
                    <p className="text-sm text-slate-500">{meal.meal_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {Math.round(meal.completion_rate * 100)}%
                  </p>
                  <p className="text-xs text-slate-500">completado</p>
                </div>
              </div>
            ))}
            {topMeals.length === 0 && (
              <p className="text-slate-500 text-center py-4">
                Sin datos de comidas
              </p>
            )}
          </div>
        </div>

        {/* Feedback de usuarios */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">
              Feedback de Usuarios
            </h3>
          </div>

          <div className="space-y-4">
            {/* Palabras positivas */}
            {analytics.user_feedback.positive_keywords.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <ThumbsUp size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-slate-700">Positivo</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analytics.user_feedback.positive_keywords.map((word, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Palabras negativas */}
            {analytics.user_feedback.negative_keywords.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <ThumbsDown size={16} className="text-red-500" />
                  <span className="text-sm font-medium text-slate-700">A mejorar</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analytics.user_feedback.negative_keywords.map((word, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sugerencias */}
            {analytics.user_feedback.improvement_suggestions.length > 0 && (
              <div>
                <span className="text-sm font-medium text-slate-700 block mb-2">
                  Sugerencias
                </span>
                <ul className="space-y-1">
                  {analytics.user_feedback.improvement_suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start space-x-2">
                      <span className="text-slate-400">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analytics.user_feedback.positive_keywords.length === 0 &&
              analytics.user_feedback.negative_keywords.length === 0 &&
              analytics.user_feedback.improvement_suggestions.length === 0 && (
              <p className="text-slate-500 text-center py-4">
                Sin feedback de usuarios aún
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de seguidores */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Seguidores del Plan
          </h3>
        </div>
        <FollowersTable planId={planId} />
      </div>

      {/* Información financiera (si existe) */}
      {analytics.financial && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Información de Costos
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                ${analytics.financial.avg_daily_cost.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500">Costo diario promedio</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {analytics.financial.cost_perception}
              </p>
              <p className="text-sm text-slate-500">Percepción</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(analytics.financial.ingredient_availability * 100)}%
              </p>
              <p className="text-sm text-slate-500">Disponibilidad ingredientes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
