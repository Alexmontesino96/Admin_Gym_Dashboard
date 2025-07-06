'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Save, 
  ArrowLeft, 
  Target, 
  Clock, 
  DollarSign,
  Users,
  Tag,
  Info,
  Apple,
  Zap,
  Heart,
  Activity,
  Calendar,
  Plus,
  Trash2,
  Check,
  Edit
} from 'lucide-react';

interface CreatePlanForm {
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

interface DailyPlan {
  day_number: number;
  planned_date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  notes: string;
  nutrition_plan_id?: number;
}

interface CreatedPlan {
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
}

export default function CreatePlanClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [currentStep, setCurrentStep] = useState<'plan' | 'days'>('plan');
  const [createdPlan, setCreatedPlan] = useState<CreatedPlan | null>(null);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<CreatePlanForm>({
    title: '',
    description: '',
    goal: 'bulk',
    difficulty_level: 'beginner',
    budget_level: 'medium',
    dietary_restrictions: 'none',
    duration_days: 7,
    is_recurring: false,
    target_calories: 2000,
    target_protein_g: 150,
    target_carbs_g: 250,
    target_fat_g: 67,
    is_public: true,
    tags: []
  });

  // Estado para el formulario de día diario
  const [dayForm, setDayForm] = useState<DailyPlan>({
    day_number: 1,
    planned_date: new Date().toISOString().split('T')[0],
    total_calories: 0,
    total_protein_g: 0,
    total_carbs_g: 0,
    total_fat_g: 0,
    notes: ''
  });

