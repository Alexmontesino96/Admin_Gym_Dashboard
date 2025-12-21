'use client';

import dynamic from 'next/dynamic';
import DashboardStats from './DashboardStats';
import CriticalAlerts from './CriticalAlerts';

// Dynamic import para DashboardCharts - componente pesado con Recharts
const DashboardCharts = dynamic(() => import('./DashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">
            Cargando gráficas avanzadas...
          </div>
        </div>
      ))}
    </div>
  )
});

export default function DashboardClient() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general de tu gimnasio</p>
      </div>

      <div className="space-y-8">
        {/* Stats se cargan inmediatamente - son ligeros */}
        <DashboardStats />

        {/* Alertas críticas - accionables */}
        <CriticalAlerts />

        {/* Charts se cargan dinámicamente - son pesados */}
        <DashboardCharts />
      </div>
    </div>
  );
} 