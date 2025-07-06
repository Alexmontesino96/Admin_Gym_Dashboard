import React from 'react';
import { PlanType, getPlanTypeConfig, NutritionPlan } from '@/lib/api';
import Badge from './badge';

interface PlanTypeIndicatorProps {
  plan: NutritionPlan;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const PlanTypeIndicator: React.FC<PlanTypeIndicatorProps> = ({ 
  plan, 
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const config = getPlanTypeConfig(plan.plan_type);
  
  // Mapear colores del config a variantes del badge
  const colorVariantMap = {
    blue: 'blue',
    red: 'red',
    purple: 'purple',
    green: 'green',
    orange: 'orange',
    gray: 'gray'
  } as const;
  
  const variant = colorVariantMap[config.color as keyof typeof colorVariantMap] || 'default';
  
  return (
    <Badge 
      variant={variant} 
      size={size}
      className={className}
    >
      <span className="mr-1" role="img" aria-label={config.label}>
        {config.icon}
      </span>
      {showLabel && (
        <span>{config.label}</span>
      )}
    </Badge>
  );
};

export default PlanTypeIndicator; 