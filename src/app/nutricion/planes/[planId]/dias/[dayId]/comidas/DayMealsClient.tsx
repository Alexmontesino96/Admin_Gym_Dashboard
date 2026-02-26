'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nutritionAPI, NutritionPlan, DailyPlan } from '@/lib/api';
import MealManagerClient from '../../../editar-dias/MealManagerClient';
import { 
  ArrowLeft, 
  Calendar, 
  AlertCircle
} from 'lucide-react';

interface DayMealsClientProps {
  planId: number;
  dayId: number;
}

export default function DayMealsClient({ planId, dayId }: DayMealsClientProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [day, setDay] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlanAndDay();
  }, [planId, dayId]);

  const loadPlanAndDay = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar el plan
      const planData = await nutritionAPI.getPlan(planId);
      setPlan(planData);
      
      // Encontrar el día específico
      const dayData = planData.daily_plans?.find(d => d.id === dayId);
      if (!dayData) {
        throw new Error('Día no encontrado en el plan');
      }
      setDay(dayData);
      
    } catch (err) {
      console.error('Error loading plan and day:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el plan y día');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Cargando información del día...</p>
        </div>
      </div>
    );
  }

  if (!plan || !day) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {error || 'Plan o día no encontrado'}
          </h2>
          <p className="text-slate-600 mb-6">
            El plan nutricional o el día que buscas no existe o ha sido eliminado.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
                <Calendar size={24} className="text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {plan.title} - Día {day.day_number}
                </h1>
                <p className="text-slate-600">
                  {day.planned_date
                    ? new Date(day.planned_date + (day.planned_date.includes('T') ? '' : 'T12:00:00')).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : `Día ${day.day_number}`}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información del día */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{day.total_calories}</div>
            <div className="text-sm text-orange-600">Calorías objetivo</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{day.total_protein_g}g</div>
            <div className="text-sm text-blue-600">Proteína objetivo</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{day.total_carbs_g}g</div>
            <div className="text-sm text-yellow-600">Carbohidratos objetivo</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{day.total_fat_g}g</div>
            <div className="text-sm text-green-600">Grasas objetivo</div>
          </div>
        </div>
        
        {day.notes && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm font-medium text-slate-700 mb-1">Notas del día:</p>
            <p className="text-slate-600">{day.notes}</p>
          </div>
        )}
      </div>

      {/* Gestor de comidas */}
      <MealManagerClient 
        dailyPlanId={day.id!} 
        dayNumber={day.day_number}
        initialMeals={day.meals || []}
      />
    </div>
  );
} 