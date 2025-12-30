'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  FileText,
  Copy,
  Upload,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  Users,
  AlertTriangle,
  Check,
  Eye,
  Lock,
  Bell,
  UserPlus,
  Heart,
  Loader2
} from 'lucide-react';

// Tipos para el wizard
type CreationMethod = 'ai' | 'manual' | 'template' | 'import';
type Visibility = 'draft' | 'public' | 'assigned';

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

interface PlanCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onMethodSelected: (method: CreationMethod) => void;
}

const CREATION_METHODS = [
  {
    id: 'ai' as CreationMethod,
    title: 'Generar con IA',
    description: 'La IA crea un plan completo basado en objetivos y preferencias',
    icon: Sparkles,
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    features: ['Plan completo en segundos', 'Personalizado según objetivos', 'Ajustable después de generar']
  },
  {
    id: 'manual' as CreationMethod,
    title: 'Crear Manual',
    description: 'Diseña cada día y comida desde cero con control total',
    icon: FileText,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    features: ['Control total del contenido', 'Ideal para planes específicos', 'Usa IA para ingredientes']
  },
  {
    id: 'template' as CreationMethod,
    title: 'Desde Template',
    description: 'Usa un plan existente como base y personalízalo',
    icon: Copy,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    features: ['Biblioteca de templates', 'Ahorra tiempo', 'Modifica lo que necesites']
  },
  {
    id: 'import' as CreationMethod,
    title: 'Importar',
    description: 'Importa un plan desde archivo JSON o CSV',
    icon: Upload,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    features: ['Soporta JSON y CSV', 'Migra planes externos', 'Validación automática']
  }
];

