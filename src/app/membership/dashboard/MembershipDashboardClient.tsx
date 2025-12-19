'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { membershipAPI, getUsersAPI, MembershipStatsResponse, MembershipPlanStats, MembershipPlan, GymParticipant, PlanUserDetail } from '@/lib/api';
import AdminPaymentLinkModal from '@/components/AdminPaymentLinkModal';
import PlanUsersModal from '@/components/PlanUsersModal';
import { 
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  RefreshCw,
  Award,
  Activity,
  CreditCard,
  Target,
  Clock,
  Link as LinkIcon,
  Plus,
  FileText,
  ArrowRight,
  Eye
} from 'lucide-react';
import Link from 'next/link';

// Componente de skeleton para loading
const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 rounded w-80"></div>
        <div className="h-4 bg-slate-200 rounded w-64"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-32"></div>
        <div className="h-10 bg-slate-200 rounded w-24"></div>
      </div>
    </div>

    {/* Stats grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-8 bg-slate-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
      ))}
    </div>

    {/* Content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function MembershipDashboardClient() {
  const [stats, setStats] = useState<MembershipStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el modal de crear enlace de pago
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [users, setUsers] = useState<GymParticipant[]>([]);
  const [loadingPlansAndUsers, setLoadingPlansAndUsers] = useState(false);

  // Estados para el modal de usuarios del plan
  const [showPlanUsersModal, setShowPlanUsersModal] = useState(false);
  const [selectedPlanUsers, setSelectedPlanUsers] = useState<{
    planName: string;
    planPrice: number;
    planCurrency: string;
    users: PlanUserDetail[];
  } | null>(null);

  // Memoizar funciones para evitar re-renders
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await membershipAPI.getPlansStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching membership stats:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Solo cargar una vez al montar
  useEffect(() => {
    fetchStats();
  }, []); // No dependencias para evitar loops

  const formatCurrency = useCallback((amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }, []);

  const formatBillingInterval = useCallback((interval: string) => {
    const intervals = {
      'month': 'Mensual',
      'year': 'Anual',
      'one_time': 'Pago único'
    };
    return intervals[interval as keyof typeof intervals] || interval;
  }, []);

  const fetchPlansAndUsers = useCallback(async () => {
    setLoadingPlansAndUsers(true);
    try {
      const [plansData, usersData] = await Promise.all([
        membershipAPI.getPlans({ limit: 100 }),
        getUsersAPI.getGymParticipants({ limit: 100 })
      ]);
      setPlans(plansData.plans);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching plans and users:', err);
    } finally {
      setLoadingPlansAndUsers(false);
    }
  }, []);

  const handleOpenPaymentLinkModal = useCallback(() => {
    setShowPaymentLinkModal(true);
    if (plans.length === 0 || users.length === 0) {
      fetchPlansAndUsers();
    }
  }, [plans.length, users.length, fetchPlansAndUsers]);

  const handleClosePaymentLinkModal = useCallback(() => {
    setShowPaymentLinkModal(false);
  }, []);

  const handleViewPlanUsers = useCallback((planStat: MembershipPlanStats) => {
    setSelectedPlanUsers({
      planName: planStat.plan.name,
      planPrice: planStat.plan.price_amount,
      planCurrency: planStat.plan.currency,
      users: planStat.users_details
    });
    setShowPlanUsersModal(true);
  }, []);

  const handleClosePlanUsersModal = useCallback(() => {
    setShowPlanUsersModal(false);
    setSelectedPlanUsers(null);
  }, []);

  // Mostrar skeleton mientras carga
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 mb-2">❌</div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar estadísticas</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Reintentar</span>
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
            <BarChart3 size={32} className="text-blue-600" />
            <span>Dashboard de Membresías</span>
          </h1>
          <p className="text-slate-600 mt-2">
            Estadísticas detalladas de planes y usuarios
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">
            Última actualización: {new Date(stats.generated_at).toLocaleString('es-ES')}
          </p>
          <button
            onClick={fetchStats}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Usuarios */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-slate-900">{stats.summary.total_users}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600">
              {stats.summary.active_users} activos • {stats.summary.expired_users} expirados
            </p>
          </div>
        </div>

        {/* Ingresos Estimados */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ingresos Mensuales</p>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(stats.summary.estimated_monthly_revenue, stats.summary.currency)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-600">
              Moneda: {stats.summary.currency}
            </p>
          </div>
        </div>

        {/* Nuevos Usuarios */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Nuevos (30 días)</p>
              <p className="text-3xl font-bold text-slate-900">{stats.summary.recent_users_30_days}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-amber-600">
              {stats.summary.expiring_soon_7_days} expiran pronto
            </p>
          </div>
        </div>

        {/* Total Planes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Planes Totales</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.analysis.total_active_plans + stats.analysis.total_inactive_plans}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-600">
              {stats.analysis.total_active_plans} activos • {stats.analysis.total_inactive_plans} inactivos
            </p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
          <Target size={20} className="text-blue-600" />
          <span>Acciones Rápidas</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gestionar Planes */}
          <Link
            href="/membership/planes"
            className="group bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Gestionar Planes</h4>
                  <p className="text-sm text-blue-700">Crear, editar y eliminar planes de membresía</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Crear Enlaces de Pago */}
          <button
            onClick={handleOpenPaymentLinkModal}
            className="group bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 hover:from-green-100 hover:to-green-200 transition-all duration-200 hover:shadow-md text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <LinkIcon size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Crear Enlace de Pago</h4>
                  <p className="text-sm text-green-700">Generar enlaces de pago para usuarios específicos</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-green-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Distribución por Tipo de Membresía */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tipos de Membresía */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Activity size={20} className="text-blue-600" />
            <span>Distribución por Tipo</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-slate-700">Gratuitas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-slate-900">{stats.membership_types.free}</span>
                <span className="text-sm text-slate-500">
                  ({((stats.membership_types.free / stats.summary.total_users) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-slate-700">De Pago</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-slate-900">{stats.membership_types.paid}</span>
                <span className="text-sm text-slate-500">
                  ({((stats.membership_types.paid / stats.summary.total_users) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                <span className="text-slate-700">Prueba</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-slate-900">{stats.membership_types.trial}</span>
                <span className="text-sm text-slate-500">
                  ({((stats.membership_types.trial / stats.summary.total_users) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Planes Destacados */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Award size={20} className="text-yellow-600" />
            <span>Planes Destacados</span>
          </h3>
          <div className="space-y-4">
            {/* Plan Más Popular */}
            {stats.analysis.most_popular_plan ? (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">Más Popular</span>
                  <span className="text-sm text-blue-600">{stats.analysis.most_popular_plan.users_count} usuarios</span>
                </div>
                <h4 className="font-semibold text-slate-900">{stats.analysis.most_popular_plan.plan.name}</h4>
                <p className="text-sm text-slate-600">{stats.analysis.most_popular_plan.plan.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-slate-500">
                    {formatCurrency(stats.analysis.most_popular_plan.plan.price_amount, stats.analysis.most_popular_plan.plan.currency)} / {formatBillingInterval(stats.analysis.most_popular_plan.plan.billing_interval)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    stats.analysis.most_popular_plan.plan.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.analysis.most_popular_plan.plan.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600">No hay planes con usuarios activos</p>
              </div>
            )}

            {/* Plan con Más Ingresos */}
            {stats.analysis.highest_revenue_plan ? (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">Mayor Ingreso</span>
                  <span className="text-sm text-green-600">
                    {formatCurrency(stats.analysis.highest_revenue_plan.estimated_monthly_revenue, stats.analysis.highest_revenue_plan.plan.currency)}
                </span>
              </div>
              <h4 className="font-semibold text-slate-900">{stats.analysis.highest_revenue_plan.plan.name}</h4>
              <p className="text-sm text-slate-600">{stats.analysis.highest_revenue_plan.plan.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-slate-500">
                  {formatCurrency(stats.analysis.highest_revenue_plan.plan.price_amount, stats.analysis.highest_revenue_plan.plan.currency)} / {formatBillingInterval(stats.analysis.highest_revenue_plan.plan.billing_interval)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  stats.analysis.highest_revenue_plan.plan.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stats.analysis.highest_revenue_plan.plan.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600">No hay datos de ingresos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Estadísticas por Plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
          <Target size={20} className="text-blue-600" />
          <span>Estadísticas por Plan</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Precio</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Usuarios</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Ingresos/Mes</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Creado</th>
              </tr>
            </thead>
            <tbody>
              {stats.plans_statistics.map((planStat) => (
                <tr key={planStat.plan.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <div>
                      <h4 className="font-medium text-slate-900">{planStat.plan.name}</h4>
                      <p className="text-sm text-slate-600">{planStat.plan.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(planStat.plan.price_amount, planStat.plan.currency)}
                      </span>
                      <p className="text-sm text-slate-600">{formatBillingInterval(planStat.plan.billing_interval)}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-slate-900">{planStat.users_count}</span>
                      {planStat.users_count > 0 && (
                        <button
                          onClick={() => handleViewPlanUsers(planStat)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Ver usuarios suscritos"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-green-600">
                      {formatCurrency(planStat.estimated_monthly_revenue, planStat.plan.currency)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      planStat.plan.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {planStat.plan.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {new Date(planStat.plan.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de crear enlace de pago */}
      <AdminPaymentLinkModal
        isOpen={showPaymentLinkModal}
        onClose={handleClosePaymentLinkModal}
        plans={plans}
        users={users}
      />

      {/* Modal de usuarios del plan */}
      {selectedPlanUsers && (
        <PlanUsersModal
          isOpen={showPlanUsersModal}
          onClose={handleClosePlanUsersModal}
          planName={selectedPlanUsers.planName}
          planPrice={selectedPlanUsers.planPrice}
          planCurrency={selectedPlanUsers.planCurrency}
          users={selectedPlanUsers.users}
        />
      )}
    </div>
  );
} 