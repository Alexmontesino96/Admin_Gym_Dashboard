import React from 'react';
import { NutritionPlan, PlanStatus, getPlanStatusConfig } from '@/lib/api';
import { Users, Clock, Calendar, CheckCircle } from 'lucide-react';
import Badge from './badge';

interface LivePlanStatusProps {
  plan: NutritionPlan;
  showParticipants?: boolean;
  showCountdown?: boolean;
  className?: string;
}

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate) return null;
  const start = new Date(startDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  if (!endDate) return start;
  const end = new Date(endDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  return `${start} - ${end}`;
};

const LivePlanStatus: React.FC<LivePlanStatusProps> = ({
  plan,
  showParticipants = true,
  showCountdown = true,
  className = ''
}) => {
  if (plan.plan_type !== 'live') {
    return null;
  }

  // Computar estado efectivo: si live_end_date ya pasó, considerar como finalizado
  const computeEffectiveStatus = (): PlanStatus | undefined => {
    if (plan.live_end_date) {
      const endDate = new Date(plan.live_end_date);
      if (endDate < new Date()) {
        return PlanStatus.FINISHED;
      }
    }
    return plan.status;
  };

  const effectiveStatus = computeEffectiveStatus();
  const statusConfig = effectiveStatus ? getPlanStatusConfig(effectiveStatus) : null;
  const dateRange = formatDateRange(plan.live_start_date, plan.live_end_date);

  const renderStatus = () => {
    if (effectiveStatus === PlanStatus.NOT_STARTED && plan.days_until_start !== undefined) {
      return (
        <div className={`space-y-2 ${className}`}>
          {showCountdown && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Clock size={16} />
              <span>
                {plan.days_until_start === 0
                  ? '¡Empieza hoy!'
                  : plan.days_until_start === 1
                  ? 'Empieza mañana'
                  : `Empieza en ${plan.days_until_start} días`
                }
              </span>
            </div>
          )}

          {dateRange && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Calendar size={16} />
              <span>{dateRange}</span>
            </div>
          )}

          {showParticipants && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Users size={16} />
              <span>{plan.live_participants_count} participantes reservados</span>
            </div>
          )}
        </div>
      );
    }

    if (effectiveStatus === PlanStatus.RUNNING) {
      return (
        <div className={`space-y-2 ${className}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-600">
              LIVE - Día {plan.current_day || 1}
            </span>
          </div>

          {dateRange && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Calendar size={16} />
              <span>{dateRange}</span>
            </div>
          )}

          {showParticipants && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Users size={16} />
              <span>{plan.live_participants_count} participantes activos</span>
            </div>
          )}
        </div>
      );
    }

    if (effectiveStatus === PlanStatus.FINISHED) {
      return (
        <div className={`space-y-2 ${className}`}>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <CheckCircle size={16} className="text-green-600" />
            <span>Plan finalizado</span>
            {showParticipants && plan.original_participants_count && (
              <span>• {plan.original_participants_count} participantes</span>
            )}
          </div>
          {dateRange && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Calendar size={16} />
              <span>{dateRange}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-2">
      {statusConfig && (
        <Badge
          variant={statusConfig.color as any}
          size="sm"
        >
          <span className="mr-1">{statusConfig.icon}</span>
          <span>{statusConfig.label}</span>
        </Badge>
      )}

      {renderStatus()}
    </div>
  );
};

export default LivePlanStatus; 