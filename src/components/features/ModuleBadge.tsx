import React from 'react';
import { BADGE_CONFIG, type BadgeType } from '@/lib/features-data';

interface ModuleBadgeProps {
  type: BadgeType;
  className?: string;
}

export default function ModuleBadge({ type, className = '' }: ModuleBadgeProps) {
  const config = BADGE_CONFIG[type];

  if (!config) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${config.className} ${className}`}
    >
      {config.icon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}
