'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nutritionAPI, NutritionPlan, DailyPlan, DailyPlanCreateData } from '@/lib/api';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  Target, 
  Check, 
  Trash2,
  Edit3,
  Save,
  Clock,
  Flame,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X,
  Utensils
} from 'lucide-react';

interface EditPlanDaysClientProps {
  planId: number;
}

export default function EditPlanDaysClient({ planId }: EditPlanDaysClientProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [days, setDays] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estado para el formulario de nuevo día
  const [showAddForm, setShowAddForm] = useState(false);
  const [dayForm, setDayForm] = useState<DailyPlanCreateData>({
    day_number: 1,
    planned_date: new Date().toISOString().split('T')[0],
    total_calories: 0,
    total_protein_g: 0,
    total_carbs_g: 0,
    total_fat_g: 0,
    notes: '',
    nutrition_plan_id: planId
  });

  // Cargar plan y días existentes
  useEffect(() => {
    loadPlanAndDays();
  }, [planId]);

  // Auto-ocultar mensajes de éxito
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadPlanAndDays = async () => {
    try {
      setLoading(true);
      setError(null);
      const planData = await nutritionAPI.getPlan(planId);
      const daysData = planData.daily_plans || [];

      setPlan(planData);
      setDays(daysData);
      
      // Configurar formulario para el siguiente día
      const nextDayNumber = daysData.length > 0 
        ? Math.max(...daysData.map(d => d.day_number)) + 1 
        : 1;
      
      setDayForm(prev => ({
        ...prev,
        day_number: nextDayNumber,
        total_calories: planData.target_calories,
        total_protein_g: planData.target_protein_g,
        total_carbs_g: planData.target_carbs_g,
        total_fat_g: planData.target_fat_g
      }));

    } catch (err) {
      console.error('Error loading plan and days:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDayInputChange = (field: keyof DailyPlanCreateData, value: any) => {
    setDayForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const autoFillDayMacros = () => {
    if (plan) {
      setDayForm(prev => ({
        ...prev,
        total_calories: plan.target_calories,
        total_protein_g: plan.target_protein_g,
        total_carbs_g: plan.target_carbs_g,
        total_fat_g: plan.target_fat_g
      }));
    }
  };

  const handleAddDay = async () => {
    if (!plan) return;

    setActionLoading(true);
    setError(null);

    try {
      const dayData = {
        ...dayForm,
        planned_date: new Date(dayForm.planned_date).toISOString(),
        nutrition_plan_id: planId
      };

      const newDay = await nutritionAPI.createPlanDay(planId, dayData);
      setDays(prev => [...prev, newDay]);
      
      // Resetear formulario para el siguiente día
      const nextDayNumber = Math.max(...days.map(d => d.day_number), dayForm.day_number) + 1;
      const nextDate = new Date(dayForm.planned_date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      setDayForm(prev => ({
        ...prev,
        day_number: nextDayNumber,
        planned_date: nextDate.toISOString().split('T')[0],
        notes: ''
      }));

      setShowAddForm(false);
      setSuccessMessage(`Día ${dayData.day_number} agregado exitosamente`);

    } catch (err) {
      console.error('Error adding day:', err);
      setError(err instanceof Error ? err.message : 'Error al agregar el día');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDay = async (dayId: number, dayNumber: number) => {
    if (!plan || !confirm(`¿Estás seguro de que quieres eliminar el Día ${dayNumber}?`)) return;

    setActionLoading(true);
    
    try {
      await nutritionAPI.deletePlanDay(planId, dayId);
      setDays(prev => prev.filter(day => day.id !== dayId));
      setSuccessMessage(`Día ${dayNumber} eliminado exitosamente`);
    } catch (err) {
      console.error('Error deleting day:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el día');
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysProgress = () => {
    if (!plan) return { created: 0, total: 0, percentage: 0 };
    return {
      created: days.length,
      total: plan.duration_days,
      percentage: Math.round((days.length / plan.duration_days) * 100)
    };
  };

  const getDaysRemaining = () => {
    const { created, total } = getDaysProgress();
    return Math.max(0, total - created);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando plan nutricional...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Plan no encontrado</h2>
          <p className="text-slate-600 mb-6">El plan nutricional que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  const progress = getDaysProgress();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header con información del plan */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <Calendar size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{plan.title}</h1>
                <p className="text-slate-600">Gestión de días del plan nutricional</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus size={18} />
            <span className="font-medium">Añadir Día</span>
          </button>
        </div>

        {/* Información del plan */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{plan.duration_days}</div>
            <div className="text-sm text-slate-600">Días totales</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{plan.target_calories}</div>
            <div className="text-sm text-orange-600">Calorías</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{plan.target_protein_g}g</div>
            <div className="text-sm text-blue-600">Proteína</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{plan.target_carbs_g}g</div>
            <div className="text-sm text-yellow-600">Carbohidratos</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{plan.target_fat_g}g</div>
            <div className="text-sm text-green-600">Grasas</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{progress.created}</div>
            <div className="text-sm text-purple-600">Días creados</div>
          </div>
        </div>
      </div>

      {/* Progreso detallado */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Progreso del Plan</h2>
          <div className="flex items-center space-x-2">
            <CheckCircle size={20} className={`${progress.percentage === 100 ? 'text-green-600' : 'text-slate-400'}`} />
            <span className="text-sm text-slate-600">
              {progress.percentage === 100 ? 'Completado' : `${daysRemaining} días restantes`}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Días creados</span>
            <span className="font-medium text-slate-900">{progress.created}/{progress.total}</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(progress.percentage, 100)}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {progress.percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Formulario para agregar día */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <Plus size={24} className="text-green-600 mr-3" />
              Agregar Día {dayForm.day_number}
            </h2>
            <button
              type="button"
              onClick={autoFillDayMacros}
              className="bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Target size={16} />
              <span>Usar Objetivos del Plan</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Número de Día
                </label>
                <input
                  type="number"
                  value={dayForm.day_number}
                  onChange={(e) => handleDayInputChange('day_number', parseInt(e.target.value))}
                  min="1"
                  max={plan.duration_days}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha Planificada
                </label>
                <input
                  type="date"
                  value={dayForm.planned_date}
                  onChange={(e) => handleDayInputChange('planned_date', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Macronutrientes */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Macronutrientes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-orange-700 mb-2">
                    <Flame size={16} className="inline mr-1" />
                    Calorías
                  </label>
                  <input
                    type="number"
                    value={dayForm.total_calories}
                    onChange={(e) => handleDayInputChange('total_calories', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    <Zap size={16} className="inline mr-1" />
                    Proteína (g)
                  </label>
                  <input
                    type="number"
                    value={dayForm.total_protein_g}
                    onChange={(e) => handleDayInputChange('total_protein_g', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="bg-yellow-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-yellow-700 mb-2">
                    <TrendingUp size={16} className="inline mr-1" />
                    Carbohidratos (g)
                  </label>
                  <input
                    type="number"
                    value={dayForm.total_carbs_g}
                    onChange={(e) => handleDayInputChange('total_carbs_g', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  />
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    <Target size={16} className="inline mr-1" />
                    Grasas (g)
                  </label>
                  <input
                    type="number"
                    value={dayForm.total_fat_g}
                    onChange={(e) => handleDayInputChange('total_fat_g', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notas del Día
              </label>
              <textarea
                value={dayForm.notes}
                onChange={(e) => handleDayInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Instrucciones especiales, consejos, variaciones..."
              />
            </div>

            {/* Botones */}
            <div className="flex space-x-3">
              <button
                onClick={handleAddDay}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Agregando...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Agregar Día {dayForm.day_number}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de días existentes */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900">
            Días del Plan
          </h3>
          <div className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium text-slate-700">
            {days.length} días
          </div>
        </div>
        
        {days.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-slate-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">No hay días creados aún</h4>
            <p className="text-slate-600 mb-6">Comienza agregando el primer día de tu plan nutricional</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus size={18} />
              <span>Agregar Primer Día</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.sort((a, b) => a.day_number - b.day_number).map((day) => (
              <div key={day.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">{day.day_number}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Día {day.day_number}</h4>
                      <p className="text-sm text-slate-600">
                        {new Date(day.planned_date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDay(day.id!, day.day_number)}
                    disabled={actionLoading}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <Flame size={14} className="mr-1 text-orange-500" />
                      Calorías
                    </span>
                    <span className="font-medium text-slate-900">{day.total_calories} kcal</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <Zap size={14} className="mr-1 text-blue-500" />
                      Proteína
                    </span>
                    <span className="font-medium text-slate-900">{day.total_protein_g}g</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <TrendingUp size={14} className="mr-1 text-yellow-500" />
                      Carbohidratos
                    </span>
                    <span className="font-medium text-slate-900">{day.total_carbs_g}g</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <Target size={14} className="mr-1 text-green-500" />
                      Grasas
                    </span>
                    <span className="font-medium text-slate-900">{day.total_fat_g}g</span>
                  </div>
                </div>
                
                {day.notes && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600">{day.notes}</p>
                  </div>
                )}
                
                {/* Botón para gestionar comidas */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => router.push(`/nutricion/planes/${planId}/dias/${day.id}/comidas`)}
                    className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Utensils size={16} />
                    <span>Gestionar Comidas</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 