export default function PlanCreationWizard({
  isOpen,
  onClose,
  onMethodSelected
}: PlanCreationWizardProps) {
  const [selectedMethod, setSelectedMethod] = useState<CreationMethod | null>(null);
  const [hoveredMethod, setHoveredMethod] = useState<CreationMethod | null>(null);

  const handleMethodSelect = (method: CreationMethod) => {
    setSelectedMethod(method);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      console.log('[PlanCreationWizard] Selected method:', selectedMethod);
      onMethodSelected(selectedMethod);
      // No llamar onClose() aquí - el padre maneja el cierre del wizard
      // onClose() ejecuta router.back() lo cual navega fuera de la página
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-white">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Crear Plan Nutricional</h2>
              <p className="text-slate-600">Elige cómo quieres empezar</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CREATION_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                const isHovered = hoveredMethod === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    onMouseEnter={() => setHoveredMethod(method.id)}
                    onMouseLeave={() => setHoveredMethod(null)}
                    className={`
                      relative p-6 rounded-xl border-2 text-left transition-all duration-200
                      ${isSelected
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`
                      inline-flex p-3 rounded-xl mb-4
                      ${method.bgColor}
                    `}>
                      <Icon size={28} className={method.iconColor} />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {method.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {method.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-1">
                      {method.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-slate-500 flex items-center space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-500' : 'bg-slate-300'}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Method-specific info */}
            {selectedMethod && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                {selectedMethod === 'ai' && (
                  <div className="flex items-start space-x-3">
                    <Sparkles size={20} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Generación con IA</p>
                      <p className="text-sm text-slate-600">
                        Configurarás los objetivos nutricionales y la IA generará un plan completo con comidas,
                        ingredientes y recetas. Podrás revisar y modificar todo antes de guardar.
                      </p>
                    </div>
                  </div>
                )}
                {selectedMethod === 'manual' && (
                  <div className="flex items-start space-x-3">
                    <FileText size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Creación Manual</p>
                      <p className="text-sm text-slate-600">
                        Tendrás control total sobre cada aspecto del plan. Primero configurarás la información
                        básica, luego podrás agregar días y comidas. La IA está disponible para sugerir ingredientes.
                      </p>
                    </div>
                  </div>
                )}
                {selectedMethod === 'template' && (
                  <div className="flex items-start space-x-3">
                    <Copy size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Desde Template</p>
                      <p className="text-sm text-slate-600">
                        Verás una biblioteca de templates disponibles organizados por objetivo y características.
                        Selecciona uno, revísalo y créalo como nuevo plan para personalizarlo.
                      </p>
                    </div>
                  </div>
                )}
                {selectedMethod === 'import' && (
                  <div className="flex items-start space-x-3">
                    <Upload size={20} className="text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Importar Plan</p>
                      <p className="text-sm text-slate-600">
                        Sube un archivo JSON o CSV con la estructura del plan. El sistema validará el formato
                        y te mostrará una preview antes de crear el plan.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedMethod}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all
                  ${selectedMethod
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                <span>Continuar</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// Componente de Configuración de Publicación
// ============================================

interface PublishingConfig {
  visibility: Visibility;
  assignedUsers: number[];
  medicalRestrictions: {
    enabled: boolean;
    warningMessage: string;
    conditions: string[];
  };
  notifications: {
    onStart: boolean;
    dailyReminder: boolean;
    reminderTime: string;
  };
}

interface PublishingSettingsProps {
  config: PublishingConfig;
  onChange: (config: PublishingConfig) => void;
  availableUsers?: { id: number; name: string; email: string }[];
}

export function PublishingSettings({
  config,
  onChange,
  availableUsers = []
}: PublishingSettingsProps) {
  const [showUserSelector, setShowUserSelector] = useState(false);

  const handleVisibilityChange = (visibility: Visibility) => {
    onChange({
      ...config,
      visibility,
      assignedUsers: visibility === 'assigned' ? config.assignedUsers : []
    });
  };

  const toggleUser = (userId: number) => {
    const newUsers = config.assignedUsers.includes(userId)
      ? config.assignedUsers.filter(id => id !== userId)
      : [...config.assignedUsers, userId];
    onChange({ ...config, assignedUsers: newUsers });
  };

  const toggleCondition = (condition: string) => {
    const newConditions = config.medicalRestrictions.conditions.includes(condition)
      ? config.medicalRestrictions.conditions.filter(c => c !== condition)
      : [...config.medicalRestrictions.conditions, condition];
    onChange({
      ...config,
      medicalRestrictions: { ...config.medicalRestrictions, conditions: newConditions }
    });
  };

  return (
    <div className="space-y-6">
      {/* Visibilidad */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Visibilidad del Plan
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleVisibilityChange('draft')}
            className={`
              p-4 rounded-xl border-2 text-center transition-all
              ${config.visibility === 'draft'
                ? 'border-amber-500 bg-amber-50'
                : 'border-slate-200 hover:border-slate-300'
              }
            `}
          >
            <Lock size={20} className={`mx-auto mb-2 ${config.visibility === 'draft' ? 'text-amber-600' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-900">Borrador</p>
            <p className="text-xs text-slate-500">Solo tú lo ves</p>
          </button>

          <button
            type="button"
            onClick={() => handleVisibilityChange('public')}
            className={`
              p-4 rounded-xl border-2 text-center transition-all
              ${config.visibility === 'public'
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 hover:border-slate-300'
              }
            `}
          >
            <Eye size={20} className={`mx-auto mb-2 ${config.visibility === 'public' ? 'text-green-600' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-900">Público</p>
            <p className="text-xs text-slate-500">Todos pueden verlo</p>
          </button>

          <button
            type="button"
            onClick={() => handleVisibilityChange('assigned')}
            className={`
              p-4 rounded-xl border-2 text-center transition-all
              ${config.visibility === 'assigned'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
              }
            `}
          >
            <UserPlus size={20} className={`mx-auto mb-2 ${config.visibility === 'assigned' ? 'text-blue-600' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-900">Asignado</p>
            <p className="text-xs text-slate-500">Usuarios específicos</p>
          </button>
        </div>
      </div>

      {/* Selector de usuarios (solo si es asignado) */}
      {config.visibility === 'assigned' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Usuarios Asignados ({config.assignedUsers.length})
          </label>
          <div className="border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto">
            {availableUsers.length > 0 ? (
              <div className="space-y-2">
                {availableUsers.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={config.assignedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                No hay usuarios disponibles para asignar
              </p>
            )}
          </div>
        </div>
      )}

      {/* Restricciones médicas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-slate-700">
            Restricciones Médicas
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.medicalRestrictions.enabled}
              onChange={(e) => onChange({
                ...config,
                medicalRestrictions: { ...config.medicalRestrictions, enabled: e.target.checked }
              })}
              className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-slate-600">Activar</span>
          </label>
        </div>

        {config.medicalRestrictions.enabled && (
          <div className="space-y-3 bg-red-50 p-4 rounded-xl">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={16} className="text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">
                Los usuarios con estas condiciones verán una advertencia antes de seguir este plan
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Diabetes', 'Hipertensión', 'Alergias alimentarias', 'Embarazo', 'Enfermedad renal'].map(condition => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => toggleCondition(condition)}
                  className={`
                    px-3 py-1 rounded-full text-sm transition-colors
                    ${config.medicalRestrictions.conditions.includes(condition)
                      ? 'bg-red-500 text-white'
                      : 'bg-white border border-red-200 text-red-700 hover:bg-red-100'
                    }
                  `}
                >
                  {condition}
                </button>
              ))}
            </div>

            <textarea
              value={config.medicalRestrictions.warningMessage}
              onChange={(e) => onChange({
                ...config,
                medicalRestrictions: { ...config.medicalRestrictions, warningMessage: e.target.value }
              })}
              placeholder="Mensaje de advertencia personalizado (opcional)"
              className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Notificaciones */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Notificaciones
        </label>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <Bell size={18} className="text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">Al iniciar el plan</p>
                <p className="text-xs text-slate-500">Notificar cuando un usuario comience</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.notifications.onStart}
              onChange={(e) => onChange({
                ...config,
                notifications: { ...config.notifications, onStart: e.target.checked }
              })}
              className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <Bell size={18} className="text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">Recordatorio diario</p>
                <p className="text-xs text-slate-500">Recordar las comidas del día</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.notifications.dailyReminder}
              onChange={(e) => onChange({
                ...config,
                notifications: { ...config.notifications, dailyReminder: e.target.checked }
              })}
              className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
            />
          </label>

          {config.notifications.dailyReminder && (
            <div className="pl-12">
              <label className="block text-xs text-slate-500 mb-1">Hora del recordatorio</label>
              <input
                type="time"
                value={config.notifications.reminderTime}
                onChange={(e) => onChange({
                  ...config,
                  notifications: { ...config.notifications, reminderTime: e.target.value }
                })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Componente de Alerta de Seguridad
// ============================================

interface SafetyScreeningProps {
  calories: number;
  onAcknowledge: () => void;
  onCancel: () => void;
}

export function SafetyScreening({ calories, onAcknowledge, onCancel }: SafetyScreeningProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (calories >= 1500) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle size={24} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Plan con restricción calórica importante
          </h3>
          <p className="text-sm text-amber-700 mb-4">
            Este plan tiene <strong>{calories} calorías diarias</strong>, lo cual está por debajo
            de las 1,500 calorías recomendadas como mínimo. Los planes muy restrictivos pueden:
          </p>
          <ul className="text-sm text-amber-700 space-y-1 mb-4 list-disc list-inside">
            <li>Causar pérdida de masa muscular</li>
            <li>Reducir el metabolismo basal</li>
            <li>Generar deficiencias nutricionales</li>
            <li>No ser sostenibles a largo plazo</li>
          </ul>

          <label className="flex items-start space-x-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm text-amber-800">
              Entiendo los riesgos y confirmo que este plan será supervisado por un profesional de la salud
            </span>
          </label>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Ajustar calorías
            </button>
            <button
              onClick={onAcknowledge}
              disabled={!acknowledged}
              className={`
                px-4 py-2 rounded-lg transition-colors
                ${acknowledged
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-amber-200 text-amber-400 cursor-not-allowed'
                }
              `}
            >
              Continuar de todos modos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
