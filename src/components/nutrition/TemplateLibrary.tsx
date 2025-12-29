'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Search,
  Copy,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  Filter,
  Target,
  Clock,
  DollarSign,
  Flame,
  Users,
  Star,
  Check,
  Sparkles
} from 'lucide-react';
import { nutritionAPI, NutritionPlan, CategorizedPlansResponse } from '@/lib/api';

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelected: (templateId: number) => void;
}

const GOAL_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  bulk: { label: 'Volumen', icon: '💪', color: 'bg-blue-100 text-blue-700' },
  cut: { label: 'Definición', icon: '🔥', color: 'bg-red-100 text-red-700' },
  maintain: { label: 'Mantenimiento', icon: '⚖️', color: 'bg-green-100 text-green-700' },
  performance: { label: 'Rendimiento', icon: '⚡', color: 'bg-purple-100 text-purple-700' }
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
};

const BUDGET_LABELS: Record<string, { label: string; icon: string }> = {
  economic: { label: 'Económico', icon: '💚' },
  medium: { label: 'Medio', icon: '💛' },
  premium: { label: 'Premium', icon: '💜' }
};

export default function TemplateLibrary({
  isOpen,
  onClose,
  onTemplateSelected
}: TemplateLibraryProps) {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<NutritionPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NutritionPlan | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  // Cargar templates
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await nutritionAPI.getCategorizedPlans();
      // Combinar templates y planes archivados (que también son templates)
      const allTemplates = [
        ...response.template_plans,
        ...response.archived_plans
      ];
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar templates
  const filteredTemplates = templates.filter((template) => {
    // Búsqueda por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = template.title.toLowerCase().includes(query);
      const matchesDescription = template.description?.toLowerCase().includes(query);
      const matchesTags = template.tags?.some(tag => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    // Filtro por objetivo
    if (selectedGoal && template.goal !== selectedGoal) {
      return false;
    }

    // Filtro por dificultad
    if (selectedDifficulty && template.difficulty_level !== selectedDifficulty) {
      return false;
    }

    return true;
  });

  // Seleccionar template para preview
  const handleTemplateClick = (template: NutritionPlan) => {
    setSelectedTemplate(template);
    setPreviewExpanded(false);
  };

  // Usar template seleccionado
  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelected(selectedTemplate.id);
      onClose();
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSelectedGoal(null);
    setSelectedDifficulty(null);
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Biblioteca de Templates</h2>
              <p className="text-slate-600">Selecciona un template como base para tu nuevo plan</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar templates por nombre, descripción o etiquetas..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Toggle filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters || selectedGoal || selectedDifficulty
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Filter size={18} />
                <span>Filtros</span>
                {(selectedGoal || selectedDifficulty) && (
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                    {(selectedGoal ? 1 : 0) + (selectedDifficulty ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Filtrar por</h4>
                  {(selectedGoal || selectedDifficulty) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>

                {/* Goal filters */}
                <div>
                  <label className="block text-sm text-slate-600 mb-2">Objetivo</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(GOAL_LABELS).map(([value, { label, icon }]) => (
                      <button
                        key={value}
                        onClick={() => setSelectedGoal(selectedGoal === value ? null : value)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedGoal === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty filters */}
                <div>
                  <label className="block text-sm text-slate-600 mb-2">Dificultad</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setSelectedDifficulty(selectedDifficulty === value ? null : value)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          selectedDifficulty === value
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Template list */}
            <div className={`${selectedTemplate ? 'w-1/2' : 'w-full'} overflow-y-auto p-4 border-r border-slate-200`}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Copy size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No hay templates</h3>
                  <p className="text-slate-600">
                    {searchQuery || selectedGoal || selectedDifficulty
                      ? 'No se encontraron templates con los filtros seleccionados'
                      : 'Aún no hay templates disponibles en tu biblioteca'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => {
                    const goal = GOAL_LABELS[template.goal || 'maintain'];
                    const isSelected = selectedTemplate?.id === template.id;

                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateClick(template)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{template.title}</h3>
                            {template.description && (
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                {template.description}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center flex-wrap gap-2 mt-3">
                          {/* Goal badge */}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${goal.color}`}>
                            {goal.icon} {goal.label}
                          </span>

                          {/* Calories */}
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs flex items-center space-x-1">
                            <Flame size={12} />
                            <span>{template.target_calories} kcal</span>
                          </span>

                          {/* Duration */}
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{template.duration_days} días</span>
                          </span>

                          {/* Difficulty */}
                          {template.difficulty_level && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                              {DIFFICULTY_LABELS[template.difficulty_level]}
                            </span>
                          )}

                          {/* AI generated tag */}
                          {template.tags?.includes('generado-con-ia') && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center space-x-1">
                              <Sparkles size={12} />
                              <span>IA</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Template preview */}
            {selectedTemplate && (
              <div className="w-1/2 overflow-y-auto p-6 bg-slate-50">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Preview header */}
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900">{selectedTemplate.title}</h3>
                    {selectedTemplate.description && (
                      <p className="text-slate-600 mt-2">{selectedTemplate.description}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Flame size={18} className="text-orange-500" />
                      </div>
                      <p className="text-xl font-bold text-slate-900">{selectedTemplate.target_calories}</p>
                      <p className="text-xs text-slate-500">kcal/día</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock size={18} className="text-blue-500" />
                      </div>
                      <p className="text-xl font-bold text-slate-900">{selectedTemplate.duration_days}</p>
                      <p className="text-xs text-slate-500">días</p>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="p-4 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Macros objetivo</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">{selectedTemplate.target_protein_g}g</p>
                        <p className="text-xs text-slate-500">Proteína</p>
                      </div>
                      <div className="bg-amber-50 p-2 rounded-lg">
                        <p className="text-lg font-bold text-amber-600">{selectedTemplate.target_carbs_g}g</p>
                        <p className="text-xs text-slate-500">Carbos</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">{selectedTemplate.target_fat_g}g</p>
                        <p className="text-xs text-slate-500">Grasas</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                    <div className="p-4 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Etiquetas</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4 border-t border-slate-200 bg-blue-50">
                    <p className="text-sm text-blue-700">
                      Al usar este template, se creará una copia que podrás personalizar completamente.
                      El template original no será modificado.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} disponible{filteredTemplates.length !== 1 ? 's' : ''}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUseTemplate}
                  disabled={!selectedTemplate}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-medium transition-all ${
                    selectedTemplate
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Copy size={18} />
                  <span>Usar Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
