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
  Activity
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

export default function CreatePlanClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  
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

  // Función para obtener el gym ID seleccionado
  const getSelectedGymId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGymId');
    }
    return null;
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: keyof CreatePlanForm, value: any) => {
    setFormData(prev => ({
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

  // Función para manejar el envío del formulario
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
      
      // Redirigir a la lista de planes
      router.push('/nutricion/planes');
      
    } catch (err) {
      console.error('Error creating plan:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Función para calcular macros automáticamente
  const calculateMacros = () => {
    const calories = formData.target_calories;
    let proteinRatio = 0.25; // 25% proteína por defecto
    let carbRatio = 0.45;    // 45% carbohidratos por defecto
    let fatRatio = 0.30;     // 30% grasas por defecto

    // Ajustar ratios según el objetivo
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

    const protein = Math.round((calories * proteinRatio) / 4); // 4 kcal por gramo
    const carbs = Math.round((calories * carbRatio) / 4);      // 4 kcal por gramo
    const fat = Math.round((calories * fatRatio) / 9);         // 9 kcal por gramo

    setFormData(prev => ({
      ...prev,
      target_protein_g: protein,
      target_carbs_g: carbs,
      target_fat_g: fat
    }));
  };

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
                Plan público (visible para todos los miembros)
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
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creando...</span>
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