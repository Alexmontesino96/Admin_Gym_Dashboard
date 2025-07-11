'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUsersAPI, nutritionAPI, NutritionPlan, DailyPlan, GymParticipant, PlanType, ArchivePlanRequest, PlanStatus } from '@/lib/api';
import PlanTypeIndicator from '@/components/ui/plan-type-indicator';
import LivePlanStatus from '@/components/ui/live-plan-status';

// Importaciones optimizadas de iconos - solo los que necesitamos
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Target, 
  Clock, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Apple,
  Star,
  Calendar,
  User,
  Heart,
  TrendingUp,
  Plus,
  Check,
  X,
  Archive,
  AlertCircle
} from 'lucide-react';

interface EnrichedNutritionPlan extends NutritionPlan {
  creator?: GymParticipant;
  days?: DailyPlan[];
  daysCount?: number;
}

interface PlansResponse {
  plans: NutritionPlan[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function NutritionPlansClient() {
  const router = useRouter();
  const [plans, setPlans] = useState<EnrichedNutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    goal: '',
    difficulty_level: '',
    budget_level: '',
    dietary_restrictions: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    has_next: false,
    has_prev: false
  });
  const [userCache, setUserCache] = useState<{[key: number]: GymParticipant}>({});

  // Estados para controlar qué dropdown está abierto
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Estados para el modal de archivado
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archivingPlanId, setArchivingPlanId] = useState<number | null>(null);
  const [createTemplate, setCreateTemplate] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [archiving, setArchiving] = useState(false);

  // Cerrar dropdown cuando se hace click fuera o se presiona ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openDropdown && !target.closest(`[data-dropdown="${openDropdown}"]`)) {
        setOpenDropdown(null);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [openDropdown]);

  // Función para obtener información de usuarios con cache
  const fetchUserInfo = async (userId: number): Promise<GymParticipant | undefined> => {
    // Verificar cache primero
    if (userCache[userId]) {
      console.log(`Cache hit para usuario ${userId}:`, userCache[userId]);
      return userCache[userId];
    }
    
    console.log('Fetching gym participant info for userId:', userId);

    try {
      // Usar el endpoint específico para participantes del gimnasio (más completo)
      const userData = await getUsersAPI.getGymParticipantById(userId);
      console.log('Gym participant data received:', userData);
      
      // Validar que la respuesta tenga datos básicos
      if (!userData || !userData.id) {
        console.warn(`Datos incompletos recibidos para usuario ${userId}:`, userData);
        return undefined;
      }
      
      // Guardar en cache
      setUserCache(prev => ({
        ...prev,
        [userId]: userData
      }));
      
      return userData;
    } catch (error) {
      console.error(`Error fetching gym participant info para usuario ${userId}:`, error);
      
      // No guardar datos fallback en cache para este endpoint ya que requiere permisos de admin
      return undefined;
    }
  };

  // Función para cargar planes
  const fetchPlans = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar la función centralizada de la API
      const data = await nutritionAPI.getPlans({
        page,
        per_page: pagination.per_page,
        search_query: searchQuery.trim() || undefined,
        goal: filters.goal || undefined,
        difficulty_level: filters.difficulty_level || undefined,
        budget_level: filters.budget_level || undefined,
        dietary_restrictions: filters.dietary_restrictions || undefined,
      });
      
      // Enriquecer planes con información del creador y obtener días individuales
      const enrichedPlans: EnrichedNutritionPlan[] = await Promise.all(
        data.plans.map(async (plan) => {
          // Obtener información completa del creador desde el endpoint de participantes del gimnasio
          // Este endpoint requiere permisos de admin pero devuelve información más completa
          // incluyendo first_name, last_name, email, gym_role, etc.
          const creatorInfo = await fetchUserInfo(plan.creator_id);
          
          if (!creatorInfo) {
            console.warn(`No se pudo obtener información del creador para el plan ${plan.id} (creator_id: ${plan.creator_id})`);
          }
          
          // Si no vienen los daily_plans en la lista, obtenerlos individualmente
          let planDays: DailyPlan[] = [];
          let daysCount = 0;
          
          if (plan.daily_plans) {
            planDays = plan.daily_plans;
            daysCount = plan.daily_plans.length;
          } else {
            // Obtener el plan individual que sí incluye los días
            try {
              const fullPlan = await nutritionAPI.getPlan(plan.id);
              planDays = fullPlan.daily_plans || [];
              daysCount = planDays.length;
            } catch (error) {
              console.error(`Error obteniendo días del plan ${plan.id}:`, error);
              planDays = [];
              daysCount = 0;
            }
          }
          
          console.log(`Plan ${plan.id}: ${daysCount} días de ${plan.duration_days} - Creador: ${creatorInfo ? getCreatorDisplayName(creatorInfo) : 'No disponible'}`, {
            daily_plans: planDays,
            daysCount,
            duration_days: plan.duration_days,
            creator_info: creatorInfo
          });
          
          return {
            ...plan,
            creator: creatorInfo,
            days: planDays,
            daysCount
          };
        })
      );
      
      setPlans(enrichedPlans);
      setPagination({
        page: data.page,
        per_page: data.per_page,
        total: data.total,
        has_next: data.has_next,
        has_prev: data.has_prev
      });

    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar planes al montar el componente
  useEffect(() => {
    fetchPlans();
  }, []);

  // Aplicar filtros automáticamente cuando cambien los filtros o búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPlans(1); // Resetear a la primera página
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Función para aplicar filtros (mantenida para compatibilidad)
  const applyFilters = () => {
    fetchPlans(1); // Resetear a la primera página
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      goal: '',
      difficulty_level: '',
      budget_level: '',
      dietary_restrictions: ''
    });
    // El useEffect se encargará de recargar automáticamente
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para obtener color del objetivo
  const getGoalColor = (goal: string) => {
    const colors = {
      bulk: 'bg-blue-100 text-blue-800',
      cut: 'bg-red-100 text-red-800',
      maintain: 'bg-green-100 text-green-800',
      performance: 'bg-purple-100 text-purple-800'
    };
    return colors[goal as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Función para obtener color de dificultad
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Función para navegar a la página de editar días
  const handleEditDays = (planId: number) => {
    router.push(`/nutricion/planes/${planId}/editar-dias`);
  };

  // Función para obtener el nombre del creador
  const getCreatorDisplayName = (creator: GymParticipant | undefined) => {
    if (!creator) return 'Información no disponible';
    
    const parts = [];
    if (creator.first_name) parts.push(creator.first_name);
    if (creator.last_name) parts.push(creator.last_name);
    
    if (parts.length === 0) {
      return creator.email || 'Usuario sin nombre';
    }
    
    return parts.join(' ').trim();
  };

  // Función para detectar si un plan es archivable
  const isPlanArchivable = (plan: NutritionPlan): boolean => {
    // Solo planes live pueden ser archivados
    if (plan.plan_type !== 'live') return false;
    
    // Verificar si el plan está terminado
    if (plan.status === 'finished') return true;
    
    // Si no está activo y tiene fecha de finalización, verificar si ya pasó
    if (!plan.is_live_active && plan.live_end_date) {
      const endDate = new Date(plan.live_end_date);
      return endDate < new Date();
    }
    
    return false;
  };

  // Función para abrir el modal de archivado
  const handleArchivePlan = (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    setArchivingPlanId(planId);
    setTemplateTitle(plan.title + ' - Template');
    setCreateTemplate(false);
    setShowArchiveModal(true);
  };

  // Función para confirmar el archivado
  const confirmArchivePlan = async () => {
    if (!archivingPlanId) return;
    
    setArchiving(true);
    try {
      const archiveRequest: ArchivePlanRequest = {
        create_template_version: createTemplate,
        template_title: createTemplate ? templateTitle : undefined
      };
      
      await nutritionAPI.archivePlan(archivingPlanId, archiveRequest);
      
      // Recargar los planes para reflejar el cambio
      await fetchPlans(pagination.page);
      
      // Cerrar modal
      setShowArchiveModal(false);
      setArchivingPlanId(null);
      setCreateTemplate(false);
      setTemplateTitle('');
      
    } catch (error) {
      console.error('Error al archivar plan:', error);
      setError('Error al archivar el plan. Por favor, inténtalo de nuevo.');
    } finally {
      setArchiving(false);
    }
  };

  // Función para cancelar el archivado
  const cancelArchivePlan = () => {
    setShowArchiveModal(false);
    setArchivingPlanId(null);
    setCreateTemplate(false);
    setTemplateTitle('');
  };

  return (
    <div className="space-y-6 relative">

      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText size={24} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Planes Nutricionales</h1>
            <p className="text-slate-600">Gestiona y visualiza todos los planes disponibles</p>
          </div>
        </div>
        
        <a
          href="/nutricion/crear"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Apple size={16} />
          <span>Nuevo Plan</span>
        </a>
      </div>

            {/* Filtros y búsqueda compactos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        {/* Header de filtros */}
        <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Filter size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Filtros de Búsqueda</h2>
                <p className="text-sm text-slate-600">Encuentra el plan perfecto para tus necesidades</p>
              </div>
            </div>
            
            {/* Contador de filtros activos */}
            {(searchQuery || Object.values(filters).some(f => f)) && (
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {[searchQuery, ...Object.values(filters)].filter(Boolean).length} filtro{[searchQuery, ...Object.values(filters)].filter(Boolean).length !== 1 ? 's' : ''} activo{[searchQuery, ...Object.values(filters)].filter(Boolean).length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearFilters}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Limpiar todos los filtros"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenido de filtros */}
        <div className="p-6">
          {/* Barra de búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, descripción, tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm bg-slate-50 hover:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filtros como botones desplegables */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
            {/* Filtro de Objetivo */}
            <div className="relative" data-dropdown="goal">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDropdown(openDropdown === 'goal' ? null : 'goal');
                }}
                className={`w-full p-3 border rounded-xl text-left flex items-center justify-between transition-all ${
                  filters.goal 
                    ? 'border-blue-300 bg-blue-50 text-blue-700' 
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Target size={16} />
                  <span className="font-medium">
                    {filters.goal 
                      ? (filters.goal === 'bulk' ? 'Volumen' : 
                         filters.goal === 'cut' ? 'Definición' : 
                         filters.goal === 'maintain' ? 'Mantenimiento' : 'Rendimiento')
                      : 'Objetivo'
                    }
                  </span>
                </div>
                <ChevronRight size={16} className={`transform transition-transform ${openDropdown === 'goal' ? 'rotate-90' : ''}`} />
              </button>
              
              {openDropdown === 'goal' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-[60] max-h-64 overflow-y-auto">
                  {[
                    { value: '', label: 'Todos los objetivos', icon: '🎯' },
                    { value: 'bulk', label: 'Volumen', icon: '💪' },
                    { value: 'cut', label: 'Definición', icon: '🔥' },
                    { value: 'maintain', label: 'Mantenimiento', icon: '⚖️' },
                    { value: 'performance', label: 'Rendimiento', icon: '⚡' }
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilters({...filters, goal: goal.value});
                        setOpenDropdown(null);
                      }}
                      className={`w-full p-3 text-left hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl flex items-center space-x-3 transition-colors ${
                        filters.goal === goal.value ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{goal.icon}</span>
                      <span className="font-medium">{goal.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filtro de Dificultad */}
            <div className="relative" data-dropdown="difficulty">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDropdown(openDropdown === 'difficulty' ? null : 'difficulty');
                }}
                className={`w-full p-3 border rounded-xl text-left flex items-center justify-between transition-all ${
                  filters.difficulty_level 
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-700' 
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} />
                  <span className="font-medium">
                    {filters.difficulty_level 
                      ? (filters.difficulty_level === 'beginner' ? 'Principiante' : 
                         filters.difficulty_level === 'intermediate' ? 'Intermedio' : 'Avanzado')
                      : 'Dificultad'
                    }
                  </span>
                </div>
                <ChevronRight size={16} className={`transform transition-transform ${openDropdown === 'difficulty' ? 'rotate-90' : ''}`} />
              </button>
              
              {openDropdown === 'difficulty' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-[60] max-h-64 overflow-y-auto">
                  {[
                    { value: '', label: 'Todas las dificultades', icon: '📊' },
                    { value: 'beginner', label: 'Principiante', icon: '🌱' },
                    { value: 'intermediate', label: 'Intermedio', icon: '🔶' },
                    { value: 'advanced', label: 'Avanzado', icon: '🔥' }
                  ].map((difficulty) => (
                    <button
                      key={difficulty.value}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilters({...filters, difficulty_level: difficulty.value});
                        setOpenDropdown(null);
                      }}
                      className={`w-full p-3 text-left hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl flex items-center space-x-3 transition-colors ${
                        filters.difficulty_level === difficulty.value ? 'bg-yellow-50 text-yellow-700' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{difficulty.icon}</span>
                      <span className="font-medium">{difficulty.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filtro de Presupuesto */}
            <div className="relative" data-dropdown="budget">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDropdown(openDropdown === 'budget' ? null : 'budget');
                }}
                className={`w-full p-3 border rounded-xl text-left flex items-center justify-between transition-all ${
                  filters.budget_level 
                    ? 'border-purple-300 bg-purple-50 text-purple-700' 
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign size={16} />
                  <span className="font-medium">
                    {filters.budget_level 
                      ? (filters.budget_level === 'economic' ? 'Económico' : 
                         filters.budget_level === 'medium' ? 'Medio' : 'Premium')
                      : 'Presupuesto'
                    }
                  </span>
                </div>
                <ChevronRight size={16} className={`transform transition-transform ${openDropdown === 'budget' ? 'rotate-90' : ''}`} />
              </button>
              
              {openDropdown === 'budget' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-[60] max-h-64 overflow-y-auto">
                  {[
                    { value: '', label: 'Todos los presupuestos', icon: '💰' },
                    { value: 'economic', label: 'Económico', icon: '💚' },
                    { value: 'medium', label: 'Medio', icon: '💛' },
                    { value: 'premium', label: 'Premium', icon: '💜' }
                  ].map((budget) => (
                    <button
                      key={budget.value}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilters({...filters, budget_level: budget.value});
                        setOpenDropdown(null);
                      }}
                      className={`w-full p-3 text-left hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl flex items-center space-x-3 transition-colors ${
                        filters.budget_level === budget.value ? 'bg-purple-50 text-purple-700' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{budget.icon}</span>
                      <span className="font-medium">{budget.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chips de filtros activos */}
          {(searchQuery || Object.values(filters).some(f => f)) && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-700">Filtros activos</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Limpiar todos
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    <Search size={14} />
                    <span>"{searchQuery}"</span>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {filters.goal && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    <Target size={14} />
                    <span>{filters.goal === 'bulk' ? 'Volumen' : filters.goal === 'cut' ? 'Definición' : filters.goal === 'maintain' ? 'Mantenimiento' : 'Rendimiento'}</span>
                    <button
                      onClick={() => {
                        setFilters({...filters, goal: ''});
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {filters.difficulty_level && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                    <TrendingUp size={14} />
                    <span>{filters.difficulty_level === 'beginner' ? 'Principiante' : filters.difficulty_level === 'intermediate' ? 'Intermedio' : 'Avanzado'}</span>
                    <button
                      onClick={() => {
                        setFilters({...filters, difficulty_level: ''});
                      }}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {filters.budget_level && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    <DollarSign size={14} />
                    <span>{filters.budget_level === 'economic' ? 'Económico' : filters.budget_level === 'medium' ? 'Medio' : 'Premium'}</span>
                    <button
                      onClick={() => {
                        setFilters({...filters, budget_level: ''});
                      }}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 mb-2">❌</div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar planes</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchPlans()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🍎</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron planes</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery || Object.values(filters).some(f => f) 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Aún no hay planes nutricionales creados'
            }
          </p>
          <button
            onClick={clearFilters}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {searchQuery || Object.values(filters).some(f => f) ? 'Limpiar filtros' : 'Crear primer plan'}
          </button>
        </div>
      ) : (
        <>
          {/* Lista de planes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {pagination.total} plan{pagination.total !== 1 ? 'es' : ''} nutricional{pagination.total !== 1 ? 'es' : ''}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  Página {pagination.page} de {Math.ceil(pagination.total / pagination.per_page)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden max-w-sm mx-auto">
                  
                  {/* Header simple */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Apple size={20} className="text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {plan.goal === 'bulk' ? 'Volumen' : 
                         plan.goal === 'cut' ? 'Definición' : 
                         plan.goal === 'maintain' ? 'Mantenimiento' : 
                         plan.goal === 'performance' ? 'Rendimiento' : plan.goal}
                      </h3>
                    </div>

                    {/* Badges con indicador de tipo */}
                    <div className="flex gap-2 mb-6">
                      {/* Indicador de tipo de plan */}
                      <PlanTypeIndicator 
                        plan={{
                          ...plan,
                          plan_type: plan.plan_type || PlanType.TEMPLATE,
                          is_live_active: plan.is_live_active || false,
                          live_participants_count: plan.live_participants_count || 0
                        }} 
                        size="sm" 
                      />
                      
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                        {plan.goal === 'bulk' ? 'Volumen' : 
                         plan.goal === 'cut' ? 'Definición' : 
                         plan.goal === 'maintain' ? 'Mantenimiento' : 
                         plan.goal === 'performance' ? 'Rendimiento' : plan.goal}
                      </span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                        {plan.difficulty_level === 'beginner' ? 'Principiante' : 
                         plan.difficulty_level === 'intermediate' ? 'Intermedio' : 
                         plan.difficulty_level === 'advanced' ? 'Avanzado' : plan.difficulty_level}
                      </span>
                    </div>

                    {/* Creador */}
                    <div className="flex items-center space-x-2 mb-6">
                      <User size={16} className="text-slate-400" />
                      <span 
                        className="text-slate-600 text-sm"
                        title={plan.creator ? `Creado por ${getCreatorDisplayName(plan.creator)}` : 'Información del creador no disponible'}
                      >
                        {getCreatorDisplayName(plan.creator)}
                      </span>
                    </div>

                    {/* Estado de plan live */}
                    {plan.plan_type === 'live' && (
                      <div className="mb-6">
                        <LivePlanStatus 
                          plan={{
                            ...plan,
                            plan_type: plan.plan_type,
                            is_live_active: plan.is_live_active || false,
                            live_participants_count: plan.live_participants_count || 0
                          }}
                          showParticipants={true}
                          showCountdown={true}
                        />
                      </div>
                    )}

                    {/* Calorías y Duración */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">CALORÍAS</p>
                        <p className="text-4xl font-bold text-slate-900 mb-1">{plan.target_calories}</p>
                        <p className="text-sm text-slate-500">kcal diarias</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">DURACIÓN</p>
                        <p className="text-4xl font-bold text-slate-900 mb-1">{plan.duration_days}</p>
                        <p className="text-sm text-slate-500">días</p>
                      </div>
                    </div>

                    {/* Macronutrientes */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{plan.target_protein_g}g</p>
                        <p className="text-sm text-slate-500">Proteína</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{plan.target_carbs_g}g</p>
                        <p className="text-sm text-slate-500">Carbohidratos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{plan.target_fat_g}g</p>
                        <p className="text-sm text-slate-500">Grasas</p>
                      </div>
                    </div>

                    {/* Progreso de días */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">PROGRESO</span>
                        <span className="text-sm font-semibold text-slate-700">
                          {plan.daysCount || 0}/{plan.duration_days} días
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 cursor-pointer" onClick={() => handleEditDays(plan.id)}>
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 hover:bg-blue-600"
                          style={{ 
                            width: `${plan.duration_days > 0 ? Math.min(((plan.daysCount || 0) / plan.duration_days) * 100, 100) : 0}%` 
                          }}
                          title={`${plan.daysCount || 0} de ${plan.duration_days} días completados (${plan.duration_days > 0 ? Math.round(((plan.daysCount || 0) / plan.duration_days) * 100) : 0}%)`}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-400">
                          {plan.duration_days > 0 ? Math.round(((plan.daysCount || 0) / plan.duration_days) * 100) : 0}% completado
                        </span>
                        <span className="text-xs text-slate-400">
                          {Math.max(0, plan.duration_days - (plan.daysCount || 0))} restantes
                        </span>
                      </div>
                    </div>

                    {/* Botón minimalista */}
                    <button
                      onClick={() => handleEditDays(plan.id)}
                      className="w-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit size={16} />
                      <span>Editar días</span>
                    </button>

                    {/* Botón de archivar para planes live terminados */}
                    {isPlanArchivable(plan) && (
                      <button
                        onClick={() => handleArchivePlan(plan.id)}
                        className="w-full mt-2 border border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Archive size={16} />
                        <span>Archivar plan</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paginación */}
          {pagination.total > pagination.per_page && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">
                  Mostrando {((pagination.page - 1) * pagination.per_page) + 1} - {Math.min(pagination.page * pagination.per_page, pagination.total)} de {pagination.total} planes
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchPlans(pagination.page - 1)}
                  disabled={!pagination.has_prev}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                  {pagination.page}
                </span>
                
                <button
                  onClick={() => fetchPlans(pagination.page + 1)}
                  disabled={!pagination.has_next}
                  className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación para archivar */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Archive size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Archivar Plan Live</h3>
                <p className="text-sm text-slate-600">Este plan live ha terminado y puede ser archivado</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">¿Qué significa archivar?</span>
                </div>
                <p className="text-sm text-amber-700">
                  Al archivar este plan, se marcará como terminado y no estará disponible para nuevos participantes.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="createTemplate"
                    checked={createTemplate}
                    onChange={(e) => setCreateTemplate(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <label htmlFor="createTemplate" className="text-sm font-medium text-slate-900">
                    Crear plantilla para reutilizar
                  </label>
                </div>

                {createTemplate && (
                  <div className="ml-7">
                    <label htmlFor="templateTitle" className="block text-sm font-medium text-slate-700 mb-2">
                      Título de la plantilla
                    </label>
                    <input
                      type="text"
                      id="templateTitle"
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nombre para la nueva plantilla"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelArchivePlan}
                disabled={archiving}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmArchivePlan}
                disabled={archiving || (createTemplate && !templateTitle.trim())}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {archiving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Archivando...</span>
                  </>
                ) : (
                  <>
                    <Archive size={16} />
                    <span>Archivar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}