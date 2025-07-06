'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUsersAPI, nutritionAPI, NutritionPlan, DailyPlan, GymParticipant, PlanType } from '@/lib/api';
import PlanTypeIndicator from '@/components/ui/plan-type-indicator';
import LivePlanStatus from '@/components/ui/live-plan-status';
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
  Check
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

  // Función para aplicar filtros
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
    // Recargar sin filtros
    setTimeout(() => fetchPlans(1), 100);
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
    
    // Construir nombre completo, manejando strings vacíos y null/undefined
    const firstName = creator.first_name?.trim() || '';
    const lastName = creator.last_name?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Usar email como fallback si no hay nombre
    const email = creator.email?.trim() || '';
    
    // Determinar qué mostrar como nombre principal
    let displayName = '';
    if (fullName) {
      displayName = fullName;
    } else if (email) {
      displayName = email;
    } else {
      displayName = `Usuario ${creator.id}`;
    }
    
    // Añadir información del rol si es relevante (no mostrar MEMBER por ser el rol por defecto)
    if (creator.gym_role && creator.gym_role !== 'MEMBER') {
      const roleTranslation = {
        'OWNER': '👑 Propietario',
        'ADMIN': '⚙️ Administrador', 
        'TRAINER': '💪 Entrenador'
      };
      const roleText = roleTranslation[creator.gym_role as keyof typeof roleTranslation] || creator.gym_role;
      return `${displayName} (${roleText})`;
    }
    
    return displayName;
  };

  return (
    <div className="space-y-6">
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

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar planes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por objetivo */}
          <div>
            <select
              value={filters.goal}
              onChange={(e) => setFilters({...filters, goal: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos los objetivos</option>
              <option value="bulk">Volumen</option>
              <option value="cut">Definición</option>
              <option value="maintain">Mantenimiento</option>
              <option value="performance">Rendimiento</option>
            </select>
          </div>

          {/* Filtro por dificultad */}
          <div>
            <select
              value={filters.difficulty_level}
              onChange={(e) => setFilters({...filters, difficulty_level: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todas las dificultades</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          {/* Filtro por presupuesto */}
          <div>
            <select
              value={filters.budget_level}
              onChange={(e) => setFilters({...filters, budget_level: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos los presupuestos</option>
              <option value="low">Bajo</option>
              <option value="medium">Medio</option>
              <option value="high">Alto</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-2">
            <button
              onClick={applyFilters}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Filter size={16} />
              <span>Filtrar</span>
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>
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
    </div>
  );
} 