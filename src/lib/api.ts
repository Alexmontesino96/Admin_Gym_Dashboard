// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gymapi-eh6m.onrender.com/api/v1';

// Interface para errores de API estructurados
export interface APIError extends Error {
  status: number;
  data?: any;
}

// Función helper para crear errores estructurados
export const createAPIError = (message: string, status: number, data?: any): APIError => {
  const error = new Error(message) as APIError;
  error.status = status;
  error.data = data;
  return error;
};

// Función helper para verificar si un error es de tipo APIError
export const isAPIError = (error: any): error is APIError => {
  return error && typeof error.status === 'number';
};

// Función helper para manejar errores comunes de gimnasios
export const handleGymAPIError = (error: unknown, operation: string = 'operación') => {
  if (!isAPIError(error)) {
    console.error(`Error desconocido en ${operation}:`, error);
    return { isHandled: false, message: `Error desconocido en ${operation}` };
  }

  switch (error.status) {
    case 400:
      if (error.data?.detail?.includes('ya pertenece al gimnasio')) {
        console.warn('Usuario ya pertenece al gimnasio:', error.data.detail);
        return { 
          isHandled: true, 
          message: 'El usuario ya pertenece a este gimnasio',
          type: 'USER_ALREADY_EXISTS'
        };
      }
      break;
    case 404:
      console.warn('Recurso no encontrado:', error.data?.detail || error.message);
      return { 
        isHandled: true, 
        message: 'Recurso no encontrado',
        type: 'NOT_FOUND'
      };
    case 403:
      console.warn('Sin permisos para esta operación:', error.data?.detail || error.message);
      return { 
        isHandled: true, 
        message: 'No tienes permisos para realizar esta operación',
        type: 'FORBIDDEN'
      };
    default:
      console.error(`Error ${error.status} en ${operation}:`, error.data?.detail || error.message);
      return { 
        isHandled: false, 
        message: error.data?.detail || error.message || `Error ${error.status}`,
        type: 'UNKNOWN'
      };
  }

  return { 
    isHandled: false, 
    message: error.data?.detail || error.message || 'Error desconocido',
    type: 'UNKNOWN'
  };
};

// Función para obtener el gym_id seleccionado
export const getSelectedGymId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedGymId');
  }
  return null;
};

// Función para establecer el gym_id seleccionado
export const setSelectedGymId = (gymId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedGymId', gymId);
    // También establecer como cookie para el middleware
    document.cookie = `selectedGymId=${gymId}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 días
  }
};

// Función para limpiar el gym_id seleccionado
export const clearSelectedGymId = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('selectedGymId');
    // También limpiar la cookie
    document.cookie = 'selectedGymId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

// Función para limpiar el cache de tokens
export const clearTokenCache = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('gym_access_token');
    sessionStorage.removeItem('gym_token_expiry');
    console.log('Cache de tokens limpiado');
  }
};

// Función para verificar si el token está próximo a expirar
export const isTokenExpiringSoon = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const tokenExpiry = sessionStorage.getItem('gym_token_expiry');
  if (!tokenExpiry) return true;
  
  // Considerar que expira pronto si queda menos de 5 minutos
  const timeUntilExpiry = parseInt(tokenExpiry) - Date.now();
  return timeUntilExpiry < 300000; // 5 minutos en milisegundos
};

// Función para forzar renovación de token
export const forceTokenRefresh = async (): Promise<void> => {
  clearTokenCache();
  await getAccessToken();
};

// Función para obtener el token de acceso
export const getAccessToken = async (): Promise<string> => {
  try {
    // Primero intentamos obtener el token desde el session storage
    const cachedToken = sessionStorage.getItem('gym_access_token');
    const tokenExpiry = sessionStorage.getItem('gym_token_expiry');
    
    // Verificar si el token está vigente (con margen de 2 minutos)
    if (cachedToken && tokenExpiry && Date.now() < (parseInt(tokenExpiry) - 120000)) {
      return cachedToken;
    }

    // Si no hay token cacheado o está por expirar, obtenemos uno nuevo
    console.log('Obteniendo nuevo token de acceso...');
    const response = await fetch('/api/token', {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Si el backend indica que necesitamos reautenticar
      if (errorText.includes('logout_required') || errorText.includes('login_required')) {
        const to = errorText.match(/login_url="([^"]+)"/)?.[1] || `/auth/login?returnTo=${encodeURIComponent(window.location.href)}`;
        console.warn('Token no disponible, redirigiendo a', to);
        if (typeof window !== 'undefined') {
          window.location.href = to;
        }
        throw new Error('Sesión expirada, redirigiendo...');
      }
      
      throw new Error(`Error ${response.status} obteniendo token de acceso: ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.accessToken) {
      throw new Error('No se recibió token de acceso válido');
    }
    
    // Cachear el token con su tiempo de expiración
    sessionStorage.setItem('gym_access_token', data.accessToken);
    // Establecer expiración con margen de seguridad (5 minutos antes)
    const expiryTime = Date.now() + (data.expiresIn - 300) * 1000;
    sessionStorage.setItem('gym_token_expiry', expiryTime.toString());
    
    console.log('Token de acceso renovado exitosamente');
    return data.accessToken;
  } catch (error) {
    console.error('Error obteniendo token:', error);
    
    // Si hay un error crítico, limpiar el cache
    clearTokenCache();
    
    throw error;
  }
};

