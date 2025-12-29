'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Apple,
  User,
  Edit,
  Copy,
  BarChart3,
  Archive,
  MoreVertical,
  Users,
  Calendar,
  Loader2
} from 'lucide-react';
import { NutritionPlan, DailyPlan, GymParticipant, nutritionAPI } from '@/lib/api';
import PlanTypeIndicator from '@/components/ui/plan-type-indicator';
import LivePlanStatus from '@/components/ui/live-plan-status';

interface PlanCardProps {
  plan: NutritionPlan & {
    creator?: GymParticipant;
    days?: DailyPlan[];
    daysCount?: number;
  };
  onArchive?: (planId: number) => void;
  onDuplicate?: (planId: number) => void;
  onViewAnalytics?: (planId: number) => void;
  onRefresh?: () => void;
}

export default function PlanCard({
  plan,
  onArchive,
  onDuplicate,
  onViewAnalytics,
  onRefresh
}: PlanCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  // Obtener el nombre del creador
  const getCreatorDisplayName = (creator: GymParticipant | undefined) => {
    if (!creator) return 'Información no disponible';

    const parts = [];
    if (creator.first_name) parts.push(creator.first_name);
    if (creator.last_name) parts.push(creator.last_name);

    if (parts.length === 0) {
      return creator.email || 'Usuario sin nombre';
    }

    return parts.join(' ').trim();
  };

  // Obtener texto del objetivo
  const getGoalText = (goal: string) => {
    const goals: Record<string, string> = {
      bulk: 'Volumen',
      cut: 'Definición',
      maintain: 'Mantenimiento',
      performance: 'Rendimiento'
    };
    return goals[goal] || goal;
  };

  // Obtener texto de dificultad
  const getDifficultyText = (difficulty: string) => {
    const difficulties: Record<string, string> = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado'
    };
    return difficulties[difficulty] || difficulty;
  };

  // Verificar si el plan es archivable
  const isPlanArchivable = (): boolean => {
    if (plan.plan_type !== 'live') return false;
    if (plan.status === 'finished') return true;
    if (!plan.is_live_active && plan.live_end_date) {
      const endDate = new Date(plan.live_end_date);
      return endDate < new Date();
    }
    return false;
  };

  // Navegar a editar días
  const handleEditDays = () => {
    router.push(`/nutricion/planes/${plan.id}/editar-dias`);
  };

  // Duplicar plan
  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      await nutritionAPI.duplicatePlan(plan.id, `${plan.title} (copia)`);
      onRefresh?.();
    } catch (error) {
      console.error('Error al duplicar plan:', error);
    } finally {
      setDuplicating(false);
      setShowMenu(false);
    }
  };

  // Ver analytics
  const handleViewAnalytics = () => {
    if (onViewAnalytics) {
      onViewAnalytics(plan.id);
    } else {
      router.push(`/nutricion/planes/${plan.id}/analytics`);
    }
    setShowMenu(false);
  };

  // Calcular progreso
  const progress = plan.daysCount !== undefined && plan.duration_days > 0
    ? Math.round((plan.daysCount / plan.duration_days) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header con título y menú */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Apple size={22} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                {plan.title}
              </h3>
              <p className="text-sm text-slate-500">{getGoalText(plan.goal)}</p>
            </div>
          </div>

          {/* Menú de acciones */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical size={18} className="text-slate-400" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                  <button
                    onClick={handleViewAnalytics}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <BarChart3 size={16} />
                    <span>Ver Analytics</span>
                  </button>
                  <button
                    onClick={handleDuplicate}
                    disabled={duplicating}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {duplicating ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Copy size={16} />
                    )}
                    <span>{duplicating ? 'Duplicando...' : 'Duplicar'}</span>
                  </button>
                  {isPlanArchivable() && onArchive && (
                    <button
                      onClick={() => {
                        onArchive(plan.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center space-x-2"
                    >
                      <Archive size={16} />
                      <span>Archivar</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Badges de tipo y estado */}
        <div className="flex flex-wrap gap-2 mb-4">
          <PlanTypeIndicator
            plan={{
              ...plan,
              plan_type: plan.plan_type || 'template',
              is_live_active: plan.is_live_active || false,
              live_participants_count: plan.live_participants_count || 0
            }}
            size="sm"
          />
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            {getDifficultyText(plan.difficulty_level)}
          </span>
          {plan.live_participants_count !== undefined && plan.live_participants_count > 0 && (
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center space-x-1">
              <Users size={12} />
              <span>{plan.live_participants_count}</span>
            </span>
          )}
        </div>

        {/* Creador */}
        <div className="flex items-center space-x-2 mb-4">
          <User size={14} className="text-slate-400" />
          <span className="text-sm text-slate-500">
            {getCreatorDisplayName(plan.creator)}
          </span>
        </div>

        {/* Estado de plan live */}
        {plan.plan_type === 'live' && (
          <div className="mb-4">
            <LivePlanStatus
              plan={{
                ...plan,
                plan_type: plan.plan_type,
                is_live_active: plan.is_live_active || false,
                live_participants_count: plan.live_participants_count || 0
              }}
              showParticipants={true}
              showCountdown={true}
            />
          </div>
        )}

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{plan.target_calories}</p>
            <p className="text-xs text-slate-500">kcal/día</p>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{plan.duration_days}</p>
            <p className="text-xs text-slate-500">días</p>
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{plan.target_protein_g}g</p>
            <p className="text-xs text-slate-500">Proteína</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{plan.target_carbs_g}g</p>
            <p className="text-xs text-slate-500">Carbos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{plan.target_fat_g}g</p>
            <p className="text-xs text-slate-500">Grasas</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-500">Progreso</span>
            <span className="text-xs font-medium text-slate-700">
              {plan.daysCount !== undefined ? `${plan.daysCount}/${plan.duration_days}` : '?/?'} días
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Fecha de creación si es live */}
        {plan.plan_type === 'live' && plan.live_start_date && (
          <div className="flex items-center space-x-2 mb-4 text-sm text-slate-500">
            <Calendar size={14} />
            <span>
              {new Date(plan.live_start_date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
              {plan.live_end_date && (
                <> - {new Date(plan.live_end_date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short'
                })}</>
              )}
            </span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={handleEditDays}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Edit size={16} />
            <span>Editar</span>
          </button>
          <button
            onClick={handleViewAnalytics}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
            title="Ver Analytics"
          >
            <BarChart3 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
