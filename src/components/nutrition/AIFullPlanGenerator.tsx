'use client';

import { useState } from 'react';
import {
  Sparkles,
  X,
  Target,
  Flame,
  Clock,
  DollarSign,
  Utensils,
  AlertTriangle,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Apple
} from 'lucide-react';
import { nutritionAPI, AIFullPlanRequest, AIFullPlanResponse, GeneratedDay } from '@/lib/api';

interface AIFullPlanGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (response: AIFullPlanResponse) => void;
}

const GOALS = [
  { value: 'bulk', label: 'Volumen', icon: '💪', description: 'Ganar masa muscular' },
  { value: 'cut', label: 'Definición', icon: '🔥', description: 'Perder grasa' },
  { value: 'maintenance', label: 'Mantenimiento', icon: '⚖️', description: 'Mantener peso actual' },
  { value: 'performance', label: 'Rendimiento', icon: '⚡', description: 'Optimizar rendimiento deportivo' }
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Principiante', description: 'Recetas simples y rápidas' },
  { value: 'intermediate', label: 'Intermedio', description: 'Variedad moderada' },
  { value: 'advanced', label: 'Avanzado', description: 'Preparaciones elaboradas' }
];

const BUDGET_LEVELS = [
  { value: 'economic', label: 'Económico', icon: '💚' },
  { value: 'medium', label: 'Medio', icon: '💛' },
  { value: 'premium', label: 'Premium', icon: '💜' }
];

const DIETARY_RESTRICTIONS = [
  { value: 'vegetarian', label: 'Vegetariano' },
  { value: 'vegan', label: 'Vegano' },
  { value: 'gluten_free', label: 'Sin Gluten' },
  { value: 'dairy_free', label: 'Sin Lácteos' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' }
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentario', description: 'Poco o nada de ejercicio' },
  { value: 'light', label: 'Ligero', description: '1-2 días/semana' },
  { value: 'moderate', label: 'Moderado', description: '3-5 días/semana' },
  { value: 'active', label: 'Activo', description: '6-7 días/semana' },
  { value: 'very_active', label: 'Muy activo', description: 'Atleta o trabajo físico' }
];

const QUICK_PROMPTS = [
  { label: 'Comidas fáciles de preparar', value: 'Prioriza comidas que se preparan en menos de 20 minutos' },
  { label: 'Sin repetir recetas', value: 'Evita repetir las mismas comidas durante la semana' },
  { label: 'Alto en fibra', value: 'Incluye alimentos ricos en fibra en cada comida principal' },
  { label: 'Meal prep friendly', value: 'Diseña comidas que se puedan preparar con anticipación y refrigerar' },
  { label: 'Bajo en sodio', value: 'Limita el uso de sal y alimentos procesados' },
  { label: 'Rica en proteína', value: 'Maximiza la ingesta de proteína distribuyéndola uniformemente en cada comida' }
];

interface UserProfile {
  enabled: boolean;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  activity_level?: string;
  allergies?: string;
}

interface FormData {
  title: string;
  goal: string;
  target_calories: number;
  duration_days: number;
  difficulty_level: string;
  budget_level: string;
  meals_per_day: number;
  dietary_restrictions: string[];
  excluded_ingredients: string;
  // Nuevos campos para mejorar contexto de IA
  user_profile: UserProfile;
  additional_prompt: string;
}

export default function AIFullPlanGenerator({
  isOpen,
  onClose,
  onPlanGenerated
}: AIFullPlanGeneratorProps) {
  const [step, setStep] = useState<'form' | 'generating' | 'preview'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<AIFullPlanResponse | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  const [formData, setFormData] = useState<FormData>({
    title: '',
    goal: 'maintenance',
    target_calories: 2000,
    duration_days: 7,
    difficulty_level: 'intermediate',
    budget_level: 'medium',
    meals_per_day: 5,
    dietary_restrictions: [],
    excluded_ingredients: '',
    user_profile: {
      enabled: false,
      weight_kg: undefined,
      height_cm: undefined,
      age: undefined,
      activity_level: 'moderate',
      allergies: ''
    },
    additional_prompt: ''
  });
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    if (formData.target_calories < 1200 || formData.target_calories > 5000) {
      newErrors.target_calories = 'Las calorías deben estar entre 1200 y 5000';
    }
    if (formData.duration_days < 1 || formData.duration_days > 30) {
      newErrors.duration_days = 'La duración debe ser entre 1 y 30 días';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar si necesita warning de seguridad
  const needsSafetyWarning = formData.target_calories < 1500;

  // Generar plan
  const handleGenerate = async () => {
    if (!validateForm()) return;

    // Verificar si necesita confirmación de seguridad
    if (needsSafetyWarning && !safetyAcknowledged) {
      setShowSafetyWarning(true);
      return;
    }

    setLoading(true);
    setError(null);
    setStep('generating');

    try {
      // Construir descripción con contexto adicional
      let description = formData.additional_prompt || '';

      // Agregar contexto del perfil de usuario si está habilitado
      if (formData.user_profile.enabled) {
        const profileParts: string[] = [];
        if (formData.user_profile.weight_kg) {
          profileParts.push(`Peso: ${formData.user_profile.weight_kg}kg`);
        }
        if (formData.user_profile.height_cm) {
          profileParts.push(`Altura: ${formData.user_profile.height_cm}cm`);
        }
        if (formData.user_profile.age) {
          profileParts.push(`Edad: ${formData.user_profile.age} años`);
        }
        if (formData.user_profile.activity_level) {
          const activity = ACTIVITY_LEVELS.find(a => a.value === formData.user_profile.activity_level);
          if (activity) {
            profileParts.push(`Nivel de actividad: ${activity.label}`);
          }
        }
        if (formData.user_profile.allergies?.trim()) {
          profileParts.push(`Alergias: ${formData.user_profile.allergies}`);
        }

        if (profileParts.length > 0) {
          description = `Perfil del usuario: ${profileParts.join(', ')}. ${description}`;
        }
      }

      const request: AIFullPlanRequest = {
        title: formData.title,
        description: description.trim() || undefined,
        goal: formData.goal,
        target_calories: formData.target_calories,
        duration_days: formData.duration_days,
        difficulty_level: formData.difficulty_level,
        budget_level: formData.budget_level,
        meals_per_day: formData.meals_per_day,
        dietary_restrictions: formData.dietary_restrictions.length > 0 ? formData.dietary_restrictions : undefined,
        excluded_ingredients: formData.excluded_ingredients.trim()
          ? formData.excluded_ingredients.split(',').map(i => i.trim())
          : undefined,
        language: 'es'
      };

      const response = await nutritionAPI.generateFullPlanWithAI(request);

      // Validar que la respuesta tenga la estructura esperada
      // El backend devuelve daily_plans directamente, no dentro de response.plan
      if (!response?.daily_plans || response.daily_plans.length === 0) {
        throw new Error('La respuesta de IA no contiene un plan válido con días');
      }

      setGeneratedPlan(response);
      setStep('preview');
    } catch (err) {
      console.error('Error generating plan:', err);
      setError(err instanceof Error ? err.message : 'Error al generar el plan');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  // Manejar confirmación de seguridad
  const handleSafetyAcknowledge = () => {
    setSafetyAcknowledged(true);
    setShowSafetyWarning(false);
    handleGenerate();
  };

  // Agregar quick prompt
  const addQuickPrompt = (prompt: string) => {
    const current = formData.additional_prompt.trim();
    const newPrompt = current ? `${current}. ${prompt}` : prompt;
    setFormData({ ...formData, additional_prompt: newPrompt });
  };

  // Aceptar plan generado
  const handleAccept = () => {
    if (generatedPlan) {
      onPlanGenerated(generatedPlan);
      handleClose();
    }
  };

  // Regenerar
  const handleRegenerate = () => {
    setGeneratedPlan(null);
    setStep('form');
  };

  // Cerrar y resetear
  const handleClose = () => {
    setStep('form');
    setGeneratedPlan(null);
    setError(null);
    onClose();
  };

  // Toggle día expandido
  const toggleDayExpanded = (dayNumber: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayNumber)) {
      newExpanded.delete(dayNumber);
    } else {
      newExpanded.add(dayNumber);
    }
    setExpandedDays(newExpanded);
  };

  // Toggle restricción dietética
  const toggleRestriction = (restriction: string) => {
    const newRestrictions = formData.dietary_restrictions.includes(restriction)
      ? formData.dietary_restrictions.filter(r => r !== restriction)
      : [...formData.dietary_restrictions, restriction];
    setFormData({ ...formData, dietary_restrictions: newRestrictions });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sparkles size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Generar Plan con IA</h2>
                <p className="text-sm text-slate-600">
                  {step === 'form' && 'Configura las características del plan'}
                  {step === 'generating' && 'Generando plan...'}
                  {step === 'preview' && 'Revisa el plan generado'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error al generar</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Formulario */}
            {step === 'form' && (
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título del Plan *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Plan de definición 1800 kcal"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.title ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Objetivo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Objetivo
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {GOALS.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, goal: goal.value })}
                        className={`p-3 border rounded-xl text-left transition-all ${
                          formData.goal === goal.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{goal.icon}</span>
                          <span className="font-medium">{goal.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{goal.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calorías y Duración */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Flame size={16} className="inline mr-1" />
                      Calorías diarias
                    </label>
                    <input
                      type="number"
                      value={formData.target_calories}
                      onChange={(e) => setFormData({ ...formData, target_calories: parseInt(e.target.value) || 0 })}
                      min={1200}
                      max={5000}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.target_calories ? 'border-red-300' : 'border-slate-300'
                      }`}
                    />
                    {errors.target_calories && <p className="text-red-500 text-sm mt-1">{errors.target_calories}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Clock size={16} className="inline mr-1" />
                      Duración (días)
                    </label>
                    <input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 0 })}
                      min={1}
                      max={30}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.duration_days ? 'border-red-300' : 'border-slate-300'
                      }`}
                    />
                    {errors.duration_days && <p className="text-red-500 text-sm mt-1">{errors.duration_days}</p>}
                  </div>
                </div>

                {/* Dificultad */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nivel de dificultad
                  </label>
                  <div className="flex space-x-3">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, difficulty_level: level.value })}
                        className={`flex-1 p-3 border rounded-xl text-center transition-all ${
                          formData.difficulty_level === level.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-medium block">{level.label}</span>
                        <span className="text-xs text-slate-500">{level.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Presupuesto y Comidas por día */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      Presupuesto
                    </label>
                    <div className="flex space-x-2">
                      {BUDGET_LEVELS.map((budget) => (
                        <button
                          key={budget.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, budget_level: budget.value })}
                          className={`flex-1 p-2 border rounded-lg text-center transition-all ${
                            formData.budget_level === budget.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-lg">{budget.icon}</span>
                          <span className="text-xs block">{budget.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Utensils size={16} className="inline mr-1" />
                      Comidas por día
                    </label>
                    <select
                      value={formData.meals_per_day}
                      onChange={(e) => setFormData({ ...formData, meals_per_day: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {[3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} comidas</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Restricciones dietéticas */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Restricciones dietéticas (opcional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_RESTRICTIONS.map((restriction) => (
                      <button
                        key={restriction.value}
                        type="button"
                        onClick={() => toggleRestriction(restriction.value)}
                        className={`px-3 py-1.5 border rounded-full text-sm transition-all ${
                          formData.dietary_restrictions.includes(restriction.value)
                            ? 'border-green-500 bg-green-100 text-green-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {formData.dietary_restrictions.includes(restriction.value) && (
                          <Check size={14} className="inline mr-1" />
                        )}
                        {restriction.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ingredientes excluidos */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ingredientes a excluir (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.excluded_ingredients}
                    onChange={(e) => setFormData({ ...formData, excluded_ingredients: e.target.value })}
                    placeholder="Ej: maní, mariscos, cerdo (separados por coma)"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Sección expandible: Perfil del Usuario */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      user_profile: { ...formData.user_profile, enabled: !formData.user_profile.enabled }
                    })}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Target size={18} className="text-blue-600" />
                      <div className="text-left">
                        <span className="font-medium text-slate-900">Perfil del Usuario Objetivo</span>
                        <p className="text-xs text-slate-500">Opcional: mejora la personalización del plan</p>
                      </div>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.user_profile.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${formData.user_profile.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </button>

                  {formData.user_profile.enabled && (
                    <div className="p-4 space-y-4 bg-blue-50/50">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Peso (kg)</label>
                          <input
                            type="number"
                            value={formData.user_profile.weight_kg || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              user_profile: { ...formData.user_profile, weight_kg: parseInt(e.target.value) || undefined }
                            })}
                            placeholder="70"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Altura (cm)</label>
                          <input
                            type="number"
                            value={formData.user_profile.height_cm || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              user_profile: { ...formData.user_profile, height_cm: parseInt(e.target.value) || undefined }
                            })}
                            placeholder="175"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Edad</label>
                          <input
                            type="number"
                            value={formData.user_profile.age || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              user_profile: { ...formData.user_profile, age: parseInt(e.target.value) || undefined }
                            })}
                            placeholder="30"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">Nivel de Actividad</label>
                        <div className="flex flex-wrap gap-2">
                          {ACTIVITY_LEVELS.map((level) => (
                            <button
                              key={level.value}
                              type="button"
                              onClick={() => setFormData({
                                ...formData,
                                user_profile: { ...formData.user_profile, activity_level: level.value }
                              })}
                              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                                formData.user_profile.activity_level === level.value
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                              }`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Alergias conocidas</label>
                        <input
                          type="text"
                          value={formData.user_profile.allergies || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            user_profile: { ...formData.user_profile, allergies: e.target.value }
                          })}
                          placeholder="Ej: frutos secos, mariscos"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Prompt adicional */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Instrucciones adicionales para la IA (opcional)
                  </label>
                  <textarea
                    value={formData.additional_prompt}
                    onChange={(e) => setFormData({ ...formData, additional_prompt: e.target.value })}
                    placeholder="Ej: Incluye snacks con proteína, evita lácteos en el desayuno, prefiere cocina mediterránea..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  {/* Quick prompts */}
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 mb-2">Sugerencias rápidas:</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => addQuickPrompt(prompt.value)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs transition-colors"
                        >
                          + {prompt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Warning de calorías bajas */}
                {showSafetyWarning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-amber-900">Plan con restricción calórica importante</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Este plan tiene <strong>{formData.target_calories} calorías</strong>, lo cual está por debajo
                          de las 1,500 calorías recomendadas como mínimo seguro.
                        </p>
                        <p className="text-sm text-amber-700 mt-2">
                          Los planes muy restrictivos pueden causar pérdida de masa muscular, deficiencias nutricionales,
                          y no son sostenibles a largo plazo.
                        </p>
                        <div className="flex space-x-3 mt-4">
                          <button
                            type="button"
                            onClick={() => setShowSafetyWarning(false)}
                            className="px-3 py-1.5 border border-amber-300 text-amber-700 rounded-lg text-sm hover:bg-amber-100 transition-colors"
                          >
                            Ajustar calorías
                          </button>
                          <button
                            type="button"
                            onClick={handleSafetyAcknowledge}
                            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors"
                          >
                            Entiendo, continuar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Estado de generación */}
            {step === 'generating' && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <Loader2 size={48} className="animate-spin text-green-600" />
                  <Sparkles size={20} className="absolute -top-1 -right-1 text-amber-500" />
                </div>
                <p className="text-lg font-medium text-slate-900 mt-4">Generando plan...</p>
                <p className="text-sm text-slate-500 mt-2">
                  Esto puede tomar entre 10-30 segundos
                </p>
              </div>
            )}

            {/* Preview del plan generado */}
            {step === 'preview' && generatedPlan && (
              <div className="space-y-4">
                {/* Resumen */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Check size={20} className="text-green-600" />
                    <span className="font-semibold text-green-800">Plan generado exitosamente</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center mt-4">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {generatedPlan.daily_plans.length}
                      </p>
                      <p className="text-sm text-slate-600">días</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {generatedPlan.target_calories}
                      </p>
                      <p className="text-sm text-slate-600">kcal/día</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        ${generatedPlan.ai_metadata.cost_usd.toFixed(4)}
                      </p>
                      <p className="text-sm text-slate-600">costo IA</p>
                    </div>
                  </div>
                </div>

                {/* Días del plan */}
                <div className="space-y-3">
                  {generatedPlan.daily_plans.map((day) => (
                    <div key={day.day_number} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleDayExpanded(day.day_number)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-semibold">
                            {day.day_number}
                          </span>
                          <span className="font-medium text-slate-900">
                            {day.day_name || `Día ${day.day_number}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-slate-600">
                            {day.total_calories} kcal • {day.meals.length} comidas
                          </span>
                          {expandedDays.has(day.day_number) ? (
                            <ChevronUp size={20} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={20} className="text-slate-400" />
                          )}
                        </div>
                      </button>

                      {expandedDays.has(day.day_number) && (
                        <div className="p-4 space-y-3">
                          {day.meals.map((meal, mealIndex) => (
                            <div key={mealIndex} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                              <Apple size={18} className="text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-900">{meal.name}</span>
                                  <span className="text-sm text-slate-600">{meal.calories} kcal</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  {meal.meal_type} • P: {meal.protein_g}g C: {meal.carbs_g}g G: {meal.fat_g}g
                                </p>
                                {meal.ingredients.length > 0 && (
                                  <p className="text-xs text-slate-400 mt-1">
                                    {meal.ingredients.slice(0, 3).map(i => i.name).join(', ')}
                                    {meal.ingredients.length > 3 && ` +${meal.ingredients.length - 3} más`}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            {step === 'form' && (
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Sparkles size={18} />
                  <span>Generar Plan</span>
                </button>
              </div>
            )}

            {step === 'preview' && (
              <div className="flex space-x-3">
                <button
                  onClick={handleRegenerate}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Regenerar
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Check size={18} />
                  <span>Usar este Plan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
