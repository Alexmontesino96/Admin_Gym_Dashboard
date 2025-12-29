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

// ===== WORKSPACE TYPES (GYM VS TRAINER) =====
export enum WorkspaceType {
  GYM = 'gym',
  PERSONAL_TRAINER = 'personal_trainer'
}

export interface TrainerCertification {
  name: string;
  year: number;
  institution: string;
}

export interface WorkspaceContext {
  workspace: {
    id: number;
    name: string;
    type: 'gym' | 'personal_trainer';
    is_personal_trainer: boolean;
    display_name: string;
    entity_label: string;
    timezone: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    max_clients: number | null;
    specialties: string[] | null;
  };
  terminology: {
    gym: string;
    gym_plural: string;
    member: string;
    members: string;
    trainer: string;
    trainers: string;
    class: string;
    classes: string;
    schedule: string;
    membership: string;
    memberships: string;
    equipment: string;
    event: string;
    events: string;
    owner: string;
    admin: string;
    dashboard: string;
  };
  features: {
    chat: boolean;
    notifications: boolean;
    profile: boolean;
    health_tracking: boolean;
    nutrition: boolean;
    surveys: boolean;
    payments: boolean;
    show_multiple_trainers: boolean;
    show_equipment_management: boolean;
    show_class_schedule: boolean;
    show_gym_hours: boolean;
    show_appointments: boolean;
    show_client_progress: boolean;
    show_session_packages: boolean;
    simplified_billing: boolean;
    show_staff_management: boolean;
    max_clients_limit: boolean;
    personal_branding: boolean;
    quick_client_add: boolean;
    session_tracking: boolean;
    client_notes: boolean;
    event_management: boolean;
    capacity_management: boolean;
    equipment_booking: boolean;
  };
  navigation: Array<{
    id: string;
    label: string;
    icon: string;
    path: string;
  }>;
  quick_actions: Array<{
    id: string;
    label: string;
    icon: string;
    color: string;
    action: string;
  }>;
  branding: {
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    app_title: string;
    app_subtitle: string;
    theme: string;
    show_logo: boolean;
    compact_mode: boolean;
  };
  user_context: {
    id: number;
    email: string;
    name: string;
    photo_url: string | null;
    role: string;
    role_label: string;
    permissions: string[];
  };
  api_version: string;
  environment: string;
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
  // Campos de workspace type
  type?: WorkspaceType;
  trainer_specialties?: string[];
  trainer_certifications?: TrainerCertification[];
  max_clients?: number;
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
  // Campos de workspace type
  type: WorkspaceType;
  trainer_specialties?: string[];
  trainer_certifications?: TrainerCertification[];
  max_clients?: number;
  active_clients_count?: number;
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

// ===== ENUMS PARA SISTEMA DE PAGOS DE EVENTOS =====
export enum RefundPolicyType {
  NO_REFUND = 'NO_REFUND',
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  CREDIT = 'CREDIT'
}

export enum PaymentStatusType {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  CREDITED = 'CREDITED',
  EXPIRED = 'EXPIRED'
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
  // Campos de monetización
  is_paid: boolean;
  price_cents?: number;
  currency?: string;
  refund_policy?: RefundPolicyType;
  refund_deadline_hours?: number;
  partial_refund_percentage?: number;
  stripe_product_id?: string;
  stripe_price_id?: string;
}

export interface EventUpdateData {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  max_participants?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'SCHEDULED';
  // Campos de pago
  is_paid?: boolean;
  price_cents?: number;
  currency?: string;
  refund_policy?: RefundPolicyType;
  refund_deadline_hours?: number;
  partial_refund_percentage?: number;
}

export interface EventCreateData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  max_participants?: number;
  first_message_chat?: string;
  // Campos de pago
  is_paid?: boolean;
  price_cents?: number;
  currency?: string;
  refund_policy?: RefundPolicyType;
  refund_deadline_hours?: number;
  partial_refund_percentage?: number;
}

// ===== INTERFACES PARA SISTEMA DE PAGOS DE EVENTOS =====
export interface EventParticipation {
  id: number;
  event_id: number;
  member_id: number;
  status: 'REGISTERED' | 'WAITING_LIST' | 'CANCELLED';
  payment_status?: PaymentStatusType;
  payment_required: boolean;
  payment_client_secret?: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_deadline?: string;
  amount_paid_cents?: number;
  registered_at: string;
  cancelled_at?: string;
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  payment_deadline?: string;
}

export interface RefundRequest {
  reason?: string;
}

export interface AdminPaymentLinkRequest {
  user_id: number;
  notes?: string;
}

export interface EventPaymentStats {
  total_revenue_cents: number;
  paid_participants: number;
  pending_participants: number;
  refunded_amount_cents: number;
  conversion_rate: number;
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

// ===== INTERFACES PARA GENERACIÓN DE INGREDIENTES CON IA =====

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'keto'
  | 'paleo'
  | 'low_carb'
  | 'high_protein'
  | 'halal'
  | 'kosher';

export type AIDifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface AIIngredientGenerationRequest {
  recipe_name: string;  // Obligatorio: min 3, max 200 caracteres
  servings?: number;    // Opcional: default 4, min 1, max 20
  dietary_restrictions?: DietaryRestriction[];  // Opcional
  cuisine_type?: string;  // Opcional: tipo de cocina (ej: española, italiana)
  target_calories?: number;  // Opcional: min 100, max 2000
  notes?: string;  // Opcional: notas adicionales, max 500 caracteres
}

export interface AIGeneratedIngredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  calories_per_unit: number;
  protein_g_per_unit: number;
  carbs_g_per_unit: number;
  fat_g_per_unit: number;
  fiber_g_per_unit: number;
  notes: string;
  order: number;
}

