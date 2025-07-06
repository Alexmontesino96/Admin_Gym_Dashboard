'use client'

import { useState, useEffect } from 'react'
import { eventsAPI } from '@/lib/api'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function WeeklyHoursClient() {
  const [weeklyHours, setWeeklyHours] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()))

  const daysOfWeek = [
    { key: 0, name: 'Lunes', shortName: 'Lun' },
    { key: 1, name: 'Martes', shortName: 'Mar' },
    { key: 2, name: 'Miércoles', shortName: 'Mié' },
    { key: 3, name: 'Jueves', shortName: 'Jue' },
    { key: 4, name: 'Viernes', shortName: 'Vie' },
    { key: 5, name: 'Sábado', shortName: 'Sáb' },
    { key: 6, name: 'Domingo', shortName: 'Dom' },
  ]

  function getMonday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  const loadWeeklyHours = async (weekStart: Date) => {
    try {
      setLoading(true)
      setError(null)
      
      const endDate = addDays(weekStart, 6)
      const data = await eventsAPI.getGymHoursDateRange(
        formatDate(weekStart),
        formatDate(endDate)
      )
      
      setWeeklyHours(data)
    } catch (e: any) {
      console.error('Error cargando horarios semanales:', e)
      setError('Error al cargar los horarios de la semana')
    } finally {
      setLoading(false)
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = addDays(currentWeekStart, direction === 'next' ? 7 : -7)
    setCurrentWeekStart(newWeekStart)
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()))
  }

  const getWeekLabel = (weekStart: Date): string => {
    const endDate = addDays(weekStart, 6)
    const startMonth = weekStart.toLocaleDateString('es-ES', { month: 'short' })
    const endMonth = endDate.toLocaleDateString('es-ES', { month: 'short' })
    
    if (startMonth === endMonth) {
      return `${weekStart.getDate()}-${endDate.getDate()} ${startMonth}`
    } else {
      return `${weekStart.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth}`
    }
  }

  const getStatusBadge = (dayData: any) => {
    if (dayData.is_special_day) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          Especial
        </span>
      )
    } else if (dayData.is_closed) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Cerrado
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Abierto
        </span>
      )
    }
  }

  useEffect(() => {
    loadWeeklyHours(currentWeekStart)
  }, [currentWeekStart])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Vista Semanal</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Navega por las semanas para ver los horarios efectivos, incluyendo días especiales.
        </p>
      </div>

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

      {/* Navegación de semana */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek('prev')}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Anterior
          </button>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {getWeekLabel(currentWeekStart)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().getFullYear()}
            </p>
          </div>

          <button
            onClick={() => navigateWeek('next')}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Siguiente
            <ChevronRightIcon className="w-5 h-5 ml-1" />
          </button>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={goToCurrentWeek}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Ir a semana actual
          </button>
        </div>
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {daysOfWeek.map((dayInfo, index) => {
          const currentDate = addDays(currentWeekStart, index)
          const dayData = weeklyHours.find(h => {
            const hDate = new Date(h.date)
            return hDate.toDateString() === currentDate.toDateString()
          })

          const isToday = currentDate.toDateString() === new Date().toDateString()

          return (
            <div
              key={dayInfo.key}
              className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${
                isToday 
                  ? 'border-blue-200 ring-2 ring-blue-100' 
                  : 'border-gray-100 hover:shadow-md'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{dayInfo.shortName}</h3>
                    <p className="text-sm text-gray-500">
                      {currentDate.toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </p>
                  </div>
                  {isToday && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Hoy
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {dayData ? (
                    <>
                      <div className="flex justify-center">
                        {getStatusBadge(dayData)}
                      </div>

                      {!dayData.is_closed && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center text-sm text-gray-600">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            <span>
                              {dayData.open_time?.slice(0, 5) || '—'} - {dayData.close_time?.slice(0, 5) || '—'}
                            </span>
                          </div>
                        </div>
                      )}

                      {dayData.description && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600 text-center">
                            {dayData.description}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                        Sin datos
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Leyenda</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-gray-600">Abierto (horario regular)</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span className="text-gray-600">Día especial</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span className="text-gray-600">Cerrado</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-gray-600">Día actual</span>
          </div>
        </div>
      </div>
    </div>
  )
} 