  // Función para obtener el gym ID seleccionado
  const getSelectedGymId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGymId');
    }
    return null;
  };

  // Función para manejar cambios en el formulario principal
  const handleInputChange = (field: keyof CreatePlanForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar cambios en el formulario de días
  const handleDayInputChange = (field: keyof DailyPlan, value: any) => {
    setDayForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para agregar tags
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Función para eliminar tags
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Función para crear el plan base
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    const gymId = getSelectedGymId();
    if (!gymId) {
      setError('No hay gimnasio seleccionado. Por favor, selecciona un gimnasio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/nutrition/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gym-ID': gymId
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const newPlan = await response.json();
      console.log('Plan created successfully:', newPlan);
      
      setCreatedPlan(newPlan);
      setCurrentStep('days');
      
      // Inicializar el primer día
      setDayForm(prev => ({
        ...prev,
        nutrition_plan_id: newPlan.id,
        total_calories: newPlan.target_calories,
        total_protein_g: newPlan.target_protein_g,
        total_carbs_g: newPlan.target_carbs_g,
        total_fat_g: newPlan.target_fat_g
      }));
      
    } catch (err) {
      console.error('Error creating plan:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un día del plan
  const handleCreateDay = async () => {
    if (!createdPlan) return;

    const gymId = getSelectedGymId();
    if (!gymId) {
      setError('No hay gimnasio seleccionado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dayData = {
        ...dayForm,
        planned_date: new Date(dayForm.planned_date).toISOString(),
        nutrition_plan_id: createdPlan.id
      };

      const response = await fetch(`/api/v1/nutrition/plans/${createdPlan.id}/days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gym-ID': gymId
        },
        body: JSON.stringify(dayData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const newDay = await response.json();
      setDailyPlans(prev => [...prev, newDay]);
      
      // Resetear formulario para el siguiente día
      const nextDayNumber = Math.max(...dailyPlans.map(d => d.day_number), dayForm.day_number) + 1;
      const nextDate = new Date(dayForm.planned_date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      setDayForm({
        day_number: nextDayNumber,
        planned_date: nextDate.toISOString().split('T')[0],
        total_calories: createdPlan.target_calories,
        total_protein_g: createdPlan.target_protein_g,
        total_carbs_g: createdPlan.target_carbs_g,
        total_fat_g: createdPlan.target_fat_g,
        notes: ''
      });

    } catch (err) {
      console.error('Error creating day:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el día');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un día
  const handleDeleteDay = (dayIndex: number) => {
    setDailyPlans(prev => prev.filter((_, index) => index !== dayIndex));
  };

  // Función para finalizar y redirigir
  const handleFinish = () => {
    router.push('/nutricion/planes');
  };

  // Función para calcular macros automáticamente
  const calculateMacros = () => {
    const calories = formData.target_calories;
    let proteinRatio = 0.25;
    let carbRatio = 0.45;
    let fatRatio = 0.30;

    switch (formData.goal) {
      case 'bulk':
        proteinRatio = 0.25;
        carbRatio = 0.50;
        fatRatio = 0.25;
        break;
      case 'cut':
        proteinRatio = 0.35;
        carbRatio = 0.35;
        fatRatio = 0.30;
        break;
      case 'maintain':
        proteinRatio = 0.25;
        carbRatio = 0.45;
        fatRatio = 0.30;
        break;
      case 'performance':
        proteinRatio = 0.20;
        carbRatio = 0.55;
        fatRatio = 0.25;
        break;
    }

    const protein = Math.round((calories * proteinRatio) / 4);
    const carbs = Math.round((calories * carbRatio) / 4);
    const fat = Math.round((calories * fatRatio) / 9);

    setFormData(prev => ({
      ...prev,
      target_protein_g: protein,
      target_carbs_g: carbs,
      target_fat_g: fat
    }));
  };

  // Función para auto-llenar macros del día basado en el plan
  const autoFillDayMacros = () => {
    if (createdPlan) {
      setDayForm(prev => ({
        ...prev,
        total_calories: createdPlan.target_calories,
        total_protein_g: createdPlan.target_protein_g,
        total_carbs_g: createdPlan.target_carbs_g,
        total_fat_g: createdPlan.target_fat_g
      }));
    }
  };

  if (currentStep === 'days' && createdPlan) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentStep('plan')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar size={24} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Agregar Días al Plan</h1>
              <p className="text-slate-600">Plan: {createdPlan.title}</p>
            </div>
          </div>
          <button
            onClick={handleFinish}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Check size={16} />
            <span>Finalizar</span>
          </button>
        </div>

        {/* Progreso */}
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Días creados: {dailyPlans.length} de {createdPlan.duration_days}</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(dailyPlans.length / createdPlan.duration_days) * 100}%` }}
                />
              </div>
              <span className="text-slate-900 font-medium">
                {Math.round((dailyPlans.length / createdPlan.duration_days) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Formulario para agregar día */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Plus size={20} className="text-green-600 mr-2" />
              Agregar Nuevo Día
            </h2>
            <button
              type="button"
              onClick={autoFillDayMacros}
              className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Target size={14} className="inline mr-1" />
              Usar Objetivos del Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de Día
              </label>
              <input
                type="number"
                value={dayForm.day_number}
                onChange={(e) => handleDayInputChange('day_number', parseInt(e.target.value))}
                min="1"
                max={createdPlan.duration_days}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha Planificada
              </label>
              <input
                type="date"
                value={dayForm.planned_date}
                onChange={(e) => handleDayInputChange('planned_date', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Calorías Totales
              </label>
              <input
                type="number"
                value={dayForm.total_calories}
                onChange={(e) => handleDayInputChange('total_calories', parseInt(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Proteína (g)
              </label>
              <input
                type="number"
                value={dayForm.total_protein_g}
                onChange={(e) => handleDayInputChange('total_protein_g', parseInt(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Carbohidratos (g)
              </label>
              <input
                type="number"
                value={dayForm.total_carbs_g}
                onChange={(e) => handleDayInputChange('total_carbs_g', parseInt(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Grasas (g)
              </label>
              <input
                type="number"
                value={dayForm.total_fat_g}
                onChange={(e) => handleDayInputChange('total_fat_g', parseInt(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas del Día
            </label>
            <textarea
              value={dayForm.notes}
              onChange={(e) => handleDayInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Instrucciones especiales, consejos, variaciones..."
            />
          </div>

          <button
            onClick={handleCreateDay}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Agregando día...</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Agregar Día {dayForm.day_number}</span>
              </>
            )}
          </button>
        </div>

        {/* Lista de días creados */}
        {dailyPlans.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Días Creados</h3>
            <div className="space-y-3">
              {dailyPlans.map((day, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="font-medium text-slate-900">Día {day.day_number}</span>
                      <span className="text-slate-600">{new Date(day.planned_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-slate-600">
                      <span>🔥 {day.total_calories} kcal</span>
                      <span>🥩 {day.total_protein_g}g proteína</span>
                      <span>🍞 {day.total_carbs_g}g carbos</span>
                      <span>🥑 {day.total_fat_g}g grasas</span>
                    </div>
                    {day.notes && (
                      <p className="text-sm text-slate-500 mt-2">{day.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteDay(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="p-2 bg-green-100 rounded-lg">
            <PlusCircle size={24} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Crear Plan Nutricional</h1>
            <p className="text-slate-600">Diseña un plan personalizado para tus miembros</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información básica */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Info size={20} className="text-blue-600 mr-2" />
            Información Básica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Título del Plan *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: Plan de Volumen - Avanzado"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe el objetivo y características principales del plan..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Objetivo
              </label>
              <select
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="bulk">Volumen (Ganar masa)</option>
                <option value="cut">Definición (Perder grasa)</option>
                <option value="maintain">Mantenimiento</option>
                <option value="performance">Rendimiento</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nivel de Dificultad
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nivel de Presupuesto
              </label>
              <select
                value={formData.budget_level}
                onChange={(e) => handleInputChange('budget_level', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duración (días)
              </label>
              <input
                type="number"
                value={formData.duration_days}
                onChange={(e) => handleInputChange('duration_days', parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Macronutrientes */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Target size={20} className="text-green-600 mr-2" />
              Macronutrientes
            </h2>
            <button
              type="button"
              onClick={calculateMacros}
              className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Zap size={14} className="inline mr-1" />
              Calcular Automático
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Calorías Objetivo
              </label>
              <input
                type="number"
                value={formData.target_calories}
                onChange={(e) => handleInputChange('target_calories', parseInt(e.target.value))}
                min="1000"
                max="5000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Proteína (g)
              </label>
              <input
                type="number"
                value={formData.target_protein_g}
                onChange={(e) => handleInputChange('target_protein_g', parseInt(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Carbohidratos (g)
              </label>
              <input
                type="number"
                value={formData.target_carbs_g}
                onChange={(e) => handleInputChange('target_carbs_g', parseInt(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Grasas (g)
              </label>
              <input
                type="number"
                value={formData.target_fat_g}
                onChange={(e) => handleInputChange('target_fat_g', parseInt(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Tag size={20} className="text-purple-600 mr-2" />
            Etiquetas
          </h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Agregar etiqueta..."
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Agregar
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuración adicional */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Activity size={20} className="text-orange-600 mr-2" />
            Configuración Adicional
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
              />
              <label htmlFor="is_public" className="text-sm font-medium text-slate-700">
                Plan público (visible para otros entrenadores)
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
                className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
              />
              <label htmlFor="is_recurring" className="text-sm font-medium text-slate-700">
                Plan recurrente (se repite automáticamente)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Restricciones Dietéticas
              </label>
              <select
                value={formData.dietary_restrictions}
                onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="none">Sin restricciones</option>
                <option value="vegetarian">Vegetariano</option>
                <option value="vegan">Vegano</option>
                <option value="gluten_free">Sin gluten</option>
                <option value="lactose_free">Sin lactosa</option>
                <option value="keto">Cetogénico</option>
                <option value="paleo">Paleo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creando plan...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Crear Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 