'use client';

import { useState } from 'react';
import {
  nutritionAPI,
  AIIngredientGenerationRequest,
  AIIngredientGenerationResponse,
  DietaryRestriction,
  Meal
} from '@/lib/api';
import {
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Clock,
  Flame,
  RefreshCw,
  Trash2,
  Info
} from 'lucide-react';

interface AIIngredientGeneratorProps {
  meal: Meal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: AIIngredientGenerationResponse['data']) => void;
}

const DIETARY_OPTIONS: { value: DietaryRestriction; label: string; emoji: string }[] = [
  { value: 'vegetarian', label: 'Vegetariano', emoji: '🥬' },
  { value: 'vegan', label: 'Vegano', emoji: '🌱' },
  { value: 'gluten_free', label: 'Sin Gluten', emoji: '🌾' },
  { value: 'dairy_free', label: 'Sin Lácteos', emoji: '🥛' },
  { value: 'nut_free', label: 'Sin Frutos Secos', emoji: '🥜' },
  { value: 'keto', label: 'Keto', emoji: '🥑' },
  { value: 'paleo', label: 'Paleo', emoji: '🦴' },
  { value: 'low_carb', label: 'Bajo en Carbos', emoji: '🍞' },
  { value: 'high_protein', label: 'Alta Proteína', emoji: '💪' },
  { value: 'halal', label: 'Halal', emoji: '☪️' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' }
];

const LOADING_MESSAGES = [
  'Analizando requerimientos nutricionales...',
  'Buscando los mejores ingredientes...',
  'Calculando valores nutricionales precisos...',
  'Generando receta personalizada...',
  'Finalizando detalles...'
];

export default function AIIngredientGenerator({
  meal,
  isOpen,
  onClose,
  onSuccess
}: AIIngredientGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIIngredientGenerationResponse['data'] | null>(null);
  const [showConfirmReplace, setShowConfirmReplace] = useState(false);

  const [options, setOptions] = useState<AIIngredientGenerationRequest>({
    dietary_restrictions: [],
    preferences: [],
    servings: 1,
    language: 'es'
  });

  const hasExistingIngredients = meal.ingredients && meal.ingredients.length > 0;

  const handleToggleDietary = (restriction: DietaryRestriction) => {
    setOptions(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions?.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...(prev.dietary_restrictions || []), restriction]
    }));
  };

  const handleGenerate = async () => {
    // Si tiene ingredientes existentes, mostrar confirmación
    if (hasExistingIngredients && !showConfirmReplace) {
      setShowConfirmReplace(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setShowConfirmReplace(false);

    // Ciclar mensajes de loading
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    try {
      // Si tiene ingredientes, eliminarlos primero
      if (hasExistingIngredients && meal.id) {
        await nutritionAPI.deleteAllIngredients(meal.id);
      }

      // Generar nuevos ingredientes
      const response = await nutritionAPI.generateIngredientsWithAI(meal.id!, options);
      setResult(response.data);
    } catch (err: any) {
      console.error('Error generating ingredients:', err);

      // Manejar errores específicos
      if (err.status === 429) {
        setError('Demasiadas solicitudes. Por favor espera unos minutos antes de intentar de nuevo.');
      } else if (err.status === 400) {
        setError('La comida ya tiene ingredientes. Elimínalos primero.');
      } else if (err.message?.includes('API key')) {
        setError('El servicio de IA no está configurado. Contacta al administrador.');
      } else {
        setError(err.message || 'Error al generar ingredientes. Intenta de nuevo.');
      }
    } finally {
      clearInterval(messageInterval);
      setLoading(false);
      setLoadingMessageIndex(0);
    }
  };

  const handleConfirm = () => {
    if (result) {
      onSuccess(result);
      handleClose();
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setShowConfirmReplace(false);
    setOptions({
      dietary_restrictions: [],
      preferences: [],
      servings: 1,
      language: 'es'
    });
    onClose();
  };

  const handleRegenerate = () => {
    setResult(null);
    handleGenerate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Generar Ingredientes con IA</h2>
                <p className="text-violet-100 text-sm">{meal.name}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-violet-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </p>
              <p className="text-sm text-gray-500">
                Esto puede tomar 10-15 segundos...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Replace Dialog */}
          {showConfirmReplace && !loading && !result && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Esta comida ya tiene ingredientes</p>
                  <p className="text-sm text-amber-600 mb-3">
                    Se eliminarán los {meal.ingredients?.length} ingredientes actuales y se generarán nuevos con IA.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleGenerate}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Reemplazar ingredientes</span>
                    </button>
                    <button
                      onClick={() => setShowConfirmReplace(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Preview */}
          {result && !loading && (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Ingredientes generados exitosamente</p>
                    <p className="text-sm text-green-600">
                      Confianza de IA: {Math.round(result.ai_confidence_score * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Nutrition Summary */}
              <div className="grid grid-cols-5 gap-3">
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-orange-600">
                    {Math.round(result.total_nutrition.calories)}
                  </div>
                  <div className="text-xs text-orange-600">Calorías</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {Math.round(result.total_nutrition.protein_g)}g
                  </div>
                  <div className="text-xs text-blue-600">Proteína</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    {Math.round(result.total_nutrition.carbs_g)}g
                  </div>
                  <div className="text-xs text-yellow-600">Carbos</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-green-600">
                    {Math.round(result.total_nutrition.fat_g)}g
                  </div>
                  <div className="text-xs text-green-600">Grasas</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {Math.round(result.total_nutrition.fiber_g)}g
                  </div>
                  <div className="text-xs text-purple-600">Fibra</div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{result.estimated_prep_time} min preparación</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-4 w-4" />
                  <span className="capitalize">{result.difficulty_level === 'beginner' ? 'Principiante' : result.difficulty_level === 'intermediate' ? 'Intermedio' : 'Avanzado'}</span>
                </div>
              </div>

              {/* Ingredients List */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Ingredientes ({result.ingredients.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 text-sm">{index + 1}.</span>
                        <span className="font-medium text-gray-900">{ingredient.name}</span>
                        {ingredient.notes && (
                          <span className="text-xs text-gray-500">({ingredient.notes})</span>
                        )}
                      </div>
                      <span className="text-gray-600">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipe Instructions */}
              {result.recipe_instructions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Instrucciones de Preparación</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-line text-sm">
                      {result.recipe_instructions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Options Form */}
          {!loading && !result && !showConfirmReplace && (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-violet-600 mt-0.5" />
                  <div className="text-sm text-violet-700">
                    <p className="font-medium mb-1">La IA generará ingredientes basándose en:</p>
                    <ul className="list-disc list-inside space-y-1 text-violet-600">
                      <li>Nombre de la comida: <strong>{meal.name}</strong></li>
                      <li>Tipo: <strong>{meal.meal_type}</strong></li>
                      <li>Calorías objetivo: <strong>{meal.calories} kcal</strong></li>
                      <li>Proteína objetivo: <strong>{meal.protein_g}g</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Restricciones Dietéticas</h4>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleToggleDietary(option.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        options.dietary_restrictions?.includes(option.value)
                          ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Servings */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Porciones</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={options.servings}
                    onChange={(e) => setOptions(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <span className="w-12 text-center font-bold text-violet-600 text-lg">
                    {options.servings}
                  </span>
                </div>
              </div>

              {/* Existing Ingredients Warning */}
              {hasExistingIngredients && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <p className="text-sm text-amber-700">
                      Esta comida ya tiene {meal.ingredients?.length} ingredientes.
                      Al generar nuevos, los actuales serán reemplazados.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            {result ? (
              <>
                <button
                  onClick={handleRegenerate}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerar</span>
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center space-x-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirmar y Guardar</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{loading ? 'Generando...' : 'Generar con IA'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
