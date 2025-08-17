'use client'

import { useState, useEffect } from 'react'
import { eventsAPI, getUsersAPI, gymsAPI } from '@/lib/api'
import { toGymZonedISO, ensureEndAfterStart } from '@/lib/time'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function SessionsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sessionsList, setSessionsList] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [rangeStart, setRangeStart] = useState<Date | null>(null)
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Modal de creación de sesión
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [classesList, setClassesList] = useState<any[]>([])
  const [gymInfo, setGymInfo] = useState<any>(null)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sessionFormData, setSessionFormData] = useState({
    class_id: undefined as number | undefined,
    trainer_id: undefined as number | undefined,
    start_time: '',
    end_time: '',
    room: '',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    is_recurring: false,
    recurrence_pattern: '',
    override_capacity: '',
    override_enabled: false,
    notes: '',
  })

  // Selector de semanas
  const [weeks, setWeeks] = useState<Date[]>([])
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0)
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(-1) // -1 = todos dentro de semana

  const [trainers, setTrainers] = useState<any[]>([])
  const [loadingTrainers, setLoadingTrainers] = useState(false)

  const daysShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  // Función para verificar si un día ya pasó
  const isDayPast = (dayIndex: number) => {
    if (weeks.length === 0) return false
    
    const weekStart = weeks[selectedWeekIdx]
    const dayDate = new Date(weekStart)
    dayDate.setDate(weekStart.getDate() + dayIndex)
    dayDate.setHours(23, 59, 59, 999) // Fin del día
    
    const now = new Date()
    return dayDate < now
  }

  const generateWeeks = (baseDate: Date, count: number = 8) => {
    const monday = new Date(baseDate)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)) // Lunes europeo
    monday.setHours(0, 0, 0, 0) // Normalizar a medianoche
    const arr: Date[] = []
    for (let i = 0; i < count; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i * 7)
      d.setHours(0, 0, 0, 0)
      arr.push(d)
    }
    return arr
  }

  const formatYMD = (d: Date) => d.toISOString().slice(0, 10)

  const fetchSessionsInRange = async (start: Date, end: Date) => {
    try {
      setLoadingSessions(true)
      console.log('[DEBUG] Solicitando sesiones', formatYMD(start), '->', formatYMD(end))
      const data = await eventsAPI.getSessionsByDateRangeWithTimezone(formatYMD(start), formatYMD(end), { limit: 500 })
      console.log('[DEBUG] Sesiones recibidas:', data.length)
      setSessionsList(data)
      setRangeStart(start); setRangeEnd(end)
      if (data.length > 0 && weeks.length === 0) {
        setWeeks(generateWeeks(start))
        setSelectedWeekIdx(0); setSelectedDayIdx(-1)
      }
      if (trainers.length === 0) loadTrainers()
    } catch (err) { 
      console.error('Error cargando sesiones:', err) 
    } finally { 
      setLoadingSessions(false) 
    }
  }

  const ensureWeekInRange = async (weekDate: Date) => {
    if (!rangeStart || !rangeEnd || weekDate < rangeStart || weekDate > rangeEnd) {
      const newStart = new Date(weekDate)
      newStart.setDate(newStart.getDate() - 14)
      const newEnd = new Date(weekDate)
      newEnd.setDate(newEnd.getDate() + 30)
      await fetchSessionsInRange(newStart, newEnd)
    }
  }

  const loadTrainers = async () => {
    try {
      setLoadingTrainers(true)
      const data = await getUsersAPI.getGymPublicParticipants({ role: 'TRAINER' })
      setTrainers(data)
    } catch (err) {
      console.error('Error cargando entrenadores', err)
    } finally {
      setLoadingTrainers(false)
    }
  }

  const getTrainerName = (id: number) => {
    const trainer = trainers.find(t => t.id === id)
    return trainer ? `${trainer.first_name} ${trainer.last_name}` : 'Entrenador'
  }

  const calcDurationMinutes = (ses: any, clsFallback?: any): number => {
    if (ses.end_time_local || ses.end_time) {
      const start = new Date(ses.start_time_local || ses.start_time)
      const end = new Date(ses.end_time_local || ses.end_time)
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    }
    return clsFallback?.duration || 60
  }

  const formatWeekLabel = (start: Date) => {
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const startMonth = start.toLocaleDateString('es-ES', { month: 'short' })
    const endMonth = end.toLocaleDateString('es-ES', { month: 'short' })
    
    if (startMonth === endMonth) {
      return `${start.getDate()}-${end.getDate()} ${startMonth}`
    } else {
      return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`
    }
  }

  // Filtrar sesiones según selección
  const filteredSessions = sessionsList.filter(item => {
    const s = item.session ?? item
    const sessionDate = new Date(s.start_time_local || s.start_time)
    
    // Si no hay semanas configuradas, mostrar todas
    if (weeks.length === 0) return true
    
    // Obtener la semana seleccionada
    const weekStart = weeks[selectedWeekIdx]
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7) // Fin de semana (exclusivo)
    
    // Verificar que la sesión esté dentro de la semana seleccionada
    if (!(sessionDate >= weekStart && sessionDate < weekEnd)) return false
    
    // Si selectedDayIdx es -1, mostrar todos los días de la semana
    if (selectedDayIdx === -1) return true
    
    // Filtrar por día específico de la semana
    const dayOfWeek = (sessionDate.getDay() + 6) % 7 // Convertir domingo=0 a lunes=0
    return dayOfWeek === selectedDayIdx
  })

  const changeWeek = (dir: number) => {
    const newIdx = selectedWeekIdx + dir
    if (newIdx < 0) {
      const first = weeks[0]
      const prev = new Date(first)
      prev.setDate(first.getDate() - 7)
      setWeeks([prev, ...weeks])
      setSelectedWeekIdx(0)
    } else if (newIdx >= weeks.length) {
      const last = weeks[weeks.length - 1]
      const next = new Date(last)
      next.setDate(last.getDate() + 7)
      setWeeks([...weeks, next])
      setSelectedWeekIdx(newIdx)
    } else {
      setSelectedWeekIdx(newIdx)
    }
  }

  const formatDateTimeLocal = (d: Date) => {
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset * 60000)
    return local.toISOString().slice(0, 16)
  }

  const loadClasses = async () => {
    try {
      setLoadingClasses(true)
      const data = await eventsAPI.getClasses(true, { limit: 100 })
      setClassesList(data)
    } catch (err) {
      console.error('Error cargando clases:', err)
    } finally {
      setLoadingClasses(false)
    }
  }

  const openCreateModal = () => {
    // Definir fecha basada en selector
    let dt = new Date()
    
    if (weeks.length > selectedWeekIdx) {
      const weekStart = new Date(weeks[selectedWeekIdx])
      
      if (selectedDayIdx > -1) {
        // Si hay un día específico seleccionado, usar ese día
        const selectedDate = new Date(weekStart)
        selectedDate.setDate(weekStart.getDate() + selectedDayIdx)
        selectedDate.setHours(14, 0, 0, 0) // 2:00 PM por defecto
        dt = selectedDate
      } else {
        // Si está en "Todos", usar el primer día de la semana (lunes)
        const mondayDate = new Date(weekStart)
        mondayDate.setHours(14, 0, 0, 0) // 2:00 PM por defecto
        dt = mondayDate
      }
    } else {
      // Fallback: usar hoy si no hay semanas configuradas
      dt.setHours(14, 0, 0, 0) // 2:00 PM por defecto
    }

    console.log('📅 Fecha seleccionada para nueva sesión:', {
      selectedWeekIdx,
      selectedDayIdx,
      weekStart: weeks[selectedWeekIdx]?.toISOString().slice(0, 10),
      finalDate: dt.toISOString().slice(0, 16),
      dayName: selectedDayIdx > -1 ? daysShort[selectedDayIdx] : 'Lunes (primer día)'
    })

    setSessionFormData({
      class_id: undefined,
      trainer_id: undefined,
      start_time: formatDateTimeLocal(dt),
      end_time: '',
      room: '',
      status: 'scheduled',
      is_recurring: false,
      recurrence_pattern: '',
      override_capacity: '',
      override_enabled: false,
      notes: '',
    })
    setError(null)
    setShowCreateModal(true)
    
    // Cargar datos si no están cargados
    if (classesList.length === 0) loadClasses()
    if (trainers.length === 0) loadTrainers()
  }

  const handleCreateSession = async () => {
    if (!sessionFormData.class_id || !sessionFormData.trainer_id || !sessionFormData.start_time) {
      setError('Clase, entrenador y hora de inicio son obligatorios')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (!gymInfo?.timezone) {
        setError('No se pudo determinar la zona horaria del gimnasio. Selecciona un gimnasio e inténtalo de nuevo.')
        return
      }
      const toApiDate = (val: string) => {
        const tz = gymInfo.timezone as string
        return toGymZonedISO(val, tz, 'utc')
      }

      const payload: any = {
        class_id: sessionFormData.class_id,
        trainer_id: sessionFormData.trainer_id,
        start_time: toApiDate(sessionFormData.start_time),
        status: sessionFormData.status,
      }

      if (sessionFormData.end_time) {
        payload.end_time = toApiDate(sessionFormData.end_time)
        if (!ensureEndAfterStart(payload.start_time, payload.end_time)) {
          throw new Error('La hora de fin debe ser posterior a la de inicio')
        }
      }
      if (sessionFormData.room) payload.room = sessionFormData.room
      if (sessionFormData.is_recurring !== undefined) payload.is_recurring = sessionFormData.is_recurring
      if (sessionFormData.recurrence_pattern) payload.recurrence_pattern = sessionFormData.recurrence_pattern
      if (sessionFormData.override_enabled && sessionFormData.override_capacity !== '') {
        payload.override_capacity = Number(sessionFormData.override_capacity)
      }
      if (sessionFormData.notes) payload.notes = sessionFormData.notes

      const newSession = await eventsAPI.createSession(payload)
      
      // Añadir la nueva sesión a la lista
      setSessionsList(prev => [newSession, ...prev])
      
      // Mostrar mensaje de éxito
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
      
      // Cerrar modal
      setShowCreateModal(false)
    } catch (err: any) {
      console.error('Error creando sesión:', err)
      setError(`Error creando sesión: ${err?.message || 'Error desconocido'}`)
    } finally {
      setSaving(false)
    }
  }

  const loadGymInfo = async () => {
    try {
      const data = await gymsAPI.getGymInfo()
      setGymInfo(data)
    } catch (err) {
      console.error('Error cargando información del gimnasio:', err)
    }
  }

  useEffect(() => {
    // Inicializar con la semana actual
    const today = new Date()
    const thisWeek = generateWeeks(today, 1)[0]
    setWeeks([thisWeek])
    setSelectedWeekIdx(0)
    fetchSessionsInRange(thisWeek, new Date(thisWeek.getTime() + 6 * 24 * 60 * 60 * 1000))
    
    // Cargar información del gimnasio
    loadGymInfo()
  }, [])

  useEffect(() => {
    if (weeks.length > 0) {
      const currentWeek = weeks[selectedWeekIdx]
      ensureWeekInRange(currentWeek)
    }
  }, [selectedWeekIdx])

  useEffect(() => {
    // Verificar si hay mensaje de éxito
    if (searchParams?.get('success') === 'created') {
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    }
  }, [searchParams])

  if (loadingSessions && sessionsList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-sm text-green-800 font-medium">
              ¡Sesión creada exitosamente! 🎉
            </p>
          </div>
        </div>
      )}

      {/* Navegación de semanas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={() => changeWeek(-1)} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          {weeks.slice(selectedWeekIdx, selectedWeekIdx + 3).map((w, idx) => {
            const isActive = idx === 0
            return (
              <button 
                key={idx + selectedWeekIdx} 
                onClick={() => setSelectedWeekIdx(idx + selectedWeekIdx)} 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {formatWeekLabel(w)}
              </button>
            )
          })}
          
          <button 
            onClick={() => changeWeek(1)} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Selector diario */}
      {weeks.length > 0 && (
        <div className="flex justify-center items-center gap-2">
          <button 
            onClick={() => setSelectedDayIdx(-1)} 
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedDayIdx === -1 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Todos
          </button>
          {daysShort.map((d, idx) => {
            const isActive = idx === selectedDayIdx
            const isPast = isDayPast(idx)
            return (
              <button 
                key={d} 
                onClick={() => setSelectedDayIdx(idx)} 
                className={`relative px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : isPast
                    ? 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className={isPast ? 'line-through decoration-red-500 decoration-2' : ''}>
                  {d}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Botón Nueva sesión */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {weeks.length > 0 && (
            <span>
              Mostrando {filteredSessions.length} sesiones para la semana del {formatWeekLabel(weeks[selectedWeekIdx])}
              {selectedDayIdx !== -1 && ` (${daysShort[selectedDayIdx]})`}
            </span>
          )}
        </div>
                  <button
            onClick={openCreateModal}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva sesión
          </button>
      </div>

      {/* Lista de sesiones */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sesiones programadas</h3>
          <p className="text-gray-500 mb-6">
            {selectedDayIdx === -1 
              ? 'No hay sesiones en esta semana' 
              : `No hay sesiones el ${daysShort[selectedDayIdx]}`
            }
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Programar primera sesión
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map(item => {
            // Compatibilidad con nuevo formato { session, class_info }
            const s = item.session ?? item
            const c = item.class_info ?? undefined
            const start = new Date(s.start_time_local || s.start_time)
            const end = (s.end_time_local || s.end_time) ? new Date(s.end_time_local || s.end_time) : null
            const timeRange = `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}${end ? ' - ' + end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}`
            const statusCls = s.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : s.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            
            return (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 p-6 flex flex-col gap-4 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 truncate" title={c?.name || item.class_name || 'Clase'}>
                    {c?.name || item.class_name || 'Clase'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusCls}`}>
                    {s.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{start.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4" />
                    <span>{timeRange} · {calcDurationMinutes(s, c)} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserIcon className="w-4 h-4" />
                    <span>{getTrainerName(s.trainer_id)}</span>
                  </div>
                </div>

                {/* Cupos */}
                {c && (() => {
                  const registered = item.registered_count ?? s.current_participants ?? 0
                  const capacity = s.override_capacity || c.max_capacity || 0
                  const percent = capacity ? Math.min(100, Math.round((registered / capacity) * 100)) : 0
                  const isFull = item.is_full ?? (capacity && registered >= capacity)
                  
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>Cupos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            style={{ width: `${percent}%` }} 
                            className={`h-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{registered}/{capacity}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {isFull ? (
                          <XCircleIcon className="w-3 h-3 text-red-500" />
                        ) : (
                          <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        )}
                        <span>{isFull ? 'Sesión llena' : 'Espacios disponibles'}</span>
                      </div>
                    </div>
                  )
                })()}

                {/* Botones de acción */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Ver detalle"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    className="text-blue-400 hover:text-blue-600 transition-colors"
                    title="Editar sesión"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className="text-yellow-400 hover:text-yellow-600 transition-colors"
                    title="Cancelar sesión"
                  >
                    <ExclamationTriangleIcon className="w-4 h-4" />
                  </button>
                  <button 
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Eliminar sesión"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de creación de sesión */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Nueva Sesión</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Clase */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Clase *
                </label>
                {loadingClasses ? (
                  <div className="flex items-center justify-center py-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Cargando clases...</span>
                  </div>
                ) : (
                  <select
                    value={sessionFormData.class_id ?? ''}
                    onChange={e => setSessionFormData({
                      ...sessionFormData,
                      class_id: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una clase</option>
                    {classesList.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.duration} min, cap: {cls.max_capacity})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Entrenador */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Entrenador *
                </label>
                {loadingTrainers ? (
                  <div className="flex items-center justify-center py-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Cargando entrenadores...</span>
                  </div>
                ) : (
                  <select
                    value={sessionFormData.trainer_id ?? ''}
                    onChange={e => setSessionFormData({
                      ...sessionFormData,
                      trainer_id: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un entrenador</option>
                    {trainers.map(trainer => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.first_name || ''} {trainer.last_name || ''} (ID: {trainer.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Fecha y hora de inicio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha y hora de inicio *
                </label>
                {/* Indicación de fecha pre-seleccionada */}
                {weeks.length > 0 && (
                  <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    💡 Fecha pre-seleccionada: {selectedDayIdx > -1 
                      ? `${daysShort[selectedDayIdx]} de la semana ${formatWeekLabel(weeks[selectedWeekIdx])}`
                      : `Lunes de la semana ${formatWeekLabel(weeks[selectedWeekIdx])}`
                    }
                  </div>
                )}
                <input
                  type="datetime-local"
                  value={sessionFormData.start_time}
                  onChange={e => setSessionFormData({ ...sessionFormData, start_time: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {gymInfo?.timezone && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg mt-2">
                    🌍 Zona horaria del gimnasio: {gymInfo.timezone}
                  </p>
                )}
              </div>

              {/* Hora de fin personalizada */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!sessionFormData.end_time}
                    onChange={e => setSessionFormData({
                      ...sessionFormData,
                      end_time: e.target.checked ? sessionFormData.start_time : ''
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Establecer hora de fin manualmente
                  </span>
                </label>
                {sessionFormData.end_time && (
                  <input
                    type="datetime-local"
                    value={sessionFormData.end_time}
                    onChange={e => setSessionFormData({ ...sessionFormData, end_time: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Sala */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sala (opcional)
                </label>
                <input
                  type="text"
                  value={sessionFormData.room}
                  onChange={e => setSessionFormData({ ...sessionFormData, room: e.target.value })}
                  placeholder="Ej: Sala 1, Estudio principal..."
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Capacidad personalizada */}
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={sessionFormData.override_enabled}
                    onChange={e => setSessionFormData({
                      ...sessionFormData,
                      override_enabled: e.target.checked,
                      override_capacity: e.target.checked ? sessionFormData.override_capacity : ''
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Sobrescribir capacidad de la clase
                  </span>
                </label>
                {sessionFormData.override_enabled && (
                  <input
                    type="number"
                    min={0}
                    value={sessionFormData.override_capacity}
                    onChange={e => setSessionFormData({ ...sessionFormData, override_capacity: e.target.value })}
                    placeholder="Capacidad específica para esta sesión"
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Notas (opcional)
                </label>
                <textarea
                  value={sessionFormData.notes}
                  onChange={e => setSessionFormData({ ...sessionFormData, notes: e.target.value })}
                  placeholder="Instrucciones especiales, material necesario, etc..."
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={saving || !gymInfo?.timezone}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creando...
                    </div>
                  ) : (
                    'Crear sesión'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
