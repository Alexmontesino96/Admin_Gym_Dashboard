'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  SurveyTemplate,
  CreateFromTemplateData,
  surveysAPI
} from '@/lib/api'
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  Star,
  MessageSquare,
  Trophy,
  Target,
  Heart,
  Zap,
  Search,
  Filter,
  Plus
} from 'lucide-react'

// Mapeo de categorías a iconos
const categoryIcons: Record<string, any> = {
  satisfaction: Star,
  feedback: MessageSquare,
  event: Calendar,
  training: Trophy,
  health: Heart,
  performance: Target,
  general: FileText,
  other: Zap
}

const TemplatesSkeleton = () => (
  <div className="space-y-6">
    <div className="mb-8">
      <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
)

export default function TemplatesClient() {
  const router = useRouter()
  const [templates, setTemplates] = useState<SurveyTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [categoryFilter])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const category = categoryFilter !== 'all' ? categoryFilter : undefined
      const data = await surveysAPI.getTemplates(category)
      setTemplates(data)
    } catch (err) {
      console.error('Error al cargar plantillas:', err)
      setError('Error al cargar las plantillas')
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = async (templateId: number) => {
    try {
      const survey = await surveysAPI.createFromTemplate({
        template_id: templateId
      })
      router.push(`/surveys/${survey.id}/edit`)
    } catch (err) {
      console.error('Error al usar plantilla:', err)
      alert('Error al crear encuesta desde plantilla')
    }
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Agrupar plantillas por categoría
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    const category = template.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(template)
    return acc
  }, {} as Record<string, SurveyTemplate[]>)

  if (loading) return <TemplatesSkeleton />

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadTemplates}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Plantillas de Encuestas</h1>
            <p className="text-gray-600">Usa plantillas prediseñadas para crear encuestas rápidamente</p>
          </div>
        </div>

        <Link
          href="/surveys/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Crear desde Cero
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por categoría */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="satisfaction">Satisfacción</option>
              <option value="feedback">Feedback</option>
              <option value="event">Eventos</option>
              <option value="training">Entrenamiento</option>
              <option value="health">Salud</option>
              <option value="performance">Rendimiento</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de plantillas */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No hay plantillas disponibles</p>
          <Link
            href="/surveys/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Crear Encuesta desde Cero
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => {
            const Icon = categoryIcons[category] || FileText
            return (
              <div key={category}>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <span className="text-sm font-normal text-gray-500">
                    ({categoryTemplates.length})
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        {template.is_public && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Público
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">
                        {template.name}
                      </h3>

                      {template.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {template.usage_count || 0} usos
                        </span>
                        {template.template_data?.questions?.length && (
                          <span>
                            {template.template_data.questions.length} preguntas
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Usar Plantilla
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}