// Función para hacer llamadas a la API con autenticación
export const apiCall = async (endpoint: string, options: RequestInit = {}, customGymId?: string, retryCount: number = 0): Promise<any> => {
  try {
    const accessToken = await getAccessToken();
    const gymId = customGymId || getSelectedGymId();
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Solo agregar X-Gym-ID si no es 'none' y existe un gymId
    if (gymId && gymId !== 'none') {
      headers['X-Gym-ID'] = gymId;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Manejo especial para 404 en special-days - devolver null sin error
      if (response.status === 404 && endpoint.includes('/schedule/special-days/date/')) {
        return null;
      }
      
      // Si es un error 401 (token expirado) y no hemos reintentado aún
      if (response.status === 401 && retryCount === 0) {
        console.log('Token expirado, intentando renovar...');
        
        // Limpiar cache de token
        clearTokenCache();
        
        // Reintentar la llamada una vez
        return await apiCall(endpoint, options, customGymId, retryCount + 1);
      }
      
      // Si sigue siendo 401 después del reintento o el backend indica "Expired token", forzar logout
      if (response.status === 401) {
        try {
          const data = JSON.parse(errorText);
          if (data.login_url) {
            if (typeof window !== 'undefined') window.location.href = data.login_url;
          } else {
            if (typeof window !== 'undefined') window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.href)}`;
          }
        } catch {
          if (typeof window !== 'undefined') window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.href)}`;
        }
      }
      
      // Crear un error estructurado con más información
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText };
      }
      
      // Asegurar que el mensaje sea siempre un string
      let errorMessage: string;
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (typeof errorData.detail === 'object' && errorData.detail !== null) {
        // Si detail es un objeto, intentar extraer un mensaje
        errorMessage = errorData.detail.message || errorData.detail.error || JSON.stringify(errorData.detail);
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else {
        errorMessage = errorText || `Error ${response.status}`;
      }
      
      throw createAPIError(errorMessage, response.status, errorData);
    }

    // Si la respuesta es 204 No Content, devolver objeto vacío
    if (response.status === 204) {
      return {};
    }

    return await response.json();
  } catch (error) {
    console.error('Error en API call:', error);
    
    // Si es un error 401 o token expirado después del reintento, redirigir a login
    if (error instanceof Error && (error.message.includes('Expired token') || error.message.includes('401'))) {
      // fallback redirect
      if (typeof window !== 'undefined') {
        window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.href)}`;
      }
    }
    
    throw error;
  }
};

// Tipos de datos de la API
export interface UserBasicInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserPublicProfile {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  picture?: string;
  role: 'MEMBER' | 'TRAINER' | 'ADMIN' | 'SUPER_ADMIN' | 'OWNER';
  bio?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GymParticipant {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  first_name?: string;
  last_name?: string;
  role: 'MEMBER' | 'TRAINER' | 'ADMIN' | 'SUPER_ADMIN' | 'OWNER';
  phone_number?: string;
  birth_date?: string;
  height?: number;
  weight?: number;
  bio?: string;
  goals?: string;
  health_conditions?: string;
  gym_role: 'MEMBER' | 'TRAINER' | 'ADMIN' | 'OWNER' | 'SUPER_ADMIN';
  qr_code?: string;
  created_at: string;
  updated_at: string;
  auth0_id: string;
  picture?: string;
}

export interface GymUserSummary {
  id: number;
  email: string;
  full_name: string;
  role: 'MEMBER' | 'TRAINER' | 'ADMIN' | 'OWNER';
  joined_at?: string;
  is_active?: boolean;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  bio?: string;
}

export interface MembershipStatus {
  user_id: number;
  gym_id: number;
  gym_name: string;
  is_active: boolean;
  membership_type: string;
  expires_at?: string;
  days_remaining?: number;
  plan_name?: string;
  can_access: boolean;
}

export interface MembershipSummary {
  total_members: number;
  active_members: number;
  expired_members: number;
  trial_members: number;
  paid_members: number;
  total_revenue: number;
  monthly_revenue: number;
}

export interface UserGymMembership {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_role_in_gym: 'MEMBER' | 'TRAINER' | 'ADMIN' | 'SUPER_ADMIN' | 'OWNER';
}

export interface GymWithStats {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members_count: number;
  trainers_count: number;
  admins_count: number;
  events_count: number;
  classes_count: number;
}

export interface GymUpdateData {
  name?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  is_active?: boolean;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'SCHEDULED';
  creator_id: number;
  created_at: string;
  updated_at: string;
  participants_count: number;
}

export interface EventUpdateData {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  max_participants?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'SCHEDULED';
}

export interface EventCreateData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  max_participants?: number;
  first_message_chat?: string;
}

// Interfaces para Planes Nutricionales
export interface NutritionPlan {
  // Campos originales
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
  total_followers?: number | null;
  avg_satisfaction?: number | null;
  daily_plans?: DailyPlan[];
  creator_name?: string | null;
  is_followed_by_user?: boolean | null;
  
  // ✨ NUEVOS campos híbridos
  plan_type: PlanType;
  live_start_date?: string; // ISO datetime
  live_end_date?: string;
  is_live_active: boolean;
  live_participants_count: number;
  original_live_plan_id?: number;
  archived_at?: string;
  original_participants_count?: number;
  
  // Campos calculados dinámicamente
  current_day?: number;
  status?: PlanStatus;
  days_until_start?: number;
  is_following?: boolean;
}

export interface DailyPlan {
  id?: number;
  day_number: number;
  planned_date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  notes: string;
  nutrition_plan_id: number;
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  meals?: Meal[];
}

export interface Meal {
  id?: number;
  meal_type: MealType;
  name: string; // Backend usa name, no meal_name
  description: string;
  preparation_time_minutes: number;
  cooking_instructions: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  image_url: string | null;
  video_url: string | null;
  order_in_day: number;
  daily_plan_id: number;
  ingredients?: MealIngredient[];
  user_completion?: any; // Información de completitud del usuario
  created_at?: string;
  updated_at?: string;
}

export interface MealIngredient {
  id?: number;
  name: string; // Backend usa name, no ingredient_name
  quantity: number;
  unit: string;
  alternatives?: string[];
  is_optional: boolean;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  meal_id?: number;
  created_at?: string;
}

export interface NutritionPlanCreateData {
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
}

export interface DailyPlanCreateData {
  day_number: number;
  planned_date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  notes: string;
  nutrition_plan_id: number;
}

export interface MealCreateData {
  meal_type: MealType;
  name: string;
  description: string;
  preparation_time_minutes: number;
  cooking_instructions: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  image_url: string | null;
  video_url: string | null;
  order_in_day: number;
  daily_plan_id: number;
}

export interface MealUpdateData {
  meal_type?: MealType;
  name?: string;
  description?: string;
  preparation_time_minutes?: number;
  cooking_instructions?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number | null;
  image_url?: string | null;
  video_url?: string | null;
  order_in_day?: number;
}

// ===== NUEVAS INTERFACES HÍBRIDAS =====
export interface NutritionPlanFilters {
  // Filtros existentes
  goal?: string;
  difficulty_level?: string;
  search_query?: string;
  page?: number;
  per_page?: number;
  budget_level?: string;
  dietary_restrictions?: string;
  
  // ✨ NUEVOS filtros híbridos
  plan_type?: PlanType;
  status?: PlanStatus;
  is_live_active?: boolean;
}

export interface TodayMealPlan {
  date: string;
  meals: any[];
  completion_percentage: number;
  
  // ✨ NUEVOS campos híbridos
  plan?: NutritionPlan;
  current_day: number;
  status: PlanStatus;
  days_until_start?: number;
}

export interface NutritionDashboardHybrid {
  // Planes categorizados por tipo
  template_plans: NutritionPlan[];
  live_plans: NutritionPlan[];
  available_plans: NutritionPlan[];
  
  // Plan actual del usuario
  today_plan?: TodayMealPlan;
  
  // Estadísticas
  completion_streak: number;
  weekly_progress: any[];
}

export interface PlanStatusInfo {
  plan_id: number;
  plan_type: PlanType;
  current_day: number;
  status: PlanStatus;
  days_until_start?: number;
  is_live_active: boolean;
  live_participants_count: number;
  is_following: boolean;
}

export interface LivePlanStatusUpdate {
  is_live_active: boolean;
  live_participants_count?: number;
}

export interface ArchivePlanRequest {
  create_template_version: boolean;
  template_title?: string;
}

// ===== INTERFACES DE MEMBRESÍA =====
export interface MembershipPlan {
  id: number;
  gym_id: number;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  billing_interval: string;
  duration_days: number;
  is_active: boolean;
  features: string;
  max_bookings_per_month: number;
  stripe_price_id: string;
  stripe_product_id: string;
  created_at: string;
  updated_at: string;
  price_amount: number;
  is_recurring: boolean;
}

export interface MembershipPlanList {
  plans: MembershipPlan[];
  total: number;
  gym_id: number;
  gym_name: string;
}

export interface MembershipPlanFilters {
  active_only?: boolean;
  skip?: number;
  limit?: number;
}

export interface MembershipPlanCreateData {
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  billing_interval: string;
  duration_days: number;
  is_active: boolean;
  features: string;
  max_bookings_per_month: number;
}

export interface MembershipPlanUpdateData {
  name?: string;
  description?: string;
  price_cents?: number;
  currency?: string;
  billing_interval?: string;
  duration_days?: number;
  is_active?: boolean;
  features?: string;
  max_bookings_per_month?: number;
}

// Interfaces para estadísticas de planes
export interface PlanUserDetail {
  user_id: number;
  user_gym_id: number;
  email: string;
  first_name: string;
  last_name: string;
  membership_type: string;
  expires_at: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  association_method: string;
}

export interface MembershipPlanStats {
  plan: {
    id: number;
    name: string;
    description: string;
    price_amount: number;
    currency: string;
    billing_interval: string;
    duration_days: number;
    is_active: boolean;
    created_at: string;
  };
  users_count: number;
  user_ids: number[];
  users_details: PlanUserDetail[];
  estimated_monthly_revenue: number;
}

export interface MembershipStatsResponse {
  summary: {
    total_users: number;
    active_users: number;
    expired_users: number;
    recent_users_30_days: number;
    expiring_soon_7_days: number;
    estimated_monthly_revenue: number;
    currency: string;
  };
  membership_types: {
    free: number;
    paid: number;
    trial: number;
  };
  plans_statistics: MembershipPlanStats[];
  analysis: {
    most_popular_plan: MembershipPlanStats;
    highest_revenue_plan: MembershipPlanStats;
    total_active_plans: number;
    total_inactive_plans: number;
  };
  generated_at: string;
}

// Interfaces para enlaces de pago administrativos
export interface AdminPaymentLinkRequest {
  user_id: number;
  plan_id: number;
  success_url?: string;
  cancel_url?: string;
  notes?: string;
  expires_in_hours?: number;
}

export interface AdminPaymentLinkResponse {
  checkout_url: string;
  session_id: string;
  plan_name: string;
  price_amount: number;
  currency: string;
  user_email: string;
  user_name: string;
  expires_at: string;
  notes?: string;
  created_by_admin: string;
}

export interface CreateNutritionPlanRequestHybrid {
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
  
  // ✨ NUEVOS campos híbridos opcionales
  plan_type?: PlanType;
  live_start_date?: string; // requerido si plan_type es 'live'
}

// Funciones específicas para endpoints de usuarios
export const getUsersAPI = {
  // Obtener participantes del gimnasio (ADMIN ONLY)
  getGymParticipants: async (params: {
    role?: 'MEMBER' | 'TRAINER';
    skip?: number;
    limit?: number;
  } = {}): Promise<GymParticipant[]> => {
    const searchParams = new URLSearchParams();
    
    if (params.role) searchParams.append('role', params.role);
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const endpoint = `/users/gym-participants${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Obtener perfil público de un usuario específico
  getPublicProfile: async (userId: number): Promise<UserPublicProfile> => {
    return apiCall(`/users/p/public-profile/${userId}`);
  },

  // Obtener usuarios del gimnasio (admin only)
  getGymUsers: async (params: {
    role?: 'MEMBER' | 'TRAINER' | 'ADMIN';
    skip?: number;
    limit?: number;
  } = {}): Promise<GymUserSummary[]> => {
    const searchParams = new URLSearchParams();
    
    if (params.role) searchParams.append('role', params.role);
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const endpoint = `/users/gym-users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Buscar usuario por email que NO pertenezca al gimnasio actual
  searchUserByEmail: async (email: string): Promise<UserBasicInfo> => {
    const searchParams = new URLSearchParams();
    searchParams.append('email', email);
    
    return apiCall(`/api/v1/users/search-by-email?${searchParams.toString()}`);
  },

  // Eliminar usuario del gimnasio actual
  removeUserFromCurrentGym: async (userId: number): Promise<{ message: string }> => {
    return apiCall(`/gyms/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Actualizar rol de usuario en el gimnasio (admin only)
  updateUserRole: async (userId: number, newRole: 'MEMBER' | 'TRAINER' | 'ADMIN' | 'OWNER'): Promise<UserPublicProfile> => {
    return apiCall(`/gyms/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole }),
    });
  },

  // Añadir usuario al gimnasio actual (admin only)
  addUserToCurrentGym: async (userId: number): Promise<{ message: string; user_id: number; gym_id: number; role: string }> => {
    try {
      return await apiCall(`/gyms/users/${userId}`, {
      method: 'POST',
    });
    } catch (error: unknown) {
      const errorInfo = handleGymAPIError(error, 'agregar usuario al gimnasio');
      
      // Si es el caso específico de usuario ya existente, devolver un objeto válido
      if (errorInfo.type === 'USER_ALREADY_EXISTS') {
        const selectedGymId = getSelectedGymId();
        return {
          message: errorInfo.message,
          user_id: userId,
          gym_id: selectedGymId ? parseInt(selectedGymId) : 1,
          role: 'MEMBER' // asumimos MEMBER por defecto
        };
      }
      
      // Re-lanzar el error si no es un caso que podemos manejar graciosamente
      throw error;
    }
  },

  // Obtener un participante del gimnasio actual por ID (admin only)
  getGymParticipantById: async (userId: number): Promise<GymParticipant> => {
    return apiCall(`/users/gym-participants/${userId}`)
  },

  // Obtener participantes públicos del gimnasio (accesible para todos)
  getGymPublicParticipants: async (params: {
    role?: 'MEMBER' | 'TRAINER';
    name_contains?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<UserPublicProfile[]> => {
    const searchParams = new URLSearchParams();
    if (params.role) searchParams.append('role', params.role);
    if (params.name_contains) searchParams.append('name_contains', params.name_contains);
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());

    const endpoint = `/users/p/gym-participants${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },
};

// Funciones específicas para endpoints de membresías
export const membershipsAPI = {
  // Obtener estado de membresía del usuario actual
  getMyMembershipStatus: async (): Promise<MembershipStatus> => {
    return apiCall('/memberships/my-status');
  },

  // Obtener estado de membresía de un usuario específico (admin only)
  getUserMembershipStatus: async (userId: number): Promise<MembershipStatus> => {
    return apiCall(`/memberships/user/${userId}/status`);
  },

  // Obtener resumen de membresías del gimnasio (admin only)
  getMembershipSummary: async (): Promise<MembershipSummary> => {
    return apiCall('/memberships/summary');
  },
};

// Funciones específicas para endpoints de dashboard
export const dashboardAPI = {
  // Obtener overview del dashboard
  getOverview: async (): Promise<any> => {
    return apiCall('/dashboard/overview');
  },
};

// Funciones específicas para endpoints de gimnasios
export const gymsAPI = {
  // Obtener todos los gimnasios del usuario autenticado
  getMyGyms: async (): Promise<UserGymMembership[]> => {
    // Para este endpoint no necesitamos X-Gym-ID ya que obtiene todos los gyms del usuario
    return apiCall('/gyms/my', {}, 'none');
  },

  // Obtener información detallada de un gimnasio específico
  getGymInfo: async (gymId?: number): Promise<GymWithStats> => {
    if (!gymId) {
      const selectedGymId = getSelectedGymId();
      if (!selectedGymId) {
        throw new Error('No hay gimnasio seleccionado');
      }
      gymId = parseInt(selectedGymId);
    }
    return apiCall(`/gyms/${gymId}`);
  },

  // Actualizar información de un gimnasio
  updateGymInfo: async (gymId: number, gymData: GymUpdateData): Promise<GymWithStats> => {
    return apiCall(`/gyms/${gymId}`, {
      method: 'PUT',
      body: JSON.stringify(gymData),
    });
  },
};

// Funciones específicas para endpoints de eventos
export const eventsAPI = {
  // Obtener lista de eventos con filtros opcionales
  getEvents: async (params: {
    status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'SCHEDULED';
    start_date?: string;
    end_date?: string;
    search?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<Event[]> => {
    const searchParams = new URLSearchParams();
    
    if (params.status) searchParams.append('status', params.status);
    if (params.start_date) searchParams.append('start_date', params.start_date);
    if (params.end_date) searchParams.append('end_date', params.end_date);
    if (params.search) searchParams.append('search', params.search);
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const endpoint = `/events/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Crear un nuevo evento
  createEvent: async (eventData: EventCreateData): Promise<Event> => {
    return apiCall('/events/', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Actualizar un evento existente
  updateEvent: async (eventId: number, eventData: EventUpdateData): Promise<Event> => {
    return apiCall(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  // Eliminar un evento existente
  deleteEvent: async (eventId: number): Promise<{ message: string }> => {
    return apiCall(`/events/${eventId}`, {
      method: 'DELETE',
    });
  },

  // Registro masivo de participantes en un evento
  bulkRegisterParticipants: async (eventId: number, userIds: number[]): Promise<any[]> => {
    return apiCall('/events/participation/bulk', {
      method: 'POST',
      body: JSON.stringify({
        event_id: eventId,
        user_ids: userIds,
      }),
    });
  },

  // Obtener participaciones de un evento
  getEventParticipations: async (eventId: number): Promise<any[]> => {
    return apiCall(`/events/participation/event/${eventId}`);
  },

  // Obtener o crear chat room de un evento
  getEventChatRoom: async (eventId: number): Promise<{
    id: number;
    name: string;
    is_direct: boolean;
    event_id: number;
    stream_channel_id: string;
    stream_channel_type: string;
    created_at: string;
  }> => {
    return apiCall(`/chat/rooms/event/${eventId}`);
  },

  // Obtener token de GetStream.io para el usuario actual
  getStreamToken: async (): Promise<{ token: string; internal_user_id: number; api_key: string }> => {
    return apiCall('/chat/token');
  },

  // Obtener categorías de clases personalizadas
  getCategories: async (activeOnly: boolean = true): Promise<any[]> => {
    const query = activeOnly ? '?active_only=true' : '';
    return apiCall(`/schedule/categories/categories${query}`);
  },

  // Crear una nueva categoría
  createCategory: async (categoryData: { name: string; description?: string; color?: string; icon?: string; is_active?: boolean; }): Promise<any> => {
    return apiCall('/schedule/categories/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  // Actualizar una categoría existente
  updateCategory: async (
    categoryId: number,
    categoryData: { name?: string; description?: string; color?: string; icon?: string; is_active?: boolean }
  ): Promise<any> => {
    return apiCall(`/schedule/categories/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  // Eliminar o desactivar una categoría existente
  deleteCategory: async (categoryId: number): Promise<{ message?: string }> => {
    return apiCall(`/schedule/categories/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  // Obtener catálogo de clases
  getClasses: async (activeOnly: boolean = true, params: { skip?: number; limit?: number } = {}): Promise<any[]> => {
    const searchParams = new URLSearchParams()
    if (activeOnly) searchParams.append('active_only', 'true')
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString())
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiCall(`/schedule/classes/classes${query}`)
  },

  // Crear nueva clase
  createClass: async (classData: {
    name: string
    description?: string
    duration: number
    max_capacity: number
    difficulty_level: 'beginner' | 'intermediate' | 'advanced'
    category_id?: number
    category_enum?: string
    is_active?: boolean
  }): Promise<any> => {
    return apiCall('/schedule/classes/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    })
  },

  // Actualizar clase existente
  updateClass: async (
    classId: number,
    classData: {
      name?: string
      description?: string
      duration?: number
      max_capacity?: number
      difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
      category_id?: number
      category_enum?: string
      is_active?: boolean
    }
  ): Promise<any> => {
    return apiCall(`/schedule/classes/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    })
  },

  // Eliminar o desactivar clase existente
  deleteClass: async (classId: number): Promise<any> => {
    return apiCall(`/schedule/classes/classes/${classId}`, {
      method: 'DELETE',
    })
  },

  // Obtener clases por categoría estándar
  getClassesByCategory: async (category: string, params: { skip?: number; limit?: number } = {}): Promise<any[]> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiCall(`/schedule/classes/classes/category/${category}${query}`);
  },

  // Obtener clases por dificultad
  getClassesByDifficulty: async (difficulty: 'beginner' | 'intermediate' | 'advanced', params: { skip?: number; limit?: number } = {}): Promise<any[]> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiCall(`/schedule/classes/classes/difficulty/${difficulty}${query}`);
  },

  // Obtener sesiones próximas
  getSessions: async (params: { skip?: number; limit?: number } = {}): Promise<any[]> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiCall(`/schedule/sessions/sessions${query}`);
  },

  // Crear sesión individual
  createSession: async (sessionData: {
    class_id: number;
    trainer_id: number;
    start_time: string;
    end_time?: string;
    room?: string;
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    override_capacity?: number;
  }): Promise<any> => {
    return apiCall('/schedule/sessions/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  // Actualizar sesión existente
  updateSession: async (
    sessionId: number,
    data: {
      class_id?: number;
      trainer_id?: number;
      start_time?: string;
      end_time?: string;
      room?: string;
      status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      notes?: string;
      override_capacity?: number;
    }
  ): Promise<any> => {
    return apiCall(`/schedule/sessions/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar o cancelar sesión existente
  deleteSession: async (sessionId: number): Promise<any> => {
    return apiCall(`/schedule/sessions/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  // Cancelar sesión (marca como CANCELLED)
  cancelSession: async (sessionId: number): Promise<any> => {
    return apiCall(`/schedule/sessions/sessions/${sessionId}/cancel`, {
      method: 'POST',
    });
  },

  // Obtener detalles completos de una sesión específica
  getSessionDetail: async (sessionId: number): Promise<any> => {
    return apiCall(`/schedule/sessions/sessions/${sessionId}`)
  },

  // Obtener sesiones dentro de un rango de fechas
  getSessionsByDateRange: async (
    startDate: string, // YYYY-MM-DD
    endDate: string,
    params: { skip?: number; limit?: number } = {}
  ): Promise<any[]> => {
    const searchParams = new URLSearchParams({ start_date: startDate, end_date: endDate });
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiCall(`/schedule/sessions/date-range${query}`);
  },

  // Obtener sesiones por rango de fechas con información de timezone
  getSessionsByDateRangeWithTimezone: async (
    startDate: string, // YYYY-MM-DD
    endDate: string,
    params: { skip?: number; limit?: number } = {}
  ): Promise<any[]> => {
    const searchParams = new URLSearchParams({ start_date: startDate, end_date: endDate });
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiCall(`/schedule/sessions/date-range-with-timezone${query}`);
  },

  // Obtener sesiones por entrenador
  getSessionsByTrainer: async (
    trainerId: number,
    params: { upcoming_only?: boolean; skip?: number; limit?: number } = {}
  ): Promise<any[]> => {
    const searchParams = new URLSearchParams()
    if (params.upcoming_only) searchParams.append('upcoming_only', 'true')
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString())
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString())
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiCall(`/schedule/sessions/trainer/${trainerId}${query}`)
  },

  // Obtener horarios regulares del gimnasio
  getGymHoursRegular: async (): Promise<any[]> => {
    return apiCall('/schedule/gym-hours/regular');
  },

  // Obtener horario regular de un día específico
  getGymHoursByDay: async (day: number): Promise<any> => {
    return apiCall(`/schedule/gym-hours/regular/${day}`)
  },

  // Actualizar horario regular de un día específico
  updateGymHoursByDay: async (day: number, data: {open_time?: string, close_time?: string, is_closed?: boolean}): Promise<any> => {
    return apiCall(`/schedule/gym-hours/regular/${day}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    })
  },

  // Obtener horario efectivo de una fecha específica (YYYY-MM-DD)
  getGymHoursByDate: async (isoDate: string): Promise<any> => {
    return apiCall(`/schedule/gym-hours/date/${isoDate}`)
  },

  // Aplicar plantilla a un rango de fechas
  applyGymHoursDefaults: async (
    start_date: string,
    end_date: string,
    overwrite_existing = false
  ): Promise<any[]> => {
    return apiCall('/schedule/gym-hours/apply-defaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_date, end_date, overwrite_existing })
    })
  },

  // Obtener horario efectivo para un rango de fechas
  getGymHoursDateRange: async (
    start_date: string,
    end_date: string
  ): Promise<any[]> => {
    return apiCall(`/schedule/gym-hours/date-range?start_date=${start_date}&end_date=${end_date}`)
  },

  // Obtener día especial por fecha
  getSpecialDayByDate: async (isoDate: string): Promise<any | null> => {
    return apiCall(`/schedule/special-days/date/${isoDate}`)
  },

  // Obtener lista de días especiales próximos
  getSpecialDays: async (params: {
    skip?: number;
    limit?: number;
    upcoming_only?: boolean;
  } = {}): Promise<any[]> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.upcoming_only !== undefined) searchParams.append('upcoming_only', params.upcoming_only.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiCall(`/schedule/special-days/${query}`);
  },
 
  // Crear día especial
  createSpecialDay: async (
    data: {
      date: string;
      open_time?: string;
      close_time?: string;
      is_closed?: boolean;
      description?: string;
    },
    overwrite = false
  ): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (overwrite) searchParams.append('overwrite', 'true');
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiCall(`/schedule/special-days/${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
};

// Funciones específicas para endpoints de nutrición
export const nutritionAPI = {
  // ===== ENDPOINTS HÍBRIDOS NUEVOS =====
  
  // Obtener dashboard híbrido categorizado
  getDashboardHybrid: async (): Promise<NutritionDashboardHybrid> => {
    return apiCall('/nutrition/dashboard');
  },

  // Obtener planes categorizados por tipos
  getPlansHybrid: async (params: Partial<NutritionPlanFilters> = {}): Promise<{
    plans: NutritionPlan[];
    total: number;
    page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  }> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    // Ahora usa el mismo endpoint que getPlans ya que el backend fusionó ambos endpoints
    const endpoint = `/nutrition/plans${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Obtener estado de un plan en tiempo real
  getPlanStatus: async (planId: number): Promise<PlanStatusInfo> => {
    return apiCall(`/nutrition/plans/${planId}/status`);
  },

  // Actualizar estado de plan live (solo creadores)
  updateLiveStatus: async (planId: number, update: LivePlanStatusUpdate): Promise<PlanStatusInfo> => {
    return apiCall(`/nutrition/plans/${planId}/live-status`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  },

  // Archivar plan live terminado
  archivePlan: async (planId: number, request: ArchivePlanRequest): Promise<{ message: string; template_plan_id?: number }> => {
    return apiCall(`/nutrition/plans/${planId}/archive`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Obtener plan de hoy extendido
  getTodayPlan: async (): Promise<TodayMealPlan | null> => {
    return apiCall('/nutrition/today');
  },

  // ===== ENDPOINTS MEJORADOS (BACKWARD COMPATIBLE) =====

  // Obtener lista de planes nutricionales con filtros híbridos opcionales
  getPlans: async (params: Partial<NutritionPlanFilters> = {}): Promise<{
    plans: NutritionPlan[];
    total: number;
    page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  }> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const endpoint = `/nutrition/plans${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Obtener un plan nutricional específico
  getPlan: async (planId: number): Promise<NutritionPlan> => {
    return apiCall(`/nutrition/plans/${planId}`);
  },

  // Crear un nuevo plan nutricional (mejorado con soporte híbrido)
  createPlan: async (planData: NutritionPlanCreateData | CreateNutritionPlanRequestHybrid): Promise<NutritionPlan> => {
    return apiCall('/nutrition/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  // Actualizar un plan nutricional existente
  updatePlan: async (planId: number, planData: Partial<NutritionPlanCreateData>): Promise<NutritionPlan> => {
    return apiCall(`/nutrition/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  },

  // Eliminar un plan nutricional
  deletePlan: async (planId: number): Promise<{ message: string }> => {
    return apiCall(`/nutrition/plans/${planId}`, {
      method: 'DELETE',
    });
  },

  // Obtener días de un plan nutricional
  getPlanDays: async (planId: number, params: {
    skip?: number;
    limit?: number;
  } = {}): Promise<DailyPlan[]> => {
    const searchParams = new URLSearchParams();
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const endpoint = `/nutrition/plans/${planId}/days${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Crear un día en un plan nutricional
  createPlanDay: async (planId: number, dayData: DailyPlanCreateData): Promise<DailyPlan> => {
    return apiCall(`/nutrition/plans/${planId}/days`, {
      method: 'POST',
      body: JSON.stringify(dayData),
    });
  },

  // Obtener un día específico de un plan
  getPlanDay: async (planId: number, dayId: number): Promise<DailyPlan> => {
    return apiCall(`/nutrition/plans/${planId}/days/${dayId}`);
  },

  // Actualizar un día específico de un plan
  updatePlanDay: async (planId: number, dayId: number, dayData: Partial<DailyPlanCreateData>): Promise<DailyPlan> => {
    return apiCall(`/nutrition/plans/${planId}/days/${dayId}`, {
      method: 'PUT',
      body: JSON.stringify(dayData),
    });
  },

  // Eliminar un día específico de un plan
  deletePlanDay: async (planId: number, dayId: number): Promise<{ message: string }> => {
    return apiCall(`/nutrition/plans/${planId}/days/${dayId}`, {
      method: 'DELETE',
    });
  },

  // ===== ENDPOINTS DE COMIDAS (CORREGIDOS SEGÚN BACKEND) =====
  
  // Obtener un día específico con sus comidas incluidas
  getDailyPlan: async (dailyPlanId: number): Promise<DailyPlan> => {
    return apiCall(`/nutrition/daily-plans/${dailyPlanId}`);
  },

  // Crear una comida en un día específico (usando endpoint correcto del backend)
  createMeal: async (dailyPlanId: number, mealData: MealCreateData): Promise<Meal> => {
    return apiCall(`/nutrition/daily-plans/${dailyPlanId}/meals`, {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  },

  // Obtener una comida específica
  getMeal: async (mealId: number): Promise<Meal> => {
    return apiCall(`/nutrition/meals/${mealId}`);
  },

  // Actualizar una comida específica
  updateMeal: async (mealId: number, mealData: MealUpdateData): Promise<Meal> => {
    return apiCall(`/nutrition/meals/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(mealData),
    });
  },

  // Eliminar una comida específica
  deleteMeal: async (mealId: number): Promise<{ message: string }> => {
    return apiCall(`/nutrition/meals/${mealId}`, {
      method: 'DELETE',
    });
  },

  // Marcar comida como completada
  completeMeal: async (mealId: number, notes?: string): Promise<{ message: string }> => {
    return apiCall(`/nutrition/meals/${mealId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  // Desmarcar comida como completada
  incompleteMeal: async (mealId: number): Promise<{ message: string }> => {
    return apiCall(`/nutrition/meals/${mealId}/complete`, {
      method: 'DELETE',
    });
  },

  // ===== ENDPOINTS DE ENUMS =====
  
  // Obtener tipos de planes disponibles
  getPlanTypes: async (): Promise<EnumOption[]> => {
    return apiCall('/nutrition/enums/plan-types');
  },

  // Obtener estados de planes disponibles
  getPlanStatuses: async (): Promise<EnumOption[]> => {
    return apiCall('/nutrition/enums/plan-statuses');
  },

  // Obtener objetivos nutricionales disponibles
  getNutritionGoals: async (): Promise<EnumOption[]> => {
    return apiCall('/nutrition/enums/goals');
  },

  // Obtener niveles de dificultad disponibles
  getDifficultyLevels: async (): Promise<EnumOption[]> => {
    return apiCall('/nutrition/enums/difficulties');
  },

  // Obtener niveles de presupuesto disponibles
  getBudgetLevels: async (): Promise<EnumOption[]> => {
    return apiCall('/nutrition/enums/budgets');
  },
};

// Funciones específicas para endpoints de membresía
export const membershipAPI = {
  // Obtener planes de membresía
  getPlans: async (params: Partial<MembershipPlanFilters> = {}): Promise<MembershipPlanList> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    
    const endpoint = `/memberships/plans${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Obtener un plan específico
  getPlan: async (planId: number): Promise<MembershipPlan> => {
    return apiCall(`/memberships/plans/${planId}`);
  },

  // Crear un nuevo plan de membresía
  createPlan: async (planData: MembershipPlanCreateData): Promise<MembershipPlan> => {
    return apiCall('/memberships/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  // Actualizar un plan existente
  updatePlan: async (planId: number, planData: MembershipPlanUpdateData): Promise<MembershipPlan> => {
    return apiCall(`/memberships/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  },

  // Eliminar un plan
  deletePlan: async (planId: number): Promise<void> => {
    return apiCall(`/memberships/plans/${planId}`, {
      method: 'DELETE',
    });
  },

  // Obtener estadísticas de planes
  getPlansStats: async (): Promise<MembershipStatsResponse> => {
    return apiCall('/memberships/plans-stats');
  },

  // Crear enlace de pago administrativo
  createPaymentLink: async (paymentData: AdminPaymentLinkRequest): Promise<AdminPaymentLinkResponse> => {
    return apiCall('/memberships/admin/create-payment-link', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
};

// ===== CONSTANTES API ENDPOINTS =====
export const NUTRITION_ENDPOINTS = {
  // Endpoints existentes (ahora con soporte híbrido)
  PLANS: '/nutrition/plans',
  PLAN_DETAIL: (id: number) => `/nutrition/plans/${id}`,
  TODAY: '/nutrition/today',
  DASHBOARD: '/nutrition/dashboard',
  
  // Nuevos endpoints híbridos específicos
  PLAN_STATUS: (id: number) => `/nutrition/plans/${id}/status`,
  LIVE_STATUS: (id: number) => `/nutrition/plans/${id}/live-status`,
  ARCHIVE: (id: number) => `/nutrition/plans/${id}/archive`,
  
  // Endpoints de comidas
  DAILY_PLAN: (dayId: number) => `/nutrition/daily-plans/${dayId}`,
  MEAL_DETAIL: (mealId: number) => `/nutrition/meals/${mealId}`,
  MEAL_COMPLETE: (mealId: number) => `/nutrition/meals/${mealId}/complete`,
  
  // Enums
  PLAN_TYPES: '/nutrition/enums/plan-types',
  PLAN_STATUSES: '/nutrition/enums/plan-statuses',
  GOALS: '/nutrition/enums/goals',
  DIFFICULTIES: '/nutrition/enums/difficulties',
  BUDGETS: '/nutrition/enums/budgets'
} as const;

// ===== HELPER FUNCTIONS ADICIONALES =====
export const buildPlanFilters = (filters: Partial<NutritionPlanFilters>): URLSearchParams => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return params;
};

// ===== ENUMS HÍBRIDOS =====
export enum PlanType {
  TEMPLATE = 'template',
  LIVE = 'live',
  ARCHIVED = 'archived'
}

export enum PlanStatus {
  NOT_STARTED = 'not_started',
  RUNNING = 'running',
  FINISHED = 'finished',
  ARCHIVED = 'archived'
}

export enum NutritionGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  MAINTENANCE = 'maintenance',
  HEALTHY_EATING = 'healthy_eating'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum Budget {
  ECONOMIC = 'economic',
  MEDIUM = 'medium',
  PREMIUM = 'premium'
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  PRE_WORKOUT = 'pre_workout',
  POST_WORKOUT = 'post_workout'
}

// ===== INTERFACES BASE =====
export interface BaseModel {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface EnumOption {
  value: string;
  label: string;
}

// ===== HELPER TYPES =====
export interface PlanTypeConfig {
  icon: string;
  color: string;
  label: string;
  description: string;
}

export interface PlanStatusConfig {
  icon: string;
  color: string;
  label: string;
  description: string;
}

export const PLAN_TYPE_CONFIG: Record<PlanType, PlanTypeConfig> = {
  [PlanType.TEMPLATE]: {
    icon: '📋',
    color: 'blue',
    label: 'Template',
    description: 'Empieza cuando quieras'
  },
  [PlanType.LIVE]: {
    icon: '🔴',
    color: 'red',
    label: 'Live',
    description: 'Sincronizado con otros usuarios'
  },
  [PlanType.ARCHIVED]: {
    icon: '📦',
    color: 'purple',
    label: 'Archived',
    description: 'Plan exitoso archivado'
  }
};

export const PLAN_STATUS_CONFIG: Record<PlanStatus, PlanStatusConfig> = {
  [PlanStatus.NOT_STARTED]: {
    icon: '⏰',
    color: 'gray',
    label: 'Próximamente',
    description: 'Aún no ha comenzado'
  },
  [PlanStatus.RUNNING]: {
    icon: '▶️',
    color: 'green',
    label: 'Activo',
    description: 'En progreso'
  },
  [PlanStatus.FINISHED]: {
    icon: '✅',
    color: 'blue',
    label: 'Terminado',
    description: 'Completado'
  },
  [PlanStatus.ARCHIVED]: {
    icon: '📦',
    color: 'purple',
    label: 'Archivado',
    description: 'Guardado como template'
  }
};

// ===== HELPER FUNCTIONS =====
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getDaysUntilStart = (startDate: string): number => {
  const today = new Date();
  const start = new Date(startDate);
  const diffTime = start.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isPlanActive = (plan: NutritionPlan): boolean => {
  return plan.status === PlanStatus.RUNNING;
};

export const isPlanStartingSoon = (plan: NutritionPlan): boolean => {
  return plan.status === PlanStatus.NOT_STARTED && 
         plan.days_until_start !== undefined && 
         plan.days_until_start <= 3;
};

export const getPlanTypeConfig = (planType: PlanType): PlanTypeConfig => {
  return PLAN_TYPE_CONFIG[planType];
};

export const getPlanStatusConfig = (status: PlanStatus): PlanStatusConfig => {
  return PLAN_STATUS_CONFIG[status];
};

// ===== HELPERS PARA COMIDAS =====

export const getMealTypeOptions = (): EnumOption[] => [
  { value: MealType.BREAKFAST, label: 'Desayuno' },
  { value: MealType.LUNCH, label: 'Almuerzo' },
  { value: MealType.DINNER, label: 'Cena' },
  { value: MealType.SNACK, label: 'Merienda' },
  { value: MealType.PRE_WORKOUT, label: 'Pre-entreno' },
  { value: MealType.POST_WORKOUT, label: 'Post-entreno' },
];

export const getMealTypeLabel = (mealType: MealType): string => {
  const option = getMealTypeOptions().find(opt => opt.value === mealType);
  return option?.label || mealType;
};

export const getMealTypeIcon = (mealType: MealType): string => {
  const icons = {
    [MealType.BREAKFAST]: '🌅',
    [MealType.LUNCH]: '☀️',
    [MealType.DINNER]: '🌙',
    [MealType.SNACK]: '🍎',
    [MealType.PRE_WORKOUT]: '⚡',
    [MealType.POST_WORKOUT]: '💪',
  };
  return icons[mealType] || '🍽️';
};