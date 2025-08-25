'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Survey, 
  SurveyStatus, 
  surveysAPI, 
  getSurveyStatusConfig,
  formatSurveyDate
} from '@/lib/api'
import { 
  PlusCircle, 
  BarChart3, 
  FileText, 
  Users, 
  Clock,
  MoreVertical,
  Edit,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Download,
  Search,
  Filter
} from 'lucide-react'

const SurveysSkeleton = () => (
  <div className="space-y-6">
    <div className="mb-8">
      <div className="h-9 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default function SurveysClient() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'all'>('all')
  const [showActions, setShowActions] = useState<number | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    totalResponses: 0,
    avgCompletion: 0
  })

  useEffect(() => {
    loadSurveys()
  }, [statusFilter])

  const loadSurveys = async () => {
    try {
      setLoading(true)
      const statusParam = statusFilter !== 'all' ? statusFilter : undefined
      const data = await surveysAPI.getMySurveys(statusParam)
      setSurveys(data)
      
      // Calcular estadísticas
      const published = data.filter(s => s.status === SurveyStatus.PUBLISHED).length
      const totalResponses = data.reduce((sum, s) => sum + (s.response_count || 0), 0)
      const avgCompletion = 0 // Se obtendría de las estadísticas individuales si es necesario

      setStats({
        total: data.length,
        published,
        totalResponses,
        avgCompletion
      })
    } catch (err) {
      console.error('Error al cargar encuestas:', err)
      setError('Error al cargar las encuestas')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (surveyId: number) => {
    try {
      await surveysAPI.publish(surveyId)
      await loadSurveys()
      setShowActions(null)
    } catch (err) {
      console.error('Error al publicar encuesta:', err)
      alert('Error al publicar la encuesta')
    }
  }

  const handleClose = async (surveyId: number) => {
    try {
      await surveysAPI.close(surveyId)
      await loadSurveys()
      setShowActions(null)
    } catch (err) {
      console.error('Error al cerrar encuesta:', err)
      alert('Error al cerrar la encuesta')
    }
  }

  // Archive y Duplicate no están disponibles en la API actual

  const handleDelete = async (surveyId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta encuesta? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await surveysAPI.delete(surveyId)
      await loadSurveys()
      setShowActions(null)
    } catch (err) {
      console.error('Error al eliminar encuesta:', err)
      alert('Error al eliminar la encuesta. Solo se pueden eliminar encuestas sin respuestas.')
    }
  }

  const handleExport = async (surveyId: number) => {
    try {
      const blob = await surveysAPI.exportData(surveyId, 'excel')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `encuesta_${surveyId}_respuestas.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error al exportar:', err)
      alert('Error al exportar los datos')
    }
  }

  const filteredSurveys = surveys.filter(survey => 
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <SurveysSkeleton />

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadSurveys}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📋 Encuestas</h1>
        <p className="text-gray-600 mt-2">Crea y gestiona encuestas para obtener feedback de tus miembros</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Encuestas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Unlock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Publicadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Respuestas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasa Completación</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgCompletion)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar encuestas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SurveyStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value={SurveyStatus.DRAFT}>Borradores</option>
                <option value={SurveyStatus.PUBLISHED}>Publicadas</option>
                <option value={SurveyStatus.CLOSED}>Cerradas</option>
                <option value={SurveyStatus.ARCHIVED}>Archivadas</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              href="/surveys/templates"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Plantillas
            </Link>
            <Link
              href="/surveys/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Crear Encuesta
            </Link>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredSurveys.length} {filteredSurveys.length === 1 ? 'Encuesta' : 'Encuestas'}
          </h2>
        </div>

        {filteredSurveys.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No hay encuestas aún</p>
            <Link
              href="/surveys/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" />
              Crear Primera Encuesta
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSurveys.map((survey) => {
              const statusConfig = getSurveyStatusConfig(survey.status)
              return (
                <div key={survey.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {survey.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${statusConfig.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                          ${statusConfig.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                          ${statusConfig.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                          ${statusConfig.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
                        `}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                      </div>

                      {survey.description && (
                        <p className="text-sm text-gray-600 mb-2">{survey.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {survey.response_count || 0} respuestas
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatSurveyDate(survey.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Quick Actions */}
                      {survey.status === SurveyStatus.PUBLISHED && (
                        <button
                          onClick={() => router.push(`/surveys/${survey.id}/statistics`)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver estadísticas"
                        >
                          <BarChart3 className="h-5 w-5" />
                        </button>
                      )}

                      {survey.response_count && survey.response_count > 0 && (
                        <button
                          onClick={() => handleExport(survey.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Exportar respuestas"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      )}

                      {/* Actions Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === survey.id ? null : survey.id)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {showActions === survey.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => router.push(`/surveys/${survey.id}`)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Eye className="h-4 w-4" />
                                Ver Detalles
                              </button>

                              {survey.status === SurveyStatus.DRAFT && (
                                <>
                                  <button
                                    onClick={() => router.push(`/surveys/${survey.id}/edit`)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handlePublish(survey.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                  >
                                    <Unlock className="h-4 w-4" />
                                    Publicar
                                  </button>
                                </>
                              )}

                              {survey.status === SurveyStatus.PUBLISHED && (
                                <>
                                  <button
                                    onClick={() => router.push(`/surveys/${survey.id}/responses`)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Users className="h-4 w-4" />
                                    Ver Respuestas
                                  </button>
                                  <button
                                    onClick={() => handleClose(survey.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 w-full text-left"
                                  >
                                    <Lock className="h-4 w-4" />
                                    Cerrar
                                  </button>
                                </>
                              )}


                              {survey.status === SurveyStatus.DRAFT && (!survey.response_count || survey.response_count === 0) && (
                                <button
                                  onClick={() => handleDelete(survey.id)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Eliminar
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}