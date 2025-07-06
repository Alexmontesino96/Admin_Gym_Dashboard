import React from 'react';
import { NutritionPlan, PlanStatus, getPlanStatusConfig, formatDate } from '@/lib/api';
import { Users, Clock, Calendar, CheckCircle } from 'lucide-react';
import Badge from './badge';

interface LivePlanStatusProps {
  plan: NutritionPlan;
  showParticipants?: boolean;
  showCountdown?: boolean;
  className?: string;
}

const LivePlanStatus: React.FC<LivePlanStatusProps> = ({ 
  plan, 
  showParticipants = true,
  showCountdown = true,
  className = ''
}) => {
  if (plan.plan_type !== 'live') {
    return null;
  }

  const statusConfig = plan.status ? getPlanStatusConfig(plan.status) : null;
  
  const renderStatus = () => {
    if (plan.status === PlanStatus.NOT_STARTED && plan.days_until_start !== undefined) {
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
          
          {plan.live_start_date && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Calendar size={16} />
              <span>{formatDate(plan.live_start_date)}</span>
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
    
    if (plan.status === PlanStatus.RUNNING) {
      return (
        <div className={`space-y-2 ${className}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-600">
              LIVE - Día {plan.current_day || 1}
            </span>
          </div>
          
          {showParticipants && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Users size={16} />
              <span>{plan.live_participants_count} participantes activos</span>
            </div>
          )}
        </div>
      );
    }
    
    if (plan.status === PlanStatus.FINISHED) {
      return (
        <div className={`flex items-center space-x-2 text-sm text-slate-600 ${className}`}>
          <CheckCircle size={16} className="text-green-600" />
          <span>Plan completado</span>
          {showParticipants && plan.original_participants_count && (
            <span>• {plan.original_participants_count} participantes</span>
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