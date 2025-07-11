'use client';

import { useState, useEffect } from 'react';
import { membershipAPI, getUsersAPI, MembershipPlan, MembershipPlanList, MembershipPlanCreateData, MembershipPlanUpdateData, GymParticipant, MembershipStatsResponse, PlanUserDetail } from '@/lib/api';
import AdminPaymentLinkModal from '@/components/AdminPaymentLinkModal';
import PlanUsersModal from '@/components/PlanUsersModal';
import { 
  CreditCard, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Users,
  RefreshCw,
  Filter,
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  Link as LinkIcon,
  Eye
} from 'lucide-react';

export default function MembershipPlansClient() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [gymInfo, setGymInfo] = useState<{ id: number; name: string } | null>(null);
  
  // Estados para el modal de creación
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MembershipPlanCreateData>({
    name: '',
    description: '',
    price_cents: 0,
    currency: 'EUR',
    billing_interval: 'month',
    duration_days: 30,
    is_active: true,
    features: '',
    max_bookings_per_month: 0
  });

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<MembershipPlanUpdateData>({});

  // Estados para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<MembershipPlan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estados para el modal de crear enlace de pago
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [users, setUsers] = useState<GymParticipant[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Estados para el modal de usuarios del plan
  const [showPlanUsersModal, setShowPlanUsersModal] = useState(false);
  const [selectedPlanUsers, setSelectedPlanUsers] = useState<{
    planName: string;
    planPrice: number;
    planCurrency: string;
    users: PlanUserDetail[];
  } | null>(null);
  const [planStats, setPlanStats] = useState<MembershipStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchPlanStats(); // Cargar estadísticas para mostrar el conteo de usuarios
  }, [showActiveOnly]);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data: MembershipPlanList = await membershipAPI.getPlans({
        active_only: showActiveOnly,
        limit: 100
      });
      
      setPlans(data.plans);
      setGymInfo({ id: data.gym_id, name: data.gym_name });
    } catch (err) {
      console.error('Error fetching membership plans:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los planes de membresía');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (priceCents: number, currency: string) => {
    const amount = priceCents / 100;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatBillingInterval = (interval: string) => {
    const intervals = {
      'month': 'Mensual',
      'year': 'Anual',
      'one_time': 'Pago único'
    };
    return intervals[interval as keyof typeof intervals] || interval;
  };

  const formatDuration = (days: number) => {
    if (days === 0) return 'Sin límite';
    if (days === 1) return '1 día';
    if (days < 30) return `${days} días`;
    if (days === 30) return '1 mes';
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    
    try {
      const newPlan = await membershipAPI.createPlan(formData);
      setPlans([...plans, newPlan]);
      setShowCreateModal(false);
      // Reiniciar el formulario
      setFormData({
        name: '',
        description: '',
        price_cents: 0,
        currency: 'EUR',
        billing_interval: 'month',
        duration_days: 30,
        is_active: true,
        features: '',
        max_bookings_per_month: 0
      });
    } catch (err) {
      console.error('Error creating plan:', err);
      setCreateError(err instanceof Error ? err.message : 'Error al crear el plan');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_cents: 0,
      currency: 'EUR',
      billing_interval: 'month',
      duration_days: 30,
      is_active: true,
      features: '',
      max_bookings_per_month: 0
    });
    setCreateError(null);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setEditFormData({
      name: plan.name,
      description: plan.description,
      price_cents: plan.price_cents,
      currency: plan.currency,
      billing_interval: plan.billing_interval,
      duration_days: plan.duration_days,
      is_active: plan.is_active,
      features: plan.features,
      max_bookings_per_month: plan.max_bookings_per_month
    });
    setShowEditModal(true);
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setUpdating(true);
    setUpdateError(null);
    
    try {
      const updatedPlan = await membershipAPI.updatePlan(editingPlan.id, editFormData);
      setPlans(plans.map(plan => plan.id === editingPlan.id ? updatedPlan : plan));
      setShowEditModal(false);
      setEditingPlan(null);
      setEditFormData({});
    } catch (err) {
      console.error('Error updating plan:', err);
      setUpdateError(err instanceof Error ? err.message : 'Error al actualizar el plan');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPlan(null);
    setEditFormData({});
    setUpdateError(null);
  };

  const handleDeletePlan = (plan: MembershipPlan) => {
    setDeletingPlan(plan);
    setShowDeleteModal(true);
  };

  const confirmDeletePlan = async () => {
    if (!deletingPlan) return;

    setDeleting(true);
    setDeleteError(null);
    
    try {
      await membershipAPI.deletePlan(deletingPlan.id);
      setPlans(plans.filter(plan => plan.id !== deletingPlan.id));
      setShowDeleteModal(false);
      setDeletingPlan(null);
    } catch (err) {
      console.error('Error deleting plan:', err);
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el plan');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingPlan(null);
    setDeleteError(null);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await getUsersAPI.getGymParticipants({ limit: 100 });
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenPaymentLinkModal = () => {
    setShowPaymentLinkModal(true);
    if (users.length === 0) {
      fetchUsers();
    }
  };

  const handleClosePaymentLinkModal = () => {
    setShowPaymentLinkModal(false);
  };

  const fetchPlanStats = async () => {
    if (planStats) return; // Solo cargar una vez
    
    setLoadingStats(true);
    try {
      const stats = await membershipAPI.getPlansStats();
      setPlanStats(stats);
    } catch (err) {
      console.error('Error fetching plan stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleViewPlanUsers = async (plan: MembershipPlan) => {
    let currentStats = planStats;
    
    if (!currentStats) {
      setLoadingStats(true);
      try {
        currentStats = await membershipAPI.getPlansStats();
        setPlanStats(currentStats);
      } catch (err) {
        console.error('Error fetching plan stats:', err);
        return;
      } finally {
        setLoadingStats(false);
      }
    }

    // Buscar las estadísticas del plan
    const planStat = currentStats.plans_statistics.find(stat => stat.plan.id === plan.id);
    if (planStat) {
      setSelectedPlanUsers({
        planName: plan.name,
        planPrice: plan.price_cents / 100,
        planCurrency: plan.currency,
        users: planStat.users_details
      });
      setShowPlanUsersModal(true);
    }
  };

  const handleClosePlanUsersModal = () => {
    setShowPlanUsersModal(false);
    setSelectedPlanUsers(null);
  };

  const getPlanUserCount = (planId: number): number => {
    if (!planStats) return 0;
    const planStat = planStats.plans_statistics.find(stat => stat.plan.id === planId);
    return planStat?.users_count || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 mb-2">❌</div>
        <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar planes</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => fetchPlans()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <RefreshCw size={16} />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar planes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro activos/inactivos */}
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-slate-400" />
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-slate-700">Solo activos</span>
          </label>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-2">
          <button
            onClick={handleOpenPaymentLinkModal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <LinkIcon size={16} />
            <span>Crear Enlace</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Crear Plan</span>
          </button>
        </div>
      </div>

      {/* Lista de planes */}
      {filteredPlans.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron planes</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery 
              ? 'Intenta ajustar tu búsqueda'
              : 'Aún no hay planes de membresía creados'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
              {/* Header del plan */}
                              <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard size={20} className="text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    </div>
                    
                    {/* Estado del plan */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      plan.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.is_active ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <p className="text-slate-600 text-sm">
                      {plan.description || 'Sin descripción disponible'}
                    </p>
                  </div>

                  {/* Precio */}
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-slate-900">
                        {formatPrice(plan.price_cents, plan.currency)}
                      </span>
                      <span className="text-sm text-slate-500">
                        / {formatBillingInterval(plan.billing_interval)}
                      </span>
                    </div>
                    {plan.is_recurring && (
                      <div className="flex items-center space-x-2 mt-2">
                        <RefreshCw size={14} className="text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Renovación automática</span>
                      </div>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-600">
                        Duración: {formatDuration(plan.duration_days)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <CheckCircle size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-600">
                        {plan.max_bookings_per_month === 0 
                          ? 'Reservas ilimitadas' 
                          : `${plan.max_bookings_per_month} reservas/mes`
                        }
                      </span>
                    </div>

                    {/* Información adicional para uniformidad */}
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                      <span className="text-sm text-slate-600">
                        Tipo: {plan.billing_interval === 'one_time' ? 'Pago único' : 'Recurrente'}
                      </span>
                    </div>
                  </div>

                  {/* Características */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Características:</h4>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-600">
                        {plan.features || 'Sin características específicas definidas'}
                      </p>
                    </div>
                  </div>
                </div>

                                {/* Botones de acción - pegado al final */}
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleViewPlanUsers(plan)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      title="Ver usuarios suscritos"
                    >
                      <Eye size={16} />
                      <span>Ver ({getPlanUserCount(plan.id)})</span>
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{plans.length}</div>
            <div className="text-sm text-blue-700">Total de planes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {plans.filter(p => p.is_active).length}
            </div>
            <div className="text-sm text-green-700">Planes activos</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {plans.filter(p => p.is_recurring).length}
            </div>
            <div className="text-sm text-amber-700">Con renovación automática</div>
          </div>
        </div>
      </div>

      {/* Modal de creación de plan */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Crear Nuevo Plan</h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreatePlan} className="p-6 space-y-6">
              {/* Error */}
              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-sm text-red-800">{createError}</span>
                  </div>
                </div>
              )}

              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Información Básica</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre del Plan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Plan Premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="is_active"
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe las características del plan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Características
                  </label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Lista las características principales..."
                  />
                </div>
              </div>

              {/* Precio y facturación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Precio y Facturación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Precio (centavos) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price_cents"
                      value={formData.price_cents}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2999"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Precio: {formatPrice(formData.price_cents, formData.currency)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Intervalo de Facturación
                    </label>
                    <select
                      name="billing_interval"
                      value={formData.billing_interval}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="month">Mensual</option>
                      <option value="year">Anual</option>
                      <option value="one_time">Pago único</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Duración y límites */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Duración y Límites</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Duración (días) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration_days"
                      value={formData.duration_days}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="30"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Duración: {formatDuration(formData.duration_days)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Reservas por Mes
                    </label>
                    <input
                      type="number"
                      name="max_bookings_per_month"
                      value={formData.max_bookings_per_month}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      0 = ilimitadas
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {creating ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  <span>{creating ? 'Creando...' : 'Crear Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edición de plan */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Edit size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Editar Plan</h2>
                    <p className="text-sm text-slate-600">{editingPlan.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseEditModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleUpdatePlan} className="p-6 space-y-6">
              {/* Error */}
              {updateError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-sm text-red-800">{updateError}</span>
                  </div>
                </div>
              )}

              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Información Básica</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre del Plan
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Plan Premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="is_active"
                      value={editFormData.is_active ? 'true' : 'false'}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description || ''}
                    onChange={handleEditInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe las características del plan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Características
                  </label>
                  <textarea
                    name="features"
                    value={editFormData.features || ''}
                    onChange={handleEditInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Lista las características principales..."
                  />
                </div>
              </div>

              {/* Precio y facturación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Precio y Facturación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Precio (centavos)
                    </label>
                    <input
                      type="number"
                      name="price_cents"
                      value={editFormData.price_cents || 0}
                      onChange={handleEditInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2999"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Precio: {formatPrice(editFormData.price_cents || 0, editFormData.currency || 'EUR')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      value={editFormData.currency || 'EUR'}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Intervalo de Facturación
                    </label>
                    <select
                      name="billing_interval"
                      value={editFormData.billing_interval || 'month'}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="month">Mensual</option>
                      <option value="year">Anual</option>
                      <option value="one_time">Pago único</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Duración y límites */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Duración y Límites</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Duración (días)
                    </label>
                    <input
                      type="number"
                      name="duration_days"
                      value={editFormData.duration_days || 0}
                      onChange={handleEditInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="30"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Duración: {formatDuration(editFormData.duration_days || 0)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Reservas por Mes
                    </label>
                    <input
                      type="number"
                      name="max_bookings_per_month"
                      value={editFormData.max_bookings_per_month || 0}
                      onChange={handleEditInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      0 = ilimitadas
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de Stripe (solo lectura) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Información de Stripe</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Product ID:</strong> {editingPlan.stripe_product_id}</div>
                    <div><strong>Price ID:</strong> {editingPlan.stripe_price_id}</div>
                    <div><strong>Creado:</strong> {new Date(editingPlan.created_at).toLocaleDateString()}</div>
                    <div><strong>Actualizado:</strong> {new Date(editingPlan.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  disabled={updating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {updating ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Edit size={16} />
                  )}
                  <span>{updating ? 'Actualizando...' : 'Actualizar Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deletingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            {/* Header del modal */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 size={20} className="text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Confirmar Eliminación</h2>
                </div>
                <button
                  onClick={handleCloseDeleteModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-4">
              {/* Error */}
              {deleteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-sm text-red-800">{deleteError}</span>
                  </div>
                </div>
              )}

              {/* Advertencia */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span className="text-sm text-amber-800">
                    <strong>¡Atención!</strong> Esta acción no se puede deshacer.
                  </span>
                </div>
              </div>

              {/* Información del plan */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Plan a eliminar:</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div><strong>Nombre:</strong> {deletingPlan.name}</div>
                  <div><strong>Precio:</strong> {formatPrice(deletingPlan.price_cents, deletingPlan.currency)}</div>
                  <div><strong>Facturación:</strong> {formatBillingInterval(deletingPlan.billing_interval)}</div>
                  <div><strong>Estado:</strong> {deletingPlan.is_active ? 'Activo' : 'Inactivo'}</div>
                </div>
              </div>

              <p className="text-slate-600">
                ¿Estás seguro de que quieres eliminar este plan de membresía? 
                Esta acción desactivará el plan y no podrá ser utilizado por nuevos miembros.
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeletePlan}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {deleting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                <span>{deleting ? 'Eliminando...' : 'Eliminar Plan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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