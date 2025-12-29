'use client';

import {
  FileText,
  Play,
  FileCheck,
  Archive,
  Loader2
} from 'lucide-react';
import { CategorizedPlansResponse } from '@/lib/api';

export type TabType = 'all' | 'live' | 'template' | 'archived';

interface PlanCategoryTabsProps {
  categories: CategorizedPlansResponse | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  loading?: boolean;
}

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  getCount: (categories: CategorizedPlansResponse) => number;
}

const tabs: TabConfig[] = [
  {
    id: 'all',
    label: 'Todos',
    icon: <FileText size={18} />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    getCount: (c) => c.total
  },
  {
    id: 'live',
    label: 'Live',
    icon: <Play size={18} />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    getCount: (c) => c.live_plans.length
  },
  {
    id: 'template',
    label: 'Templates',
    icon: <FileCheck size={18} />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    getCount: (c) => c.template_plans.length
  },
  {
    id: 'archived',
    label: 'Archivados',
    icon: <Archive size={18} />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    getCount: (c) => c.archived_plans.length
  }
];

export default function PlanCategoryTabs({
  categories,
  activeTab,
  onTabChange,
  loading = false
}: PlanCategoryTabsProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-1.5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = categories ? tab.getCount(categories) : 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              disabled={loading}
              className={`
                flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                ${isActive
                  ? `${tab.bgColor} ${tab.color} ${tab.borderColor} border shadow-sm`
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {loading && isActive ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                tab.icon
              )}
              <span>{tab.label}</span>
              {categories && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${isActive
                    ? `${tab.color} bg-white/60`
                    : 'bg-slate-200 text-slate-600'
                  }
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
