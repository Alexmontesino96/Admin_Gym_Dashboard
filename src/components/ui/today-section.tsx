import React, { useState, useEffect } from 'react';
import { nutritionAPI, TodayMealPlan, PlanStatus, getPlanStatusConfig } from '@/lib/api';
import { Calendar, Zap, Clock, CheckCircle, AlertCircle, Users, ArrowRight } from 'lucide-react';
import PlanTypeIndicator from './plan-type-indicator';
import LivePlanStatus from './live-plan-status';
import Badge from './badge';

interface TodaySectionProps {
  onPlanSelect?: (planId: number) => void;
  className?: string;
}

const TodaySection: React.FC<TodaySectionProps> = ({ 
  onPlanSelect,
  className = ''
}) => {
  const [todayPlan, setTodayPlan] = useState<TodayMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodayPlan();
  }, []);

  const loadTodayPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await nutritionAPI.getTodayPlan();
      setTodayPlan(data);
    } catch (err) {
      console.error('Error loading today plan:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el plan de hoy');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanClick = () => {
    if (todayPlan?.plan && onPlanSelect) {
      onPlanSelect(todayPlan.plan.id);
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar size={24} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">Sin plan para hoy</h3>
      <p className="text-slate-600 mb-6">No tienes planes nutricionales activos para hoy</p>
      <button 
        onClick={() => window.location.href = '/nutricion/planes'}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 mx-auto"
      >
        <span>Explorar Planes</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );

  const renderPlanContent = () => {
    if (!todayPlan?.plan) return null;

    const plan = todayPlan.plan;
    
    // Determinar el mensaje según el estado
    const getMessage = () => {
      if (todayPlan.status === PlanStatus.NOT_STARTED) {
        return {
          icon: <Clock size={20} className="text-yellow-600" />,
          title: 'Plan próximo a empezar',
          description: todayPlan.days_until_start 
            ? `Tu plan "${plan.title}" empieza en ${todayPlan.days_until_start} días`
            : `Tu plan "${plan.title}" empezará pronto`,
          color: 'bg-yellow-50 border-yellow-200'
        };
      }
      
      if (todayPlan.status === PlanStatus.RUNNING) {
        return {
          icon: <Zap size={20} className="text-green-600" />,
          title: `Día ${todayPlan.current_day} - ${plan.title}`,
          description: `${todayPlan.meals.length} comidas programadas para hoy`,
          color: 'bg-green-50 border-green-200'
        };
      }
      
      return {
        icon: <CheckCircle size={20} className="text-blue-600" />,
        title: 'Plan completado',
        description: `Has terminado el plan "${plan.title}"`,
        color: 'bg-blue-50 border-blue-200'
      };
    };

    const message = getMessage();

    return (
      <div className="space-y-6">
        {/* Header del plan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {message.icon}
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{message.title}</h3>
              <p className="text-slate-600 text-sm">{message.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <PlanTypeIndicator plan={plan} size="sm" />
          </div>
        </div>

        {/* Estado para planes live */}
        {plan.plan_type === 'live' && (
          <div className={`p-4 rounded-lg border ${message.color}`}>
            <LivePlanStatus 
              plan={plan}
              showParticipants={true}
              showCountdown={false}
            />
          </div>
        )}

        {/* Progreso del plan */}
        {todayPlan.status === PlanStatus.RUNNING && (
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Progreso de hoy</span>
              <span className="text-lg font-bold text-slate-900">
                {todayPlan.completion_percentage.toFixed(0)}%
              </span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${todayPlan.completion_percentage}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Comidas del día */}
        {todayPlan.meals.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-slate-900">Comidas de hoy</h4>
            <div className="space-y-2">
              {todayPlan.meals.slice(0, 3).map((meal: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{meal.name || `Comida ${index + 1}`}</p>
                    <p className="text-sm text-slate-600">{meal.calories || 0} kcal</p>
                  </div>
                  <CheckCircle size={16} className="text-green-600" />
                </div>
              ))}
              
              {todayPlan.meals.length > 3 && (
                <div className="text-center py-2">
                  <span className="text-sm text-slate-500">
                    +{todayPlan.meals.length - 3} comidas más
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <button
          onClick={handlePlanClick}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <span>Ver Plan Completo</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 border border-slate-200 ${className}`}>
        <div className="flex items-center space-x-3 mb-6">
          <Calendar size={24} className="text-green-600" />
          <h2 className="text-xl font-bold text-slate-900">📅 Hoy</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando plan del día...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl p-6 border border-slate-200 ${className}`}>
        <div className="flex items-center space-x-3 mb-6">
          <Calendar size={24} className="text-green-600" />
          <h2 className="text-xl font-bold text-slate-900">📅 Hoy</h2>
        </div>
        
        <div className="text-center py-8">
          <AlertCircle size={24} className="text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadTodayPlan}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 border border-slate-200 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <Calendar size={24} className="text-green-600" />
        <h2 className="text-xl font-bold text-slate-900">📅 Hoy</h2>
      </div>
      
      {!todayPlan?.plan ? renderEmptyState() : renderPlanContent()}
    </div>
  );
};

export default TodaySection; 