export interface AIIngredientGenerationResponse {
  status: 'success';
  message: string;
  data: {
    meal_id: number;
    ingredients: AIGeneratedIngredient[];
    recipe_instructions: string;
    total_nutrition: {
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      fiber_g: number;
    };
    estimated_prep_time: number;
    difficulty_level: AIDifficultyLevel;
    ai_confidence_score: number;
    generated_at: string;
  };
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

// ===== TIPOS CATEGORIZADOS (Backend Nuevo) =====

export interface CategorizedPlansResponse {
  live_plans: NutritionPlan[];
  template_plans: NutritionPlan[];
  archived_plans: NutritionPlan[];
  my_active_plans: NutritionPlan[];  // Planes que usuarios siguen (info para admin)
  total: number;
}

// ===== TIPOS DE ANALYTICS =====

export interface PlanAnalytics {
  plan_id: number;
  plan_title: string;
  // Seguidores
  followers: {
    total: number;
    active: number;
    completed: number;
    abandoned: number;
    retention_rate: number;
  };
  // Engagement
  engagement: {
    avg_completion_rate: number;
    avg_days_followed: number;
    avg_satisfaction: number;
    photos_shared: number;
    comments_count: number;
  };
  // Performance de comidas
  meal_performance: MealPerformance[];
  // Performance diaria
  daily_performance: DayPerformance[];
  // Feedback
  user_feedback: {
    positive_keywords: string[];
    negative_keywords: string[];
    improvement_suggestions: string[];
  };
  // Costo (si aplica)
  financial?: {
    avg_daily_cost: number;
    cost_perception: string;
    ingredient_availability: number;
  };
}

export interface MealPerformance {
  meal_id: number;
  meal_name: string;
  meal_type: MealType;
  completion_rate: number;
  avg_satisfaction: number;
  skip_rate: number;
  favorite_count: number;
}

export interface DayPerformance {
  day_number: number;
  completion_rate: number;
  dropout_rate: number;
}

// ===== TIPOS DE SEGUIDORES (para vista admin) =====

export interface PlanFollowersResponse {
  plan_id: number;
  total_followers: number;
  followers: FollowerInfo[];
  pagination: {
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface FollowerInfo {
  user_id: number;
  user_name: string;
  user_photo?: string;
  started_at: string;
  current_day: number;
  completion_percentage: number;
  status: 'running' | 'completed' | 'abandoned' | 'paused';
  last_activity?: string;
}

// ===== TIPOS DE IA AVANZADA =====

export interface AIFullPlanRequest {
  title: string;
  description?: string;
  goal: string;                      // 'bulk' | 'cut' | 'maintain' | 'performance'
  target_calories: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fat_g?: number;
  duration_days: number;
  difficulty_level?: string;         // 'beginner' | 'intermediate' | 'advanced'
  budget_level?: string;             // 'economic' | 'medium' | 'premium'
  dietary_restrictions?: string[];   // ['vegetarian', 'gluten_free', etc.]
  meals_per_day?: number;            // 3-6
  cuisine_preferences?: string[];
  excluded_ingredients?: string[];
  language?: string;                 // 'es' | 'en'
}

export interface AIFullPlanResponse {
  success: boolean;
  plan: GeneratedPlanContent;
  ai_metadata: AIMetadata;
}

export interface GeneratedPlanContent {
  title: string;
  description: string;
  daily_plans: GeneratedDay[];
  total_avg_calories: number;
  shopping_list?: ShoppingListItem[];
}

export interface GeneratedDay {
  day_number: number;
  day_name?: string;
  meals: GeneratedMeal[];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  notes?: string;
}

export interface GeneratedMeal {
  name: string;
  meal_type: MealType;
  description?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  preparation_time_minutes: number;
  cooking_instructions: string;
  ingredients: AIGeneratedIngredient[];
}

export interface ShoppingListItem {
  name: string;
  total_quantity: number;
  unit: string;
  category: string;  // 'proteins', 'vegetables', 'dairy', etc.
}

export interface AIMetadata {
  model: string;
  cost_usd: number;
  generation_time_ms: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

// ===== TIPOS DE ANÁLISIS DE IMAGEN =====

export interface MealImageAnalysisRequest {
  image_base64: string;
  context?: string;  // Ej: "Almuerzo en restaurante italiano"
}

export interface MealImageAnalysisResponse {
  meal_name: string;
  estimated_calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients_detected: DetectedIngredient[];
  confidence_score: number;  // 0-1
  nutritional_warnings: string[];
  ai_metadata: AIMetadata;
}

export interface DetectedIngredient {
  name: string;
  estimated_quantity: string;  // "200g", "1 taza", etc.
  confidence: number;
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
    
    return apiCall(`/users/search-by-email?${searchParams.toString()}`);
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

  // Obtener contexto del workspace (tipo, terminología, features)
  getWorkspaceContext: async (): Promise<WorkspaceContext> => {
    return apiCall('/context/workspace');
  },

  // Obtener estadísticas del dashboard de usuario
  getStats: async (): Promise<any> => {
    return apiCall('/user-dashboard/stats');
  },

  // Obtener estadísticas de membresías
  getMembershipStats: async (): Promise<any> => {
    return apiCall('/memberships/stats');
  },

  // Obtener actividad en tiempo real
  getRealtimeActivity: async (): Promise<any> => {
    return apiCall('/activity-feed/realtime');
  },

  // Obtener resumen de asistencia
  getAttendanceSummary: async (params?: { start_date?: string; end_date?: string }): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);

    const endpoint = `/schedule/participation/attendance-summary${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  // Obtener insights de actividad
  getInsights: async (): Promise<any> => {
    return apiCall('/activity-feed/insights');
  },

  // Obtener estadísticas de posts
  getPostsStats: async (): Promise<any> => {
    return apiCall('/posts/stats');
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

  // ===== ENDPOINTS DE PAGOS DE EVENTOS =====

  // USUARIO: Crear Payment Intent para una participación
  createPaymentIntent: async (participationId: number): Promise<PaymentIntentResponse> => {
    return apiCall(`/events/participation/${participationId}/payment-intent`, {
      method: 'POST',
    });
  },

  // USUARIO: Confirmar pago después de Stripe
  confirmPayment: async (participationId: number, paymentIntentId: string): Promise<EventParticipation> => {
    return apiCall(`/events/participation/${participationId}/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    });
  },

  // USUARIO: Cancelar participación con reembolso
  cancelParticipationWithRefund: async (eventId: number): Promise<{ message: string; refund_amount?: number }> => {
    return apiCall(`/events/participation/${eventId}`, {
      method: 'DELETE',
    });
  },

  // ADMIN: Obtener todos los eventos de pago
  getPaymentEvents: async (onlyActive?: boolean): Promise<Event[]> => {
    const searchParams = new URLSearchParams();
    if (onlyActive) searchParams.append('only_active', 'true');
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiCall(`/events/admin/payments/events${query}`);
  },

  // ADMIN: Obtener pagos de un evento específico
  getEventPayments: async (eventId: number, paymentStatus?: PaymentStatusType): Promise<EventParticipation[]> => {
    const searchParams = new URLSearchParams();
    if (paymentStatus) searchParams.append('payment_status', paymentStatus);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiCall(`/events/admin/events/${eventId}/payments${query}`);
  },

  // ADMIN: Procesar reembolso manual
  processRefund: async (participationId: number, reason?: string): Promise<EventParticipation> => {
    return apiCall(`/events/admin/participation/${participationId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // ADMIN: Actualizar estado de pago manualmente
  updatePaymentStatus: async (participationId: number, newStatus: PaymentStatusType): Promise<EventParticipation> => {
    return apiCall(`/events/admin/participation/${participationId}/payment-status`, {
      method: 'PUT',
      body: JSON.stringify({ new_status: newStatus }),
    });
  },

  // ADMIN: Obtener estadísticas de pagos de un evento
  getEventPaymentStats: async (eventId: number): Promise<EventPaymentStats> => {
    return apiCall(`/events/admin/events/${eventId}/payment-stats`);
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
    return apiCall(`/nutrition/days/${dailyPlanId}`);
  },

  // Actualizar un día del plan (nombre, descripción)
  updateDailyPlan: async (dailyPlanId: number, data: { day_name?: string; description?: string }): Promise<DailyPlan> => {
    return apiCall(`/nutrition/days/${dailyPlanId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar un día del plan (cascada a comidas e ingredientes, renumera días posteriores)
  deleteDailyPlan: async (dailyPlanId: number): Promise<void> => {
    return apiCall(`/nutrition/days/${dailyPlanId}`, {
      method: 'DELETE',
    });
  },

  // Crear una comida en un día específico (usando endpoint correcto del backend)
  createMeal: async (dailyPlanId: number, mealData: MealCreateData): Promise<Meal> => {
    return apiCall(`/nutrition/days/${dailyPlanId}/meals`, {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  },

  // ===== CRUD DE COMIDAS (NUEVOS ENDPOINTS - Diciembre 2024) =====

  // Obtener una comida específica con todos sus ingredientes
  getMeal: async (mealId: number): Promise<Meal> => {
    return apiCall(`/nutrition/meals/${mealId}`);
  },

  // Actualizar una comida existente
  updateMeal: async (mealId: number, mealData: MealUpdateData): Promise<Meal> => {
    return apiCall(`/nutrition/meals/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(mealData),
    });
  },

  // Eliminar una comida (cascada a ingredientes y registros de completado)
  deleteMeal: async (mealId: number): Promise<void> => {
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

  // ===== ENDPOINTS DE INGREDIENTES CON IA =====

  // Generar ingredientes con IA para una comida
  generateIngredientsWithAI: async (
    mealId: number,
    options: AIIngredientGenerationRequest
  ): Promise<AIIngredientGenerationResponse> => {
    return apiCall(`/nutrition/meals/${mealId}/ingredients/ai-generate`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  // Aplicar ingredientes generados por IA a una comida
  applyAIIngredients: async (
    mealId: number,
    data: { ingredients: any[]; recipe?: string }
  ): Promise<{ message: string }> => {
    return apiCall(`/nutrition/meals/${mealId}/ingredients/ai-apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Agregar ingrediente manualmente a una comida
  addIngredient: async (
    mealId: number,
    ingredient: Omit<MealIngredient, 'id' | 'meal_id' | 'created_at'>
  ): Promise<MealIngredient> => {
    return apiCall(`/nutrition/meals/${mealId}/ingredients`, {
      method: 'POST',
      body: JSON.stringify(ingredient),
    });
  },

  // Actualizar un ingrediente específico
  updateIngredient: async (
    ingredientId: number,
    data: {
      name?: string;
      quantity?: number;
      unit?: string;
      calories?: number;
      proteins?: number;
      carbs?: number;
      fats?: number;
    }
  ): Promise<MealIngredient> => {
    return apiCall(`/nutrition/ingredients/${ingredientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar un ingrediente específico
  deleteIngredient: async (ingredientId: number): Promise<{ message: string }> => {
    return apiCall(`/nutrition/ingredients/${ingredientId}`, {
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

  // ===== PLANES CATEGORIZADOS (Backend Nuevo) =====

  // Obtener planes organizados por categoría
  getCategorizedPlans: async (): Promise<CategorizedPlansResponse> => {
    return apiCall('/nutrition/plans/categorized');
  },

  // ===== ANALYTICS DE PLANES =====

  // Obtener analytics completos de un plan
  getPlanAnalytics: async (planId: number): Promise<PlanAnalytics> => {
    return apiCall(`/nutrition/plans/${planId}/analytics`);
  },

  // Obtener seguidores de un plan (paginado)
  getPlanFollowers: async (planId: number, page: number = 1, perPage: number = 20): Promise<PlanFollowersResponse> => {
    return apiCall(`/nutrition/plans/${planId}/followers?page=${page}&per_page=${perPage}`);
  },

  // ===== GENERACIÓN CON IA =====

  // Generar plan completo con IA
  generateFullPlanWithAI: async (request: AIFullPlanRequest): Promise<AIFullPlanResponse> => {
    return apiCall('/nutrition/plans/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // ===== ANÁLISIS DE IMAGEN =====

  // Analizar imagen de comida con IA
  analyzeMealImage: async (request: MealImageAnalysisRequest): Promise<MealImageAnalysisResponse> => {
    return apiCall('/nutrition/meals/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // ===== GESTIÓN DE ESTADO DE PLANES =====

  // Convertir plan live a template
  convertToTemplate: async (planId: number): Promise<NutritionPlan> => {
    return apiCall(`/nutrition/plans/${planId}/convert-to-template`, {
      method: 'POST',
    });
  },

  // Duplicar un plan
  duplicatePlan: async (planId: number, newTitle?: string): Promise<NutritionPlan> => {
    return apiCall(`/nutrition/plans/${planId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ title: newTitle }),
    });
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
  DAILY_PLAN: (dayId: number) => `/nutrition/days/${dayId}`,
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

// ========================================
// SURVEYS SYSTEM - TIPOS Y API
// ========================================

// ===== ENUMS =====
export enum SurveyStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED'
}

export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  SELECT = 'SELECT',
  SCALE = 'SCALE',
  DATE = 'DATE',
  TIME = 'TIME',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  YES_NO = 'YES_NO',
  NPS = 'NPS'
}

// ===== INTERFACES PRINCIPALES =====
export interface Survey {
  id: number;
  gym_id: number;
  creator_id: number;
  creator?: UserBasicInfo;
  title: string;
  description?: string;
  instructions?: string;
  status: SurveyStatus;
  start_date?: string;
  end_date?: string;
  is_anonymous: boolean;
  allow_multiple: boolean;
  randomize_questions: boolean;
  show_progress: boolean;
  thank_you_message?: string;
  tags?: string[];
  target_audience?: string;
  published_at?: string;
  questions?: SurveyQuestion[];
  response_count?: number;  // Solo disponible en getById
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: number;
  survey_id: number;
  question_text: string;
  question_type: QuestionType;
  is_required: boolean;
  order: number;
  help_text?: string;
  min_value?: number;
  max_value?: number;
  regex_validation?: string;
  depends_on_question_id?: number;
  depends_on_answer?: any;
  choices?: QuestionChoice[];
  other_option?: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionChoice {
  id: number;
  question_id: number;
  choice_text: string;
  choice_value?: string;
  order: number;
  next_question_id?: number;
}

export interface SurveyResponse {
  id: number;
  survey_id: number;
  user_id?: number;
  user?: UserBasicInfo;
  gym_id: number;
  started_at: string;
  completed_at?: string;
  is_complete: boolean;
  ip_address?: string;
  user_agent?: string;
  event_id?: number;
  answers?: SurveyAnswer[];
}

export interface SurveyAnswer {
  id: number;
  response_id: number;
  question_id: number;
  question?: SurveyQuestion;
  text_answer?: string;
  choice_id?: number;
  choice?: QuestionChoice;
  choice_ids?: number[];
  number_answer?: number;
  date_answer?: string;
  boolean_answer?: boolean;
  other_text?: string;
}

export interface SurveyTemplate {
  id: number;
  gym_id?: number;
  name: string;
  description?: string;
  category?: string;
  template_data: any;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// ===== INTERFACES DE ESTADÍSTICAS =====
export interface SurveyStatistics {
  survey_id: number;
  survey_title: string;
  total_responses: number;
  complete_responses: number;
  incomplete_responses: number;
  average_completion_time?: number;
  response_rate?: number;
  questions: QuestionStatistics[];
  responses_by_date: Record<string, number>;
  generated_at: string;
}

export interface QuestionStatistics {
  question_id: number;
  question_text: string;
  question_type: QuestionType;
  response_count: number;
  statistics: {
    // Para preguntas de texto
    word_cloud?: WordFrequency[];
    common_themes?: string[];
    
    // Para preguntas numéricas/escala
    average?: number;
    median?: number;
    mode?: number;
    std_dev?: number;
    min?: number;
    max?: number;
    
    // Para opciones múltiples
    distribution?: Record<string, number>;
    percentages?: Record<string, number>;
    
    // Para NPS
    nps_score?: number;
    promoters?: number;
    passives?: number;
    detractors?: number;
    
    // Para YES_NO
    yes_count?: number;
    no_count?: number;
    yes_percentage?: number;
  };
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface ResponseTrend {
  date: string;
  count: number;
  cumulative: number;
}

// ===== INTERFACES DE CREACIÓN/ACTUALIZACIÓN =====
export interface SurveyCreateData {
  title: string;
  description?: string;
  instructions?: string;
  start_date?: string;
  end_date?: string;
  is_anonymous?: boolean;
  allow_multiple?: boolean;
  randomize_questions?: boolean;
  show_progress?: boolean;
  thank_you_message?: string;
  tags?: string[];
  target_audience?: string;
  questions?: SurveyQuestionCreateData[];
}

export interface SurveyQuestionCreateData {
  question_text: string;
  question_type: QuestionType;
  is_required?: boolean;
  order: number;
  help_text?: string;
  min_value?: number;
  max_value?: number;
  regex_validation?: string;
  depends_on_question_id?: number;
  depends_on_answer?: any;
  choices?: QuestionChoiceCreateData[];
  other_option?: boolean;
}

export interface QuestionChoiceCreateData {
  choice_text: string;
  choice_value?: string;
  order: number;
  next_question_id?: number;
}

export interface SurveyUpdateData {
  title?: string;
  description?: string;
  instructions?: string;
  status?: SurveyStatus;
  start_date?: string;
  end_date?: string;
  is_anonymous?: boolean;
  allow_multiple?: boolean;
  randomize_questions?: boolean;
  show_progress?: boolean;
  thank_you_message?: string;
  tags?: string[];
  target_audience?: string;
}

export interface SurveyTemplateCreateData {
  name: string;
  description?: string;
  category?: string;
  template_data: any;
  is_public?: boolean;
}

// Nuevas interfaces para respuestas
export interface SubmitResponseData {
  survey_id: number;
  event_id?: number;
  answers: AnswerData[];
}

export interface AnswerData {
  question_id: number;
  text_answer?: string;
  choice_id?: number;
  choice_ids?: number[];
  number_answer?: number;
  date_answer?: string;
  boolean_answer?: boolean;
  other_text?: string;
}

export interface CreateFromTemplateData {
  template_id: number;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

// ===== INTERFACES DE FILTROS =====
export interface SurveyFilters {
  status?: SurveyStatus;
  creator_id?: number;
  is_anonymous?: boolean;
  has_responses?: boolean;
  search?: string;
  tags?: string[];
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  skip?: number;
  limit?: number;
}

export interface SurveyResponseFilters {
  user_id?: number;
  is_complete?: boolean;
  completed_from?: string;
  completed_to?: string;
  skip?: number;
  limit?: number;
}

// ===== CONFIGURACIÓN DE TIPOS DE PREGUNTAS =====
export interface QuestionTypeConfig {
  icon: string;
  label: string;
  description: string;
  hasChoices: boolean;
  hasMinMax: boolean;
  hasOtherOption: boolean;
  defaultProps?: any;
}

export const QUESTION_TYPE_CONFIG: Record<QuestionType, QuestionTypeConfig> = {
  [QuestionType.TEXT]: {
    icon: '📝',
    label: 'Texto corto',
    description: 'Respuesta de una línea',
    hasChoices: false,
    hasMinMax: false,
    hasOtherOption: false,
    defaultProps: { max_length: 100 }
  },
  [QuestionType.TEXTAREA]: {
    icon: '📄',
    label: 'Texto largo',
    description: 'Respuesta de múltiples líneas',
    hasChoices: false,
    hasMinMax: false,
    hasOtherOption: false,
    defaultProps: { max_length: 500 }
  },
  [QuestionType.RADIO]: {
    icon: '⭕',
    label: 'Opción única',
    description: 'Seleccionar una opción',
    hasChoices: true,
    hasMinMax: false,
    hasOtherOption: true
  },
  [QuestionType.CHECKBOX]: {
    icon: '☑️',
    label: 'Opción múltiple',
    description: 'Seleccionar varias opciones',
    hasChoices: true,
    hasMinMax: false,
    hasOtherOption: true
  },
  [QuestionType.SELECT]: {
    icon: '📋',
    label: 'Dropdown',
    description: 'Lista desplegable',
    hasChoices: true,
    hasMinMax: false,
    hasOtherOption: true
  },
  [QuestionType.SCALE]: {
    icon: '⚖️',
    label: 'Escala',
    description: 'Escala numérica',
    hasChoices: false,
    hasMinMax: true,
    hasOtherOption: false,
    defaultProps: { min_value: 1, max_value: 5 }
  },
  [QuestionType.DATE]: {
    icon: '📅',
    label: 'Fecha',
    description: 'Selector de fecha',
    hasChoices: false,
    hasMinMax: false,
    hasOtherOption: false
  },
  [QuestionType.TIME]: {
    icon: '⏰',
    label: 'Hora',
    description: 'Selector de hora',
    hasChoices: false,
    hasMinMax: false,
    hasOtherOption: false
  },
  [QuestionType.NUMBER]: {
    icon: '🔢',
    label: 'Número',
    description: 'Entrada numérica',
    hasChoices: false,
    hasMinMax: true,
    hasOtherOption: false
  },
  [QuestionType.EMAIL]: {
    icon: '✉️',
    label: 'Email',
    description: 'Correo electrónico',
    hasChoices: false,
    hasMinMax: false,
    hasOtherOption: false
  },
  [QuestionType.PHONE]: {
    icon: '📱',
    label: 'Teléfono',
    description: 'Número telefónico',
    hasChoices: false,
    hasMinMax: false,
    hasOtherOption: false
  },
  [QuestionType.YES_NO]: {
    icon: '👍',
    label: 'Sí/No',
    description: 'Pregunta binaria',
    hasChoices: false,
    hasMinMax: false,
    hasOtherOption: false
  },
  [QuestionType.NPS]: {
    icon: '📊',
    label: 'NPS',
    description: 'Net Promoter Score (0-10)',
    hasChoices: false,
    hasMinMax: false,
    hasOtherOption: false,
    defaultProps: { min_value: 0, max_value: 10 }
  }
};

// ===== CONFIGURACIÓN DE ESTADOS =====
export const SURVEY_STATUS_CONFIG = {
  [SurveyStatus.DRAFT]: {
    icon: '📝',
    color: 'gray',
    label: 'Borrador',
    description: 'En construcción'
  },
  [SurveyStatus.PUBLISHED]: {
    icon: '🟢',
    color: 'green',
    label: 'Publicada',
    description: 'Activa y recibiendo respuestas'
  },
  [SurveyStatus.CLOSED]: {
    icon: '🔒',
    color: 'orange',
    label: 'Cerrada',
    description: 'No acepta más respuestas'
  },
  [SurveyStatus.ARCHIVED]: {
    icon: '📦',
    color: 'purple',
    label: 'Archivada',
    description: 'Guardada para referencia'
  }
};

// ===== API CLIENT =====
export const surveysAPI = {
  // Endpoints para usuarios (responder encuestas)
  getAvailable: async (): Promise<Survey[]> => {
    return apiCall('/surveys/available');
  },

  submitResponse: async (responseData: SubmitResponseData): Promise<SurveyResponse> => {
    return apiCall('/surveys/responses', {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },

  getMyResponses: async (skip = 0, limit = 100): Promise<SurveyResponse[]> => {
    return apiCall(`/surveys/my-responses?skip=${skip}&limit=${limit}`);
  },

  // Gestión de encuestas (admin/trainer)
  getMySurveys: async (statusFilter?: SurveyStatus, skip = 0, limit = 100): Promise<Survey[]> => {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status_filter', statusFilter);
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return apiCall(`/surveys/my-surveys?${params.toString()}`);
  },

  getById: async (surveyId: number): Promise<Survey> => {
    return apiCall(`/surveys/${surveyId}`);
  },

  create: async (surveyData: SurveyCreateData): Promise<Survey> => {
    return apiCall('/surveys/', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
  },

  update: async (surveyId: number, surveyData: SurveyUpdateData): Promise<Survey> => {
    return apiCall(`/surveys/${surveyId}`, {
      method: 'PUT',
      body: JSON.stringify(surveyData),
    });
  },

  delete: async (surveyId: number): Promise<void> => {
    return apiCall(`/surveys/${surveyId}`, {
      method: 'DELETE',
    });
  },

  // Control de estado
  publish: async (surveyId: number): Promise<Survey> => {
    return apiCall(`/surveys/${surveyId}/publish`, {
      method: 'POST',
    });
  },

  close: async (surveyId: number): Promise<Survey> => {
    return apiCall(`/surveys/${surveyId}/close`, {
      method: 'POST',
    });
  },

  // Analytics
  getStatistics: async (surveyId: number): Promise<SurveyStatistics> => {
    return apiCall(`/surveys/${surveyId}/statistics`);
  },

  getResponses: async (
    surveyId: number, 
    skip = 0, 
    limit = 100, 
    onlyComplete = true
  ): Promise<SurveyResponse[]> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      only_complete: onlyComplete.toString()
    });
    return apiCall(`/surveys/${surveyId}/responses?${params.toString()}`);
  },

  exportData: async (surveyId: number, format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
    const accessToken = await getAccessToken();
    const gymId = getSelectedGymId();
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
    };
    
    if (gymId && gymId !== 'none') {
      headers['X-Gym-ID'] = gymId;
    }
    
    const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}/export?format=${format}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw createAPIError('Error al exportar datos', response.status);
    }
    
    return response.blob();
  },

  // Templates
  getTemplates: async (category?: string, skip = 0, limit = 100): Promise<SurveyTemplate[]> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    });
    if (category) params.append('category', category);
    return apiCall(`/surveys/templates?${params.toString()}`);
  },

  createFromTemplate: async (templateData: CreateFromTemplateData): Promise<Survey> => {
    return apiCall('/surveys/from-template', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  },
};

// ===== NOTIFICATIONS API =====

/**
 * Request para enviar notificación a usuarios específicos
 */
export interface NotificationSendRequest {
  user_ids: string[];
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Request para enviar notificación a todos los miembros del gimnasio
 */
export interface NotificationToGymRequest {
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Response del servidor al enviar notificaciones
 */
export interface NotificationResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

/**
 * API para envío de notificaciones push a través de OneSignal
 * Requiere permisos de ADMIN u OWNER
 */
export const notificationsAPI = {
  /**
   * Envía notificación push a usuarios específicos
   * @param payload - Datos de la notificación con IDs de usuarios
   * @returns Response con estado del envío
   */
  sendToUsers: async (payload: NotificationSendRequest): Promise<NotificationResponse> => {
    return await apiCall('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Envía notificación push a TODOS los miembros del gimnasio
   * @param payload - Datos de la notificación (sin IDs de usuarios)
   * @returns Response con estado del envío y cantidad de destinatarios
   */
  sendToAllMembers: async (payload: NotificationToGymRequest): Promise<NotificationResponse> => {
    return await apiCall('/notifications/send-to-gym', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ===== MODULES API =====

/**
 * Módulo disponible en el sistema
 */
export interface Module {
  code: string;
  name: string;
  active: boolean;
  is_premium: boolean;
  description?: string;
  icon?: string;
}

/**
 * Response de la API de módulos
 */
export interface ModulesResponse {
  modules: Module[];
}

/**
 * API para gestión de módulos del gimnasio
 * Los módulos controlan qué funcionalidades están disponibles
 */
export const modulesAPI = {
  /**
   * Obtiene la lista de módulos y su estado de activación
   * @returns Lista de módulos con su estado
   */
  getModules: async (): Promise<ModulesResponse> => {
    return await apiCall('/modules');
  },

  /**
   * Activa un módulo específico (requiere permisos de ADMIN/OWNER)
   * @param moduleCode - Código del módulo a activar
   * @returns Resultado de la activación
   */
  activateModule: async (moduleCode: string): Promise<{ status: string; message: string }> => {
    return await apiCall(`/modules/${moduleCode}/activate`, {
      method: 'PATCH',
    });
  },

  /**
   * Desactiva un módulo específico (requiere permisos de ADMIN/OWNER)
   * @param moduleCode - Código del módulo a desactivar
   * @returns Resultado de la desactivación
   */
  deactivateModule: async (moduleCode: string): Promise<{ status: string; message: string }> => {
    return await apiCall(`/modules/${moduleCode}/deactivate`, {
      method: 'PATCH',
    });
  },

  /**
   * Verifica si un módulo específico está activo
   * @param moduleCode - Código del módulo a verificar
   * @returns true si el módulo está activo
   */
  isModuleActive: async (moduleCode: string): Promise<boolean> => {
    const { modules } = await modulesAPI.getModules();
    const foundModule = modules.find(m => m.code === moduleCode);
    return foundModule?.active || false;
  },
};

// ===== HELPER FUNCTIONS =====
export const getSurveyStatusConfig = (status: SurveyStatus) => {
  return SURVEY_STATUS_CONFIG[status];
};

export const getQuestionTypeConfig = (type: QuestionType) => {
  return QUESTION_TYPE_CONFIG[type];
};

export const calculateNPSScore = (promoters: number, passives: number, detractors: number): number => {
  const total = promoters + passives + detractors;
  if (total === 0) return 0;
  return Math.round(((promoters - detractors) / total) * 100);
};

export const formatSurveyDate = (date: string | undefined): string => {
  if (!date) return 'Sin fecha';
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isSurveyActive = (survey: Survey): boolean => {
  if (survey.status !== SurveyStatus.PUBLISHED) return false;
  
  const now = new Date();
  if (survey.start_date && new Date(survey.start_date) > now) return false;
  if (survey.end_date && new Date(survey.end_date) < now) return false;
  
  return true;
};

export const canEditSurvey = (survey: Survey): boolean => {
  return survey.status === SurveyStatus.DRAFT;
};

// ===== HELPERS PARA SISTEMA DE PAGOS DE EVENTOS =====

/**
 * Formatea un precio en centavos a formato de moneda legible
 * @param cents - Precio en centavos (ej: 4999 = €49.99)
 * @param currency - Código ISO de moneda (default: 'EUR')
 * @returns Precio formateado (ej: "€49.99")
 */
export const formatPrice = (cents: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100);
};

/**
 * Calcula el monto de reembolso según política y tiempo restante
 * @param amountCents - Monto original pagado en centavos
 * @param policy - Política de reembolso del evento
 * @param percentage - Porcentaje de reembolso parcial (solo para PARTIAL_REFUND)
 * @param deadlineHours - Horas antes del evento para reembolso
 * @param eventStartTime - Fecha/hora de inicio del evento en ISO
 * @returns Monto de reembolso en centavos
 */
export const calculateRefundAmount = (
  amountCents: number,
  policy: RefundPolicyType,
  percentage?: number,
  deadlineHours?: number,
  eventStartTime?: string
): number => {
  // Sin reembolso
  if (policy === RefundPolicyType.NO_REFUND) {
    return 0;
  }

  // Solo crédito (no dinero)
  if (policy === RefundPolicyType.CREDIT) {
    return 0;
  }

  // Verificar si está dentro del plazo
  if (deadlineHours && eventStartTime) {
    const now = new Date();
    const eventStart = new Date(eventStartTime);
    const deadline = new Date(eventStart.getTime() - deadlineHours * 60 * 60 * 1000);

    // Fuera del plazo
    if (now > deadline) {
      return 0;
    }
  }

  // Reembolso completo
  if (policy === RefundPolicyType.FULL_REFUND) {
    return amountCents;
  }

  // Reembolso parcial
  if (policy === RefundPolicyType.PARTIAL_REFUND && percentage) {
    return Math.round((amountCents * percentage) / 100);
  }

  return 0;
};

/**
 * Obtiene el label descriptivo de una política de reembolso
 * @param policy - Política de reembolso
 * @returns Texto descriptivo de la política
 */
export const getRefundPolicyLabel = (policy: RefundPolicyType): string => {
  switch (policy) {
    case RefundPolicyType.NO_REFUND:
      return 'Sin reembolso';
    case RefundPolicyType.FULL_REFUND:
      return 'Reembolso completo';
    case RefundPolicyType.PARTIAL_REFUND:
      return 'Reembolso parcial';
    case RefundPolicyType.CREDIT:
      return 'Crédito para futuros eventos';
    default:
      return policy;
  }
};

/**
 * Obtiene el label descriptivo de un estado de pago
 * @param status - Estado de pago
 * @returns Texto descriptivo del estado
 */
export const getPaymentStatusLabel = (status: PaymentStatusType): string => {
  switch (status) {
    case PaymentStatusType.PENDING:
      return 'Pendiente';
    case PaymentStatusType.PAID:
      return 'Pagado';
    case PaymentStatusType.REFUNDED:
      return 'Reembolsado';
    case PaymentStatusType.CREDITED:
      return 'Crédito otorgado';
    case PaymentStatusType.EXPIRED:
      return 'Expirado';
    default:
      return status;
  }
};

/**
 * Obtiene el color del badge según estado de pago
 * @param status - Estado de pago
 * @returns Clases de Tailwind para el badge
 */
export const getPaymentStatusColor = (status: PaymentStatusType): string => {
  switch (status) {
    case PaymentStatusType.PENDING:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case PaymentStatusType.PAID:
      return 'bg-green-100 text-green-800 border-green-200';
    case PaymentStatusType.REFUNDED:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case PaymentStatusType.CREDITED:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case PaymentStatusType.EXPIRED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// ========================================
// ACTIVITY FEED SYSTEM - TIPOS Y API
// ========================================

// ===== ENUMS =====
export enum ActivityType {
  TRAINING_COUNT = 'training_count',
  CLASS_CHECKIN = 'class_checkin',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  STREAK_MILESTONE = 'streak_milestone',
  PR_BROKEN = 'pr_broken',
  GOAL_COMPLETED = 'goal_completed',
  SOCIAL_ACTIVITY = 'social_activity',
  CLASS_POPULAR = 'class_popular',
  HOURLY_SUMMARY = 'hourly_summary',
  MOTIVATIONAL = 'motivational'
}

export enum RankingType {
  CONSISTENCY = 'consistency',
  ATTENDANCE = 'attendance',
  IMPROVEMENT = 'improvement',
  ACTIVITY = 'activity',
  DEDICATION = 'dedication'
}

export enum RankingPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum HourlyTrend {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable'
}

// ===== INTERFACES PRINCIPALES =====
export interface Activity {
  id: string;
  type: 'realtime' | 'summary';
  subtype: ActivityType | string;
  count: number;
  message: string;
  timestamp: string;
  icon: string;
  ttl_minutes: number;
  metadata?: Record<string, any>;
}

export interface ActivityFeedResponse {
  activities: Activity[];
  count: number;
  has_more: boolean;
  offset: number;
  limit: number;
}

export interface PopularClass {
  name: string;
  participants: number;
  capacity: number;
  percentage: number;
}

export interface RealtimeStats {
  active_now: number;
  by_area: Record<string, number>;
  popular_classes: PopularClass[];
  is_peak_hour: boolean;
  peak_hours: string[];
  hourly_trend: HourlyTrend;
}

export interface RealtimeStatsResponse {
  status: string;
  data: RealtimeStats;
}

export interface InsightsResponse {
  insights: string[];
  count: number;
}

export interface RankingEntry {
  position: number;
  value: number;
  badge: string | null;
}

export interface RankingsResponse {
  type: RankingType;
  period: RankingPeriod;
  rankings: RankingEntry[];
  unit: string;
  count: number;
}

export interface DailySummaryStats {
  attendance: number;
  achievements: number;
  personal_records: number;
  goals_completed: number;
  classes_completed: number;
  total_hours: number;
  active_streaks: number;
  average_class_size: number;
  engagement_score: number;
}

export interface DailySummaryResponse {
  date: string;
  stats: DailySummaryStats;
  highlights: string[];
}

export interface ActivityFeedHealth {
  status: 'healthy' | 'unhealthy';
  redis: 'connected' | 'disconnected';
  memory_usage_mb?: number;
  anonymous_mode: boolean;
  privacy_compliant: boolean;
  keys_count?: {
    feed: number;
    realtime: number;
    daily: number;
    total: number;
  };
  configuration?: {
    min_aggregation_threshold: number;
    show_user_names: boolean;
    ttl_enabled: boolean;
  };
  error?: string;
}

// ===== CONFIGURACION DE ICONOS POR TIPO =====
export const ACTIVITY_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  [ActivityType.TRAINING_COUNT]: {
    icon: '💪',
    label: 'Entrenando',
    color: 'blue'
  },
  [ActivityType.CLASS_CHECKIN]: {
    icon: '📍',
    label: 'Check-in',
    color: 'green'
  },
  [ActivityType.ACHIEVEMENT_UNLOCKED]: {
    icon: '⭐',
    label: 'Logro',
    color: 'yellow'
  },
  [ActivityType.STREAK_MILESTONE]: {
    icon: '🔥',
    label: 'Racha',
    color: 'orange'
  },
  [ActivityType.PR_BROKEN]: {
    icon: '🏆',
    label: 'Record',
    color: 'purple'
  },
  [ActivityType.GOAL_COMPLETED]: {
    icon: '🎯',
    label: 'Meta',
    color: 'teal'
  },
  [ActivityType.SOCIAL_ACTIVITY]: {
    icon: '👥',
    label: 'Social',
    color: 'pink'
  },
  [ActivityType.CLASS_POPULAR]: {
    icon: '📈',
    label: 'Clase Popular',
    color: 'indigo'
  },
  [ActivityType.HOURLY_SUMMARY]: {
    icon: '📊',
    label: 'Resumen',
    color: 'gray'
  },
  [ActivityType.MOTIVATIONAL]: {
    icon: '💫',
    label: 'Motivacional',
    color: 'amber'
  }
};

export const RANKING_TYPE_CONFIG: Record<RankingType, { icon: string; label: string; description: string }> = {
  [RankingType.CONSISTENCY]: {
    icon: '🔥',
    label: 'Consistencia',
    description: 'Dias consecutivos de entrenamiento'
  },
  [RankingType.ATTENDANCE]: {
    icon: '📍',
    label: 'Asistencia',
    description: 'Clases asistidas en el periodo'
  },
  [RankingType.IMPROVEMENT]: {
    icon: '📈',
    label: 'Mejora',
    description: 'Porcentaje de mejora'
  },
  [RankingType.ACTIVITY]: {
    icon: '⏱️',
    label: 'Actividad',
    description: 'Horas totales de entrenamiento'
  },
  [RankingType.DEDICATION]: {
    icon: '💎',
    label: 'Dedicacion',
    description: 'Puntuacion de dedicacion'
  }
};

// ===== API CLIENT =====
export const activityFeedAPI = {
  /**
   * Obtiene el feed de actividades anonimo con paginacion
   * @param limit - Numero de actividades (1-100, default 20)
   * @param offset - Offset para paginacion (default 0)
   */
  getFeed: async (limit: number = 20, offset: number = 0): Promise<ActivityFeedResponse> => {
    return apiCall(`/activity-feed/?limit=${limit}&offset=${offset}`);
  },

  /**
   * Obtiene estadisticas en tiempo real del gimnasio
   */
  getRealtimeStats: async (): Promise<RealtimeStatsResponse> => {
    return apiCall('/activity-feed/realtime');
  },

  /**
   * Obtiene insights motivacionales basados en actividad actual
   */
  getInsights: async (): Promise<InsightsResponse> => {
    return apiCall('/activity-feed/insights');
  },

  /**
   * Obtiene rankings anonimos (solo valores, sin nombres)
   * @param rankingType - Tipo de ranking
   * @param period - Periodo (daily, weekly, monthly)
   * @param limit - Posiciones a mostrar (1-50, default 10)
   */
  getRankings: async (
    rankingType: RankingType,
    period: RankingPeriod = RankingPeriod.WEEKLY,
    limit: number = 10
  ): Promise<RankingsResponse> => {
    return apiCall(`/activity-feed/rankings/${rankingType}?period=${period}&limit=${limit}`);
  },

  /**
   * Obtiene resumen de estadisticas del dia actual
   */
  getDailySummary: async (): Promise<DailySummaryResponse> => {
    return apiCall('/activity-feed/stats/summary');
  },

  /**
   * Health check del sistema de Activity Feed
   */
  getHealth: async (): Promise<ActivityFeedHealth> => {
    return apiCall('/activity-feed/health');
  },

  /**
   * Genera actividad de prueba (solo para desarrollo/testing)
   * @param activityType - Tipo de actividad a generar
   * @param count - Cantidad para la actividad
   */
  generateTestActivity: async (
    activityType: ActivityType,
    count: number
  ): Promise<{ status: string; activity?: Activity; reason?: string }> => {
    return apiCall(`/activity-feed/test/generate-activity?activity_type=${activityType}&count=${count}`, {
      method: 'POST'
    });
  }
};

// ===== HELPER FUNCTIONS =====
export const getActivityTypeConfig = (type: string) => {
  return ACTIVITY_TYPE_CONFIG[type] || {
    icon: '📌',
    label: 'Actividad',
    color: 'gray'
  };
};

export const getRankingTypeConfig = (type: RankingType) => {
  return RANKING_TYPE_CONFIG[type];
};

export const formatActivityTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTrendIcon = (trend: HourlyTrend): string => {
  switch (trend) {
    case HourlyTrend.INCREASING:
      return '📈';
    case HourlyTrend.DECREASING:
      return '📉';
    case HourlyTrend.STABLE:
      return '➡️';
    default:
      return '➡️';
  }
};

export const getTrendLabel = (trend: HourlyTrend): string => {
  switch (trend) {
    case HourlyTrend.INCREASING:
      return 'En aumento';
    case HourlyTrend.DECREASING:
      return 'Disminuyendo';
    case HourlyTrend.STABLE:
      return 'Estable';
    default:
      return 'Estable';
  }
};

export const getRankingBadge = (position: number): string | null => {
  switch (position) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
};

// ========================================
// ACHIEVEMENTS SYSTEM - TIPOS Y API
// ========================================

// ===== ENUMS =====
export enum AchievementType {
  ATTENDANCE_STREAK = 'attendance_streak',
  WEIGHT_GOAL = 'weight_goal',
  CLASS_MILESTONE = 'class_milestone',
  SOCIAL_ENGAGEMENT = 'social_engagement',
  STRENGTH_GAIN = 'strength_gain',
  ENDURANCE_MILESTONE = 'endurance_milestone',
  CONSISTENCY = 'consistency'
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// ===== INTERFACES =====
export interface Achievement {
  id: number;
  user_id: number;
  gym_id: number;
  achievement_type: AchievementType;
  title: string;
  description: string;
  icon: string;
  value: number;
  unit: string;
  rarity: AchievementRarity;
  earned_at: string;
  is_milestone: boolean;
  points_awarded: number;
  created_at: string;
}

export interface AchievementsByRarity {
  common: Achievement[];
  rare: Achievement[];
  epic: Achievement[];
  legendary: Achievement[];
}

export interface AchievementsResponse {
  total_achievements: number;
  total_points: number;
  by_rarity: AchievementsByRarity;
  recent: Achievement[];
}

export interface AchievementStats {
  total_achievements: number;
  total_points: number;
  by_type: Record<AchievementType, number>;
  by_rarity: Record<AchievementRarity, number>;
  recent_achievements: Achievement[];
  next_milestones: NextMilestone[];
}

export interface NextMilestone {
  type: AchievementType;
  title: string;
  description: string;
  current_value: number;
  target_value: number;
  progress_percentage: number;
  rarity: AchievementRarity;
  points_reward: number;
}

// ===== CONFIGURACION DE RAREZA =====
export const RARITY_CONFIG: Record<AchievementRarity, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  points: number;
}> = {
  [AchievementRarity.COMMON]: {
    label: 'Comun',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    glowColor: 'shadow-gray-200',
    points: 10
  },
  [AchievementRarity.RARE]: {
    label: 'Raro',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    glowColor: 'shadow-blue-200',
    points: 25
  },
  [AchievementRarity.EPIC]: {
    label: 'Epico',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    glowColor: 'shadow-purple-200',
    points: 50
  },
  [AchievementRarity.LEGENDARY]: {
    label: 'Legendario',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-400',
    glowColor: 'shadow-yellow-300',
    points: 100
  }
};

// ===== CONFIGURACION DE TIPOS =====
export const ACHIEVEMENT_TYPE_CONFIG: Record<AchievementType, {
  icon: string;
  label: string;
  description: string;
  color: string;
}> = {
  [AchievementType.ATTENDANCE_STREAK]: {
    icon: '🔥',
    label: 'Racha de Asistencia',
    description: 'Dias consecutivos de entrenamiento',
    color: 'orange'
  },
  [AchievementType.WEIGHT_GOAL]: {
    icon: '⚖️',
    label: 'Meta de Peso',
    description: 'Objetivos de peso alcanzados',
    color: 'green'
  },
  [AchievementType.CLASS_MILESTONE]: {
    icon: '🎯',
    label: 'Hito de Clases',
    description: 'Clases completadas',
    color: 'blue'
  },
  [AchievementType.SOCIAL_ENGAGEMENT]: {
    icon: '👥',
    label: 'Participacion Social',
    description: 'Interacciones en la comunidad',
    color: 'pink'
  },
  [AchievementType.STRENGTH_GAIN]: {
    icon: '💪',
    label: 'Ganancia de Fuerza',
    description: 'Mejoras en ejercicios de fuerza',
    color: 'red'
  },
  [AchievementType.ENDURANCE_MILESTONE]: {
    icon: '🏃',
    label: 'Resistencia',
    description: 'Hitos de resistencia cardiovascular',
    color: 'teal'
  },
  [AchievementType.CONSISTENCY]: {
    icon: '📅',
    label: 'Consistencia',
    description: 'Asistencia regular a largo plazo',
    color: 'indigo'
  }
};

// ===== DATOS MOCK PARA DESARROLLO =====
// Nota: Usar estos datos mientras el endpoint del backend no este disponible
export const MOCK_ACHIEVEMENTS: AchievementsResponse = {
  total_achievements: 12,
  total_points: 375,
  by_rarity: {
    common: [
      {
        id: 1,
        user_id: 1,
        gym_id: 1,
        achievement_type: AchievementType.ATTENDANCE_STREAK,
        title: '🔥 Racha de 3 Dias',
        description: 'Has entrenado 3 dias consecutivos. ¡Buen comienzo!',
        icon: '🔥',
        value: 3,
        unit: 'dias',
        rarity: AchievementRarity.COMMON,
        earned_at: '2025-12-15T10:30:00Z',
        is_milestone: true,
        points_awarded: 10,
        created_at: '2025-12-15T10:30:00Z'
      },
      {
        id: 2,
        user_id: 1,
        gym_id: 1,
        achievement_type: AchievementType.CLASS_MILESTONE,
        title: '🎯 Primera Clase',
        description: 'Completaste tu primera clase. ¡El viaje comienza!',
        icon: '🎯',
        value: 1,
        unit: 'clases',
        rarity: AchievementRarity.COMMON,
        earned_at: '2025-12-10T09:00:00Z',
        is_milestone: true,
        points_awarded: 10,
        created_at: '2025-12-10T09:00:00Z'
      }
    ],
    rare: [
      {
        id: 3,
        user_id: 1,
        gym_id: 1,
        achievement_type: AchievementType.ATTENDANCE_STREAK,
        title: '🔥 Racha de 7 Dias',
        description: 'Has entrenado 7 dias consecutivos. ¡Semana perfecta!',
        icon: '🔥',
        value: 7,
        unit: 'dias',
        rarity: AchievementRarity.RARE,
        earned_at: '2025-12-18T10:30:00Z',
        is_milestone: true,
        points_awarded: 25,
        created_at: '2025-12-18T10:30:00Z'
      },
      {
        id: 4,
        user_id: 1,
        gym_id: 1,
        achievement_type: AchievementType.CLASS_MILESTONE,
        title: '🎯 Guerrero de 10 Clases',
        description: 'Has completado 10 clases. ¡Estas en racha!',
        icon: '🎯',
        value: 10,
        unit: 'clases',
        rarity: AchievementRarity.RARE,
        earned_at: '2025-12-17T14:00:00Z',
        is_milestone: true,
        points_awarded: 25,
        created_at: '2025-12-17T14:00:00Z'
      },
      {
        id: 5,
        user_id: 1,
        gym_id: 1,
        achievement_type: AchievementType.WEIGHT_GOAL,
        title: '⚖️ Meta Alcanzada: 5kg',
        description: '¡Has alcanzado tu meta de perder 5kg!',
        icon: '⚖️',
        value: 5,
        unit: 'kg',
        rarity: AchievementRarity.RARE,
        earned_at: '2025-12-16T08:00:00Z',
        is_milestone: true,
        points_awarded: 25,
        created_at: '2025-12-16T08:00:00Z'
      }
    ],
    epic: [
      {
        id: 6,
        user_id: 1,
        gym_id: 1,
        achievement_type: AchievementType.ATTENDANCE_STREAK,
        title: '🔥 Mes Imparable',
        description: 'Has entrenado 30 dias consecutivos. ¡Increible dedicacion!',
        icon: '🔥',
        value: 30,
        unit: 'dias',
        rarity: AchievementRarity.EPIC,
        earned_at: '2025-12-01T10:30:00Z',
        is_milestone: true,
        points_awarded: 50,
        created_at: '2025-12-01T10:30:00Z'
      },
      {
        id: 7,
        user_id: 1,
        gym_id: 1,
        achievement_type: AchievementType.CLASS_MILESTONE,
        title: '🏆 Centurion de las Clases',
        description: '¡100 clases completadas! Eres un veterano.',
        icon: '🏆',
        value: 100,
        unit: 'clases',
        rarity: AchievementRarity.EPIC,
        earned_at: '2025-11-15T16:00:00Z',
        is_milestone: true,
        points_awarded: 50,
        created_at: '2025-11-15T16:00:00Z'
      },
      {
        id: 8,
        user_id: 1,
        gym_id: 1,
        achievement_type: AchievementType.WEIGHT_GOAL,
        title: '⚖️ Transformacion Completa',
        description: '¡Has perdido 10kg! Transformacion increible.',
        icon: '⚖️',
        value: 10,
        unit: 'kg',
        rarity: AchievementRarity.EPIC,
        earned_at: '2025-10-20T08:00:00Z',
        is_milestone: true,
        points_awarded: 50,
        created_at: '2025-10-20T08:00:00Z'
      }
    ],
    legendary: [
      {
        id: 9,
        user_id: 1,
        gym_id: 1,
        achievement_type: AchievementType.ATTENDANCE_STREAK,
        title: '🔥 Medio Ano de Fuego',
        description: '¡180 dias consecutivos! Eres una leyenda viviente.',
        icon: '🔥',
        value: 180,
        unit: 'dias',
        rarity: AchievementRarity.LEGENDARY,
        earned_at: '2025-06-15T10:30:00Z',
        is_milestone: true,
        points_awarded: 100,
        created_at: '2025-06-15T10:30:00Z'
      }
    ]
  },
  recent: [
    {
      id: 3,
      user_id: 1,
      gym_id: 1,
      achievement_type: AchievementType.ATTENDANCE_STREAK,
      title: '🔥 Racha de 7 Dias',
      description: 'Has entrenado 7 dias consecutivos. ¡Semana perfecta!',
      icon: '🔥',
      value: 7,
      unit: 'dias',
      rarity: AchievementRarity.RARE,
      earned_at: '2025-12-18T10:30:00Z',
      is_milestone: true,
      points_awarded: 25,
      created_at: '2025-12-18T10:30:00Z'
    },
    {
      id: 4,
      user_id: 1,
      gym_id: 1,
      achievement_type: AchievementType.CLASS_MILESTONE,
      title: '🎯 Guerrero de 10 Clases',
      description: 'Has completado 10 clases. ¡Estas en racha!',
      icon: '🎯',
      value: 10,
      unit: 'clases',
      rarity: AchievementRarity.RARE,
      earned_at: '2025-12-17T14:00:00Z',
      is_milestone: true,
      points_awarded: 25,
      created_at: '2025-12-17T14:00:00Z'
    },
    {
      id: 5,
      user_id: 1,
      gym_id: 1,
      achievement_type: AchievementType.WEIGHT_GOAL,
      title: '⚖️ Meta Alcanzada: 5kg',
      description: '¡Has alcanzado tu meta de perder 5kg!',
      icon: '⚖️',
      value: 5,
      unit: 'kg',
      rarity: AchievementRarity.RARE,
      earned_at: '2025-12-16T08:00:00Z',
      is_milestone: true,
      points_awarded: 25,
      created_at: '2025-12-16T08:00:00Z'
    }
  ]
};

export const MOCK_NEXT_MILESTONES: NextMilestone[] = [
  {
    type: AchievementType.ATTENDANCE_STREAK,
    title: '🔥 Racha de 14 Dias',
    description: 'Entrena 14 dias consecutivos',
    current_value: 7,
    target_value: 14,
    progress_percentage: 50,
    rarity: AchievementRarity.RARE,
    points_reward: 25
  },
  {
    type: AchievementType.CLASS_MILESTONE,
    title: '🎯 Atleta de 25 Clases',
    description: 'Completa 25 clases',
    current_value: 10,
    target_value: 25,
    progress_percentage: 40,
    rarity: AchievementRarity.RARE,
    points_reward: 25
  },
  {
    type: AchievementType.CONSISTENCY,
    title: '📅 Campeon de Consistencia',
    description: 'Mantiene 90% de asistencia durante 3 meses',
    current_value: 45,
    target_value: 90,
    progress_percentage: 50,
    rarity: AchievementRarity.LEGENDARY,
    points_reward: 100
  }
];

// ===== API CLIENT =====
export const achievementsAPI = {
  /**
   * Obtiene todos los achievements del usuario actual
   * Nota: Actualmente retorna datos mock ya que el endpoint no existe
   */
  getMyAchievements: async (): Promise<AchievementsResponse> => {
    try {
      // Intentar obtener del backend real
      return await apiCall('/users/me/achievements');
    } catch (error) {
      // Si falla (404 porque no existe), retornar mock
      console.warn('Endpoint de achievements no disponible, usando datos de ejemplo');
      return MOCK_ACHIEVEMENTS;
    }
  },

  /**
   * Obtiene estadisticas detalladas de achievements
   */
  getStats: async (): Promise<AchievementStats> => {
    try {
      return await apiCall('/users/me/achievements/stats');
    } catch (error) {
      // Datos mock para estadisticas
      const achievements = MOCK_ACHIEVEMENTS;
      const allAchievements = [
        ...achievements.by_rarity.common,
        ...achievements.by_rarity.rare,
        ...achievements.by_rarity.epic,
        ...achievements.by_rarity.legendary
      ];

      const byType = allAchievements.reduce((acc, a) => {
        acc[a.achievement_type] = (acc[a.achievement_type] || 0) + 1;
        return acc;
      }, {} as Record<AchievementType, number>);

      const byRarity = {
        [AchievementRarity.COMMON]: achievements.by_rarity.common.length,
        [AchievementRarity.RARE]: achievements.by_rarity.rare.length,
        [AchievementRarity.EPIC]: achievements.by_rarity.epic.length,
        [AchievementRarity.LEGENDARY]: achievements.by_rarity.legendary.length
      };

      return {
        total_achievements: achievements.total_achievements,
        total_points: achievements.total_points,
        by_type: byType,
        by_rarity: byRarity,
        recent_achievements: achievements.recent,
        next_milestones: MOCK_NEXT_MILESTONES
      };
    }
  },

  /**
   * Obtiene los proximos hitos a alcanzar
   */
  getNextMilestones: async (): Promise<NextMilestone[]> => {
    try {
      return await apiCall('/users/me/achievements/next-milestones');
    } catch (error) {
      return MOCK_NEXT_MILESTONES;
    }
  }
};

// ===== HELPER FUNCTIONS =====
export const getRarityConfig = (rarity: AchievementRarity) => {
  return RARITY_CONFIG[rarity];
};

export const getAchievementTypeConfig = (type: AchievementType) => {
  return ACHIEVEMENT_TYPE_CONFIG[type];
};

export const formatAchievementDate = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const calculateTotalPoints = (achievements: AchievementsResponse): number => {
  return achievements.total_points;
};

export const getAchievementCountByRarity = (achievements: AchievementsResponse): Record<AchievementRarity, number> => {
  return {
    [AchievementRarity.COMMON]: achievements.by_rarity.common.length,
    [AchievementRarity.RARE]: achievements.by_rarity.rare.length,
    [AchievementRarity.EPIC]: achievements.by_rarity.epic.length,
    [AchievementRarity.LEGENDARY]: achievements.by_rarity.legendary.length
  };
};

// ========================================
// STRIPE CONNECT - TIPOS Y API
// ========================================

// ===== ENUMS =====
export enum StripeAccountType {
  STANDARD = 'standard',
  EXPRESS = 'express'
}

export enum StripeConnectStatus {
  NOT_CONFIGURED = 'not_configured',
  ONBOARDING = 'onboarding',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

// ===== INTERFACES =====
export interface StripeAccountStatus {
  stripe_account_id: string;
  onboarding_completed: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  account_type: StripeAccountType;
  details_submitted?: boolean;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

export interface StripeConnectionStatus {
  connected: boolean;
  account_type: StripeAccountType | null;
  stripe_account_id: string | null;
  can_reconnect: boolean;
}

export interface StripeOnboardingLink {
  url: string;
  expires_at: string;
}

export interface StripeAccountCreateRequest {
  country: string;
  account_type: StripeAccountType;
}

export interface StripeAccountCreateResponse {
  stripe_account_id: string;
  account_type: StripeAccountType;
  message: string;
}

// ===== API CLIENT =====
export const stripeConnectAPI = {
  /**
   * Verifica el estado actual de la cuenta Stripe Connect del gimnasio
   * @returns Estado de la cuenta o null si no existe (404)
   */
  getAccountStatus: async (): Promise<StripeAccountStatus | null> => {
    try {
      return await apiCall('/stripe-connect/accounts/status');
    } catch (error) {
      if (isAPIError(error) && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Crea una nueva cuenta Stripe Connect para el gimnasio
   * @param country - Codigo de pais ISO (default: 'US')
   * @param accountType - Tipo de cuenta (standard o express)
   */
  createAccount: async (
    country: string = 'US',
    accountType: StripeAccountType = StripeAccountType.STANDARD
  ): Promise<StripeAccountCreateResponse> => {
    return apiCall('/stripe-connect/accounts', {
      method: 'POST',
      body: JSON.stringify({
        country,
        account_type: accountType
      })
    });
  },

  /**
   * Obtiene el link de onboarding para configurar la cuenta en Stripe
   * El link expira en 1 hora
   */
  getOnboardingLink: async (): Promise<StripeOnboardingLink> => {
    return apiCall('/stripe-connect/accounts/onboarding-link', {
      method: 'POST'
    });
  },

  /**
   * Verifica si la cuenta sigue conectada (para Standard Accounts)
   * Las cuentas Standard pueden desconectarse desde el dashboard de Stripe
   */
  getConnectionStatus: async (): Promise<StripeConnectionStatus> => {
    return apiCall('/stripe-connect/accounts/connection-status');
  },

  /**
   * Obtiene el link al dashboard de Stripe para la cuenta conectada
   */
  getDashboardLink: async (): Promise<{ url: string }> => {
    return apiCall('/stripe-connect/accounts/dashboard-link', {
      method: 'POST'
    });
  }
};

// ===== HELPER FUNCTIONS =====
/**
 * Determina el estado de conexion de Stripe basado en la respuesta de la API
 */
export const getStripeConnectStatus = (
  accountStatus: StripeAccountStatus | null
): StripeConnectStatus => {
  if (!accountStatus) {
    return StripeConnectStatus.NOT_CONFIGURED;
  }

  if (accountStatus.onboarding_completed && accountStatus.charges_enabled) {
    return StripeConnectStatus.CONNECTED;
  }

  return StripeConnectStatus.ONBOARDING;
};

/**
 * Verifica si la cuenta puede procesar pagos
 */
export const canProcessPayments = (accountStatus: StripeAccountStatus | null): boolean => {
  return accountStatus?.charges_enabled === true;
};

/**
 * Verifica si la cuenta puede recibir pagos (payouts)
 */
export const canReceivePayouts = (accountStatus: StripeAccountStatus | null): boolean => {
  return accountStatus?.payouts_enabled === true;
};