'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
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
  User
} from 'lucide-react';

interface NutritionPlan {
  id: number;
  title: string;
  description: string;
  goal: string;
  difficulty_level: string;
  budget_level: string;
  dietary_restrictions: string;
  duration_days: number;
  is_recurring: boolean;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  is_public: boolean;
  tags: string[];
  creator_id: number;
  gym_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_followers: number | null;
  avg_satisfaction: number | null;
  creator?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    picture?: string;
    gym_role?: string;
  };
}

interface PlansResponse {
  plans: NutritionPlan[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function NutritionPlansPage() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
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
  const [userCache, setUserCache] = useState<{[key: number]: any}>({});

  // Función para obtener el gym ID seleccionado
  const getSelectedGymId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected_gym_id') || '1';
    }
    return '1';
  };

  // Función para obtener información de usuarios con cache
  const fetchUserInfo = async (userId: number) => {
    // Verificar cache primero
    if (userCache[userId]) {
      return userCache[userId];
    }

    const gymId = getSelectedGymId();
    console.log('Fetching user info for:', { userId, gymId });

    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        headers: {
          'X-Gym-ID': gymId,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        // Guardar en cache
        setUserCache(prev => ({
          ...prev,
          [userId]: userData
        }));
        return userData;
      } else {
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          userId,
          gymId
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
    return null;
  };

  // Función para cargar planes
  const fetchPlans = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString()
      });

      // Agregar filtros si están definidos
      if (searchQuery.trim()) params.append('search_query', searchQuery.trim());
      if (filters.goal) params.append('goal', filters.goal);
      if (filters.difficulty_level) params.append('difficulty_level', filters.difficulty_level);
      if (filters.budget_level) params.append('budget_level', filters.budget_level);
      if (filters.dietary_restrictions) params.append('dietary_restrictions', filters.dietary_restrictions);

      const response = await fetch(`/api/v1/nutrition/plans?${params.toString()}`, {
        headers: {
          'X-Gym-ID': getSelectedGymId(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: PlansResponse = await response.json();
      
      // Enriquecer planes con información del creador
      const enrichedPlans = await Promise.all(
        data.plans.map(async (plan) => {
          const creatorInfo = await fetchUserInfo(plan.creator_id);
          return {
            ...plan,
            creator: creatorInfo
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

  return (
    <MainLayout>
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

            {/* Botones */}
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
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-3 text-slate-600">Cargando planes...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <div className="text-center">
              <div className="text-red-500 mb-2">
                <FileText size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error al cargar planes</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={() => fetchPlans()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <div className="text-center">
              <div className="text-slate-400 mb-4">
                <Apple size={48} className="mx-auto" />
              </div>
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
          </div>
        ) : (
          <>
            {/* Lista de planes */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {pagination.total} plan{pagination.total !== 1 ? 'es' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
                  </h2>
                  <span className="text-sm text-slate-600">
                    Página {pagination.page} de {Math.ceil(pagination.total / pagination.per_page)}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {plans.map((plan) => (
                  <div key={plan.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <Apple size={20} className="text-green-600" />
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-slate-900">{plan.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGoalColor(plan.goal)}`}>
                                {plan.goal === 'bulk' ? 'Volumen' : 
                                 plan.goal === 'cut' ? 'Definición' : 
                                 plan.goal === 'maintain' ? 'Mantenimiento' : 
                                 plan.goal === 'performance' ? 'Rendimiento' : plan.goal}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty_level)}`}>
                                {plan.difficulty_level === 'beginner' ? 'Principiante' : 
                                 plan.difficulty_level === 'intermediate' ? 'Intermedio' : 
                                 plan.difficulty_level === 'advanced' ? 'Avanzado' : plan.difficulty_level}
                              </span>
                              {!plan.is_active && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                  Inactivo
                                </span>
                              )}
                            </div>
                            
                            <p className="text-slate-600">{plan.description}</p>
                            
                            {/* Información del creador */}
                            {plan.creator && (
                              <div className="flex items-center space-x-3 mt-3 p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  {plan.creator.picture ? (
                                    <img 
                                      src={plan.creator.picture} 
                                      alt={`${plan.creator.first_name} ${plan.creator.last_name}`}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                      <User size={14} className="text-white" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">
                                      Creado por {`${plan.creator.first_name} ${plan.creator.last_name}`.trim() || plan.creator.email}
                                    </p>
                                    {plan.creator.gym_role && (
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        plan.creator.gym_role === 'admin' ? 'bg-red-100 text-red-700' :
                                        plan.creator.gym_role === 'trainer' ? 'bg-green-100 text-green-700' :
                                        'bg-blue-100 text-blue-700'
                                      }`}>
                                        {plan.creator.gym_role === 'admin' ? 'Administrador' :
                                         plan.creator.gym_role === 'trainer' ? 'Entrenador' :
                                         plan.creator.gym_role}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Target size={14} />
                                <span>{plan.target_calories} kcal</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Clock size={14} />
                                <span>{plan.duration_days} días</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Users size={14} />
                                <span>{plan.total_followers || 0} seguidores</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <Calendar size={14} />
                                <span>{formatDate(plan.created_at)}</span>
                              </div>
                            </div>

                            {/* Macronutrientes */}
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-slate-600">
                                <strong>Proteína:</strong> {plan.target_protein_g}g
                              </span>
                              <span className="text-slate-600">
                                <strong>Carbohidratos:</strong> {plan.target_carbs_g}g
                              </span>
                              <span className="text-slate-600">
                                <strong>Grasas:</strong> {plan.target_fat_g}g
                              </span>
                            </div>

                            {/* Tags */}
                            {plan.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {plan.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
    </MainLayout>
  );
} 