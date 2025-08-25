'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  SurveyCreateData,
  SurveyQuestionCreateData,
  QuestionChoiceCreateData,
  QuestionType,
  surveysAPI,
  getQuestionTypeConfig,
  QUESTION_TYPE_CONFIG
} from '@/lib/api'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Settings,
  Eye,
  Copy,
  HelpCircle
} from 'lucide-react'

export default function CreateSurveyClient() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null)
  
  const [formData, setFormData] = useState<SurveyCreateData>({
    title: '',
    description: '',
    instructions: '',
    is_anonymous: false,
    allow_multiple: false,
    randomize_questions: false,
    show_progress: true,
    thank_you_message: 'Gracias por completar esta encuesta.',
    questions: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const addQuestion = (type: QuestionType) => {
    const config = getQuestionTypeConfig(type)
    const newQuestion: SurveyQuestionCreateData = {
      question_text: '',
      question_type: type,
      is_required: false,
      order: formData.questions.length,
      help_text: '',
      choices: config.hasChoices ? [
        { choice_text: 'Opción 1', order: 0 },
        { choice_text: 'Opción 2', order: 1 }
      ] : undefined,
      ...config.defaultProps
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
    setActiveQuestionIndex(formData.questions.length)
  }

  const updateQuestion = (index: number, updates: Partial<SurveyQuestionCreateData>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, ...updates } : q
      )
    }))
  }

  const deleteQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(null)
    }
  }

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = formData.questions[index]
    const duplicatedQuestion = {
      ...questionToDuplicate,
      order: formData.questions.length,
      choices: questionToDuplicate.choices?.map(c => ({ ...c }))
    }
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, duplicatedQuestion]
    }))
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.questions.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newQuestions = [...formData.questions]
    const [movedQuestion] = newQuestions.splice(index, 1)
    newQuestions.splice(newIndex, 0, movedQuestion)
    
    // Actualizar order
    newQuestions.forEach((q, i) => {
      q.order = i
    })

    setFormData(prev => ({
      ...prev,
      questions: newQuestions
    }))
    setActiveQuestionIndex(newIndex)
  }

  const addChoice = (questionIndex: number) => {
    const question = formData.questions[questionIndex]
    if (!question.choices) return

    const newChoice: QuestionChoiceCreateData = {
      choice_text: `Opción ${question.choices.length + 1}`,
      order: question.choices.length
    }

    updateQuestion(questionIndex, {
      choices: [...question.choices, newChoice]
    })
  }

  const updateChoice = (questionIndex: number, choiceIndex: number, text: string) => {
    const question = formData.questions[questionIndex]
    if (!question.choices) return

    const newChoices = question.choices.map((c, i) => 
      i === choiceIndex ? { ...c, choice_text: text } : c
    )

    updateQuestion(questionIndex, { choices: newChoices })
  }

  const deleteChoice = (questionIndex: number, choiceIndex: number) => {
    const question = formData.questions[questionIndex]
    if (!question.choices || question.choices.length <= 2) return

    const newChoices = question.choices
      .filter((_, i) => i !== choiceIndex)
      .map((c, i) => ({ ...c, order: i }))

    updateQuestion(questionIndex, { choices: newChoices })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido'
    }

    if (formData.questions.length === 0) {
      newErrors.questions = 'Debe agregar al menos una pregunta'
    }

    formData.questions.forEach((q, i) => {
      if (!q.question_text.trim()) {
        newErrors[`question_${i}`] = 'El texto de la pregunta es requerido'
      }
      if (q.choices && q.choices.some(c => !c.choice_text.trim())) {
        newErrors[`question_${i}_choices`] = 'Todas las opciones deben tener texto'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      setSaving(true)
      await surveysAPI.create(formData)
      router.push('/surveys')
    } catch (error) {
      console.error('Error al crear encuesta:', error)
      alert('Error al crear la encuesta. Por favor, intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/surveys"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Nueva Encuesta</h1>
            <p className="text-gray-600">Diseña tu encuesta con diferentes tipos de preguntas</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Ocultar' : 'Vista'} Previa
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Encuesta'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Encuesta de Satisfacción Mensual"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el propósito de esta encuesta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instrucciones
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instrucciones para completar la encuesta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje de agradecimiento
                </label>
                <textarea
                  value={formData.thank_you_message}
                  onChange={(e) => setFormData(prev => ({ ...prev, thank_you_message: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mensaje que verán al completar la encuesta"
                />
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">
                  <span className="font-medium">Encuesta anónima</span>
                  <span className="text-gray-500 ml-2">No se registrará la identidad del usuario</span>
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.allow_multiple}
                  onChange={(e) => setFormData(prev => ({ ...prev, allow_multiple: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">
                  <span className="font-medium">Permitir respuestas múltiples</span>
                  <span className="text-gray-500 ml-2">Los usuarios pueden responder varias veces</span>
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.randomize_questions}
                  onChange={(e) => setFormData(prev => ({ ...prev, randomize_questions: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">
                  <span className="font-medium">Aleatorizar preguntas</span>
                  <span className="text-gray-500 ml-2">Mostrar preguntas en orden aleatorio</span>
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.show_progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_progress: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">
                  <span className="font-medium">Mostrar progreso</span>
                  <span className="text-gray-500 ml-2">Mostrar barra de progreso al responder</span>
                </span>
              </label>
            </div>
          </div>

          {/* Preguntas */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Preguntas ({formData.questions.length})
              </h2>
              {errors.questions && (
                <p className="text-sm text-red-600">{errors.questions}</p>
              )}
            </div>

            {/* Lista de preguntas */}
            <div className="space-y-4">
              {formData.questions.map((question, index) => {
                const config = getQuestionTypeConfig(question.question_type)
                const isActive = activeQuestionIndex === index

                return (
                  <div
                    key={index}
                    className={`border rounded-lg transition-all ${
                      isActive ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                    }`}
                  >
                    {/* Header de la pregunta */}
                    <div 
                      className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => setActiveQuestionIndex(isActive ? null : index)}
                    >
                      <GripVertical className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{config.icon}</span>
                              <span className="text-sm font-medium text-gray-600">
                                {config.label}
                              </span>
                              {question.is_required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                  Requerida
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-gray-900">
                              {question.question_text || `Pregunta ${index + 1}`}
                            </p>
                          </div>
                          
                          {/* Acciones rápidas */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveQuestion(index, 'up')
                              }}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveQuestion(index, 'down')
                              }}
                              disabled={index === formData.questions.length - 1}
                              className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateQuestion(index)
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteQuestion(index)
                              }}
                              className="p-1 hover:bg-red-100 text-red-600 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contenido expandido */}
                    {isActive && (
                      <div className="px-4 pb-4 border-t">
                        <div className="pt-4 space-y-4">
                          {/* Texto de la pregunta */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Texto de la pregunta *
                            </label>
                            <input
                              type="text"
                              value={question.question_text}
                              onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[`question_${index}`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Escribe tu pregunta aquí..."
                            />
                            {errors[`question_${index}`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`question_${index}`]}</p>
                            )}
                          </div>

                          {/* Texto de ayuda */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <HelpCircle className="inline h-4 w-4 mr-1" />
                              Texto de ayuda (opcional)
                            </label>
                            <input
                              type="text"
                              value={question.help_text}
                              onChange={(e) => updateQuestion(index, { help_text: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Proporciona instrucciones adicionales..."
                            />
                          </div>

                          {/* Opciones para preguntas con choices */}
                          {config.hasChoices && question.choices && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Opciones de respuesta
                              </label>
                              <div className="space-y-2">
                                {question.choices.map((choice, choiceIndex) => (
                                  <div key={choiceIndex} className="flex items-center gap-2">
                                    <span className="text-gray-400">
                                      {question.question_type === QuestionType.RADIO ? '○' : '☐'}
                                    </span>
                                    <input
                                      type="text"
                                      value={choice.choice_text}
                                      onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                      onClick={() => deleteChoice(index, choiceIndex)}
                                      disabled={question.choices!.length <= 2}
                                      className="p-1 hover:bg-red-100 text-red-600 rounded disabled:opacity-30"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addChoice(index)}
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  <Plus className="h-4 w-4" />
                                  Agregar opción
                                </button>
                              </div>
                              {errors[`question_${index}_choices`] && (
                                <p className="mt-1 text-sm text-red-600">{errors[`question_${index}_choices`]}</p>
                              )}
                            </div>
                          )}

                          {/* Min/Max para preguntas numéricas */}
                          {config.hasMinMax && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Valor mínimo
                                </label>
                                <input
                                  type="number"
                                  value={question.min_value || ''}
                                  onChange={(e) => updateQuestion(index, { 
                                    min_value: e.target.value ? Number(e.target.value) : undefined 
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Valor máximo
                                </label>
                                <input
                                  type="number"
                                  value={question.max_value || ''}
                                  onChange={(e) => updateQuestion(index, { 
                                    max_value: e.target.value ? Number(e.target.value) : undefined 
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          )}

                          {/* Pregunta requerida */}
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={question.is_required}
                              onChange={(e) => updateQuestion(index, { is_required: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium">Pregunta requerida</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {formData.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No hay preguntas aún</p>
                  <p className="text-sm">Selecciona un tipo de pregunta para comenzar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel de Tipos de Preguntas */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="font-semibold mb-4">Agregar Pregunta</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(QUESTION_TYPE_CONFIG).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => addQuestion(type as QuestionType)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="text-2xl mb-1">{config.icon}</div>
                  <div className="text-xs font-medium">{config.label}</div>
                </button>
              ))}
            </div>

            {/* Vista previa rápida */}
            {showPreview && formData.questions.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Vista Previa</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.questions.map((q, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded text-sm">
                      <p className="font-medium mb-1">
                        {i + 1}. {q.question_text || `Pregunta ${i + 1}`}
                        {q.is_required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      {q.help_text && (
                        <p className="text-xs text-gray-500 mb-2">{q.help_text}</p>
                      )}
                      {q.choices && (
                        <div className="space-y-1 ml-4">
                          {q.choices.map((c, ci) => (
                            <div key={ci} className="text-gray-600">
                              {q.question_type === QuestionType.RADIO ? '○' : '☐'} {c.choice_text}
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
        </div>
      </div>
    </div>
  )
}