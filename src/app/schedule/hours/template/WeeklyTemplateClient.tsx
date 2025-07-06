'use client'

import { useState, useEffect } from 'react'
import { eventsAPI } from '@/lib/api'
import { ClockIcon, CalendarDaysIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function WeeklyTemplateClient() {
  const [gymHours, setGymHours] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingDay, setEditingDay] = useState<any | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    is_closed: false,
    open_time: '',
    close_time: '',
  })
  const [saving, setSaving] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportData, setExportData] = useState({
    start_date: '',
    end_date: '',
    overwrite: false,
  })
  const [exporting, setExporting] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const daysOfWeek = [
    { key: 0, name: 'Lunes', shortName: 'Lun' },
    { key: 1, name: 'Martes', shortName: 'Mar' },
    { key: 2, name: 'Miércoles', shortName: 'Mié' },
    { key: 3, name: 'Jueves', shortName: 'Jue' },
    { key: 4, name: 'Viernes', shortName: 'Vie' },
    { key: 5, name: 'Sábado', shortName: 'Sáb' },
    { key: 6, name: 'Domingo', shortName: 'Dom' },
  ]

  const loadGymHours = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await eventsAPI.getGymHoursRegular()
      setGymHours(data)
    } catch (e: any) {
      console.error('Error cargando horarios:', e)
      setError('Error al cargar los horarios')
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (day: any) => {
    setEditingDay(day)
    setEditFormData({
      is_closed: day.is_closed || false,
      open_time: day.open_time?.slice(0, 5) || '',
      close_time: day.close_time?.slice(0, 5) || '',
    })
    setShowEditModal(true)
    setError(null)
  }

  const handleSave = async () => {
    if (!editingDay) return

    if (!editFormData.is_closed) {
      if (!editFormData.open_time || !editFormData.close_time) {
        setError('Los horarios son requeridos cuando el día está abierto')
        return
      }
      if (editFormData.open_time >= editFormData.close_time) {
        setError('La hora de cierre debe ser posterior a la de apertura')
        return
      }
    }

    try {
      setSaving(true)
      setError(null)

      const payload: any = {
        is_closed: editFormData.is_closed,
      }

      if (!editFormData.is_closed) {
        payload.open_time = editFormData.open_time
        payload.close_time = editFormData.close_time
      }

      await eventsAPI.updateGymHoursByDay(editingDay.day_of_week, payload)
      setShowEditModal(false)
      await loadGymHours()
    } catch (e: any) {
      console.error('Error guardando horarios:', e)
      setError('Error al guardar los horarios')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    if (!exportData.start_date || !exportData.end_date) {
      setError('Las fechas son requeridas')
      return
    }

    if (exportData.start_date >= exportData.end_date) {
      setError('La fecha de fin debe ser posterior a la de inicio')
      return
    }

    try {
      setExporting(true)
      setError(null)
      await eventsAPI.applyGymHoursDefaults(
        exportData.start_date,
        exportData.end_date,
        exportData.overwrite
      )
      setShowExportModal(false)
      setExportData({ start_date: '', end_date: '', overwrite: false })
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (e: any) {
      console.error('Error exportando plantilla:', e)
      setError('Error al exportar la plantilla')
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    loadGymHours()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Botón de exportar */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowExportModal(true)}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm"
        >
          <CalendarDaysIcon className="w-5 h-5 mr-2" />
          Exportar a rango de fechas
        </button>
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOfWeek.map((dayInfo) => {
          const dayData = gymHours.find((h) => h.day_of_week === dayInfo.key)
          const isOpen = dayData && !dayData.is_closed
          
          return (
            <div
              key={dayInfo.key}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{dayInfo.name}</h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>

                {isOpen && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>Apertura: <span className="font-medium text-gray-900">{dayData.open_time?.slice(0, 5) || '—'}</span></span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>Cierre: <span className="font-medium text-gray-900">{dayData.close_time?.slice(0, 5) || '—'}</span></span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => openEditModal(dayData || { day_of_week: dayInfo.key, is_closed: true })}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  Editar horario
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Editar {daysOfWeek.find(d => d.key === editingDay?.day_of_week)?.name}
              </h3>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.is_closed}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        is_closed: e.target.checked,
                        open_time: '',
                        close_time: '',
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Día cerrado</span>
                </label>

                {!editFormData.is_closed && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora apertura
                      </label>
                      <input
                        type="time"
                        value={editFormData.open_time}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, open_time: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!editFormData.is_closed}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora cierre
                      </label>
                      <input
                        type="time"
                        value={editFormData.close_time}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, close_time: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!editFormData.is_closed}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de exportar */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Exportar plantilla a rango de fechas
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={exportData.start_date}
                    onChange={(e) =>
                      setExportData({ ...exportData, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    value={exportData.end_date}
                    onChange={(e) =>
                      setExportData({ ...exportData, end_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportData.overwrite}
                    onChange={(e) =>
                      setExportData({ ...exportData, overwrite: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Sobrescribir días especiales existentes
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {exporting ? 'Exportando...' : 'Exportar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast de éxito */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm font-medium text-green-800">
              Plantilla exportada exitosamente
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 