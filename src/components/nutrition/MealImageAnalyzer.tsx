'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Camera,
  Upload,
  X,
  Loader2,
  Check,
  AlertTriangle,
  Apple,
  Sparkles,
  ImagePlus
} from 'lucide-react';
import { nutritionAPI, MealImageAnalysisResponse, DetectedIngredient } from '@/lib/api';

interface MealImageAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  onIngredientsDetected: (ingredients: DetectedIngredient[], mealName: string, macros: { protein: number; carbs: number; fat: number }, calories: number) => void;
  context?: string;
}

export default function MealImageAnalyzer({
  isOpen,
  onClose,
  onIngredientsDetected,
  context = ''
}: MealImageAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealImageAnalysisResponse | null>(null);
  const [contextInput, setContextInput] = useState(context);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar selección de archivo
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no debe superar 10MB');
      return;
    }

    setError(null);
    setAnalysisResult(null);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      // Extraer base64 sin el prefijo data:image/...;base64,
      const base64 = result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  // Drag and drop
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // Analizar imagen
  const handleAnalyze = async () => {
    if (!imageBase64) return;

    setLoading(true);
    setError(null);

    try {
      const response = await nutritionAPI.analyzeMealImage({
        image_base64: imageBase64,
        context: contextInput.trim() || undefined
      });

      setAnalysisResult(response);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : 'Error al analizar la imagen');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar ingredientes detectados
  const handleApplyIngredients = () => {
    if (analysisResult) {
      onIngredientsDetected(
        analysisResult.ingredients_detected,
        analysisResult.meal_name,
        analysisResult.macros,
        analysisResult.estimated_calories
      );
      handleClose();
    }
  };

  // Limpiar y cerrar
  const handleClose = () => {
    setImagePreview(null);
    setImageBase64(null);
    setAnalysisResult(null);
    setError(null);
    setContextInput('');
    onClose();
  };

  // Limpiar imagen
  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Camera size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Analizar Imagen</h2>
                <p className="text-sm text-slate-600">
                  Detecta ingredientes y macros con IA
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
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertTriangle size={20} className="text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Upload zone */}
            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
              >
                <ImagePlus size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-2">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <p className="text-sm text-slate-500">
                  Formatos: JPG, PNG, WEBP (máx. 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Preview de imagen */}
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Comida a analizar"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>

                {/* Contexto opcional */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contexto (opcional)
                  </label>
                  <input
                    type="text"
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder="Ej: Almuerzo en restaurante italiano"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Resultados del análisis */}
                {analysisResult && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Check size={20} className="text-green-600" />
                      <span className="font-semibold text-green-800">Análisis completado</span>
                      <span className="text-sm text-green-600">
                        (confianza: {Math.round(analysisResult.confidence_score * 100)}%)
                      </span>
                    </div>

                    {/* Nombre de comida detectada */}
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-slate-500">Comida detectada:</p>
                      <p className="text-lg font-semibold text-slate-900">{analysisResult.meal_name}</p>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xl font-bold text-slate-900">
                          {analysisResult.estimated_calories}
                        </p>
                        <p className="text-xs text-slate-500">kcal</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xl font-bold text-blue-600">
                          {analysisResult.macros.protein}g
                        </p>
                        <p className="text-xs text-slate-500">Proteína</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xl font-bold text-amber-600">
                          {analysisResult.macros.carbs}g
                        </p>
                        <p className="text-xs text-slate-500">Carbos</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xl font-bold text-purple-600">
                          {analysisResult.macros.fat}g
                        </p>
                        <p className="text-xs text-slate-500">Grasas</p>
                      </div>
                    </div>

                    {/* Ingredientes detectados */}
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Ingredientes detectados:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.ingredients_detected.map((ingredient, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700"
                          >
                            {ingredient.name} ({ingredient.estimated_quantity})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Warnings */}
                    {analysisResult.nutritional_warnings.length > 0 && (
                      <div className="flex items-start space-x-2 bg-amber-50 p-3 rounded-lg">
                        <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Notas:</p>
                          <ul className="text-sm text-amber-700 list-disc list-inside">
                            {analysisResult.nutritional_warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Costo */}
                    <p className="text-xs text-slate-400 text-right">
                      Costo del análisis: ${analysisResult.ai_metadata.cost_usd.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            {!analysisResult ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!imageBase64 || loading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Analizando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Analizar con IA</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={clearImage}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Nueva imagen
                </button>
                <button
                  onClick={handleApplyIngredients}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Check size={18} />
                  <span>Aplicar Ingredientes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
