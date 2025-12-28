'use client';

import { useState, useEffect } from 'react';
import { 
  nutritionAPI, 
  Meal, 
  MealCreateData, 
  MealType, 
  getMealTypeOptions, 
  getMealTypeLabel, 
  getMealTypeIcon 
} from '@/lib/api';
import {
  Plus,
  Clock,
  Utensils,
  X,
  Edit3,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Flame,
  Zap,
  Target,
  TrendingUp,
  Sparkles,
  ChefHat
} from 'lucide-react';
import AIIngredientGenerator from '@/components/AIIngredientGenerator';
import { AIIngredientGenerationResponse } from '@/lib/api';

interface MealManagerClientProps {
  dailyPlanId: number;
  dayNumber: number;
  initialMeals?: Meal[];
  onMealChange?: (meals: Meal[]) => void;
}

export default function MealManagerClient({ 
  dailyPlanId, 
  dayNumber,
  initialMeals,
  onMealChange 
}: MealManagerClientProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiGeneratorMeal, setAiGeneratorMeal] = useState<Meal | null>(null);

  // Formulario para nueva comida
  const [mealForm, setMealForm] = useState<MealCreateData>({
    meal_type: MealType.BREAKFAST,
    name: '',
    description: '',
    preparation_time_minutes: 15,
    cooking_instructions: '',
    calories: 300,
    protein_g: 20,
    carbs_g: 30,
    fat_g: 10,
    fiber_g: 5,
    image_url: '',
    video_url: '',
    order_in_day: 1,
    daily_plan_id: dailyPlanId
  });

  // Cargar comidas del día
  useEffect(() => {
    if (initialMeals) {
      // Usar comidas iniciales si están disponibles
      setMeals(initialMeals);
      setLoading(false);
    } else {
      // Cargar desde API si no hay comidas iniciales
      loadMeals();
    }
  }, [dailyPlanId, initialMeals]);

  // Auto-ocultar mensajes de éxito
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Notificar cambios al componente padre
  useEffect(() => {
    if (onMealChange) {
      onMealChange(meals);
    }
  }, [meals, onMealChange]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const dailyPlanData = await nutritionAPI.getDailyPlan(dailyPlanId);
      setMeals(dailyPlanData.meals || []);
    } catch (err) {
      console.error('Error loading meals:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las comidas');
    } finally {
      setLoading(false);
    }
  };

  const handleMealInputChange = (field: keyof MealCreateData, value: any) => {
    setMealForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setMealForm({
      meal_type: MealType.BREAKFAST,
      name: '',
      description: '',
      preparation_time_minutes: 15,
      cooking_instructions: '',
      calories: 300,
      protein_g: 20,
      carbs_g: 30,
      fat_g: 10,
      fiber_g: 5,
      image_url: '',
      video_url: '',
      order_in_day: meals.length + 1,
      daily_plan_id: dailyPlanId
    });
  };

  const handleAddMeal = async () => {
    if (!mealForm.name.trim()) {
      setError('El nombre de la comida es obligatorio');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const newMeal = await nutritionAPI.createMeal(dailyPlanId, mealForm);
      setMeals(prev => [...prev, newMeal]);
      setShowAddForm(false);
      resetForm();
      setSuccessMessage(`Comida "${newMeal.name}" agregada exitosamente`);
    } catch (err) {
      console.error('Error adding meal:', err);
      setError(err instanceof Error ? err.message : 'Error al agregar la comida');
    } finally {
      setActionLoading(false);
    }
  };

  // ⚠️ NOTA: Las funciones handleEditMeal, handleUpdateMeal, handleDeleteMeal
  // fueron removidas porque los endpoints PUT/DELETE /nutrition/meals/{id}
  // NO EXISTEN en el backend. Ver FRONTEND_404_ERRORS_FIX.md para más detalles.
  //
  // Alternativas disponibles:
  // - Para "actualizar" una comida: usar generateIngredientsWithAI() + applyAIIngredients()
  // - Para modificar ingredientes: usar nutritionAPI.deleteIngredient() + nutritionAPI.addIngredient()

  const cancelForm = () => {
    setShowAddForm(false);
    resetForm();
  };

  const handleAIGenerationSuccess = (data: AIIngredientGenerationResponse['data']) => {
    // Actualizar la comida con los ingredientes generados
    setMeals(prev => prev.map(meal =>
      meal.id === data.meal_id
        ? {
            ...meal,
            ingredients: data.ingredients.map(ing => ({
              id: ing.id,
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              is_optional: false,
              calories_per_serving: ing.calories_per_unit * ing.quantity,
              protein_per_serving: ing.protein_g_per_unit * ing.quantity,
              carbs_per_serving: ing.carbs_g_per_unit * ing.quantity,
              fat_per_serving: ing.fat_g_per_unit * ing.quantity,
              meal_id: data.meal_id
            })),
            cooking_instructions: data.recipe_instructions || meal.cooking_instructions,
            preparation_time_minutes: data.estimated_prep_time || meal.preparation_time_minutes
          }
        : meal
    ));
    setSuccessMessage(`Ingredientes generados con IA para "${aiGeneratorMeal?.name}"`);
    setAiGeneratorMeal(null);
  };

  const getTotalNutrients = () => {
    return meals.reduce((total, meal) => ({
      calories: total.calories + meal.calories,
      protein_g: total.protein_g + meal.protein_g,
      carbs_g: total.carbs_g + meal.carbs_g,
      fat_g: total.fat_g + meal.fat_g,
      fiber_g: total.fiber_g + (meal.fiber_g || 0)
    }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando comidas...</p>
        </div>
      </div>
    );
  }

  const totalNutrients = getTotalNutrients();

  return (
    <div className="space-y-6">
      {/* Header con resumen nutricional */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
              <Utensils size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Comidas del Día {dayNumber}</h2>
              <p className="text-slate-600">{meals.length} comida{meals.length !== 1 ? 's' : ''} planificada{meals.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus size={18} />
            <span className="font-medium">Añadir Comida</span>
          </button>
        </div>

        {/* Resumen nutricional total */}
        {meals.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{totalNutrients.calories}</div>
              <div className="text-sm text-orange-600 flex items-center justify-center">
                <Flame size={14} className="mr-1" />
                Calorías
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalNutrients.protein_g}g</div>
              <div className="text-sm text-blue-600 flex items-center justify-center">
                <Zap size={14} className="mr-1" />
                Proteína
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{totalNutrients.carbs_g}g</div>
              <div className="text-sm text-yellow-600 flex items-center justify-center">
                <TrendingUp size={14} className="mr-1" />
                Carbohidratos
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{totalNutrients.fat_g}g</div>
              <div className="text-sm text-green-600 flex items-center justify-center">
                <Target size={14} className="mr-1" />
                Grasas
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalNutrients.fiber_g}g</div>
              <div className="text-sm text-purple-600 flex items-center justify-center">
                <span className="mr-1">🌾</span>
                Fibra
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mensajes de estado */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-500 hover:text-green-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Formulario para agregar comida */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <Plus size={20} className="text-orange-600 mr-3" />
              Agregar Nueva Comida
            </h3>
          </div>

          <div className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Comida
                </label>
                <select
                  value={mealForm.meal_type}
                  onChange={(e) => handleMealInputChange('meal_type', e.target.value as MealType)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                >
                  {getMealTypeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {getMealTypeIcon(option.value as MealType)} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de la Comida *
                </label>
                <input
                  type="text"
                  value={mealForm.name}
                  onChange={(e) => handleMealInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Ej: Avena con frutas"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción
              </label>
              <textarea
                value={mealForm.description}
                onChange={(e) => handleMealInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="Descripción de la comida..."
              />
            </div>

            {/* Tiempo e instrucciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tiempo de Preparación (minutos)
                </label>
                <input
                  type="number"
                  value={mealForm.preparation_time_minutes}
                  onChange={(e) => handleMealInputChange('preparation_time_minutes', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Orden en el Día
                </label>
                <input
                  type="number"
                  value={mealForm.order_in_day}
                  onChange={(e) => handleMealInputChange('order_in_day', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Instrucciones de Cocina
              </label>
              <textarea
                value={mealForm.cooking_instructions}
                onChange={(e) => handleMealInputChange('cooking_instructions', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="Pasos para preparar la comida..."
              />
            </div>

            {/* Información nutricional */}
            <div>
              <h4 className="text-lg font-medium text-slate-900 mb-4">Información Nutricional</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-orange-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-orange-700 mb-2">
                    <Flame size={16} className="inline mr-1" />
                    Calorías
                  </label>
                  <input
                    type="number"
                    value={mealForm.calories}
                    onChange={(e) => handleMealInputChange('calories', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    <Zap size={16} className="inline mr-1" />
                    Proteína (g)
                  </label>
                  <input
                    type="number"
                    value={mealForm.protein_g}
                    onChange={(e) => handleMealInputChange('protein_g', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="bg-yellow-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-yellow-700 mb-2">
                    <TrendingUp size={16} className="inline mr-1" />
                    Carbohidratos (g)
                  </label>
                  <input
                    type="number"
                    value={mealForm.carbs_g}
                    onChange={(e) => handleMealInputChange('carbs_g', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                  />
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    <Target size={16} className="inline mr-1" />
                    Grasas (g)
                  </label>
                  <input
                    type="number"
                    value={mealForm.fat_g}
                    onChange={(e) => handleMealInputChange('fat_g', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  />
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <label className="block text-sm font-medium text-purple-700 mb-2">
                    <span className="mr-1">🌾</span>
                    Fibra (g)
                  </label>
                  <input
                    type="number"
                    value={mealForm.fiber_g || 0}
                    onChange={(e) => handleMealInputChange('fiber_g', parseInt(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* URLs opcionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL de Imagen (opcional)
                </label>
                <input
                  type="url"
                  value={mealForm.image_url || ''}
                  onChange={(e) => handleMealInputChange('image_url', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL de Video (opcional)
                </label>
                <input
                  type="url"
                  value={mealForm.video_url || ''}
                  onChange={(e) => handleMealInputChange('video_url', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-3">
              <button
                onClick={handleAddMeal}
                disabled={actionLoading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Agregando...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Agregar Comida</span>
                  </>
                )}
              </button>
              <button
                onClick={cancelForm}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de comidas */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Comidas Planificadas
        </h3>
        
        {meals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils size={24} className="text-slate-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">No hay comidas planificadas</h4>
            <p className="text-slate-600 mb-6">Comienza agregando la primera comida del día</p>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus size={18} />
              <span>Agregar Primera Comida</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {meals
              .sort((a, b) => a.order_in_day - b.order_in_day)
              .map((meal) => (
                <div key={meal.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">{getMealTypeIcon(meal.meal_type)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-slate-900">{meal.name}</h4>
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            {getMealTypeLabel(meal.meal_type)}
                          </span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                            #{meal.order_in_day}
                          </span>
                        </div>
                        {meal.description && (
                          <p className="text-slate-600 text-sm mb-3">{meal.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {meal.preparation_time_minutes} min
                          </span>
                          <span className="flex items-center">
                            <Flame size={14} className="mr-1 text-orange-500" />
                            {meal.calories} kcal
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-blue-600">{meal.protein_g}g</div>
                            <div className="text-slate-500">Proteína</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-yellow-600">{meal.carbs_g}g</div>
                            <div className="text-slate-500">Carbos</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">{meal.fat_g}g</div>
                            <div className="text-slate-500">Grasas</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-purple-600">{meal.fiber_g || 0}g</div>
                            <div className="text-slate-500">Fibra</div>
                          </div>
                        </div>
                        {meal.cooking_instructions && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-600 font-medium mb-1">Instrucciones:</p>
                            <p className="text-sm text-slate-600">{meal.cooking_instructions}</p>
                          </div>
                        )}

                        {/* Ingredientes */}
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <ChefHat size={14} className="text-violet-600" />
                              <p className="text-sm text-violet-700 font-medium">
                                {meal.ingredients.length} ingrediente{meal.ingredients.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {meal.ingredients.slice(0, 5).map((ing, idx) => (
                                <span key={idx} className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full">
                                  {ing.name}
                                </span>
                              ))}
                              {meal.ingredients.length > 5 && (
                                <span className="text-xs bg-violet-200 text-violet-800 px-2 py-1 rounded-full">
                                  +{meal.ingredients.length - 5} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 flex-shrink-0">
                      <button
                        onClick={() => setAiGeneratorMeal(meal)}
                        className="p-2 text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Generar ingredientes con IA"
                      >
                        <Sparkles size={16} />
                      </button>
                      {/* Botón de editar deshabilitado - endpoint no existe en backend */}
                      <button
                        disabled
                        className="p-2 text-gray-300 cursor-not-allowed rounded-lg"
                        title="Edición no disponible - usa IA para regenerar"
                      >
                        <Edit3 size={16} />
                      </button>
                      {/* Botón de eliminar deshabilitado - endpoint no existe en backend */}
                      <button
                        disabled
                        className="p-2 text-gray-300 cursor-not-allowed rounded-lg"
                        title="Eliminación no disponible"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* AI Ingredient Generator Modal */}
      {aiGeneratorMeal && (
        <AIIngredientGenerator
          meal={aiGeneratorMeal}
          isOpen={!!aiGeneratorMeal}
          onClose={() => setAiGeneratorMeal(null)}
          onSuccess={handleAIGenerationSuccess}
        />
      )}
    </div>
  );
} 