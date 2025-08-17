'use client'

import { useState, useEffect } from 'react'
import { eventsAPI, getUsersAPI, gymsAPI } from '@/lib/api'
import { toGymZonedISO, ensureEndAfterStart } from '@/lib/time'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateSessionClient() {
  const router = useRouter()
  const [classesList, setClassesList] = useState<any[]>([])
  const [trainers, setTrainers] = useState<any[]>([])
  const [gymInfo, setGymInfo] = useState<any>(null)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingTrainers, setLoadingTrainers] = useState(false)
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

  const loadTrainers = async () => {
    try {
      setLoadingTrainers(true)
      const data = await getUsersAPI.getGymPublicParticipants({ role: 'TRAINER' })
      setTrainers(data)
    } catch (err) {
      console.error('Error cargando entrenadores:', err)
    } finally {
      setLoadingTrainers(false)
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
        // Convertir desde hora local del gimnasio a ISO UTC con zona
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
        // Validación simple: end > start
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

      await eventsAPI.createSession(payload)
      
      // Redirigir a la lista de sesiones con mensaje de éxito
      router.push('/schedule/sessions?success=created')
    } catch (err: any) {
      console.error('Error creando sesión:', err)
      setError(`Error creando sesión: ${err?.message || 'Error desconocido'}`)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    // Inicializar con fecha y hora por defecto
    const now = new Date()
    now.setHours(14, 0, 0, 0) // 2:00 PM por defecto
    setSessionFormData(prev => ({
      ...prev,
      start_time: formatDateTimeLocal(now)
    }))

    // Cargar datos
    loadClasses()
    loadTrainers()
    loadGymInfo()
  }, [])

  const selectedClass = classesList.find(c => c.id === sessionFormData.class_id)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
          <input
            type="datetime-local"
            value={sessionFormData.start_time}
            onChange={e => setSessionFormData({ ...sessionFormData, start_time: e.target.value })}
            className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {gymInfo?.timezone && (
            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
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
          {selectedClass && (
            <p className="text-xs text-gray-500">
              💡 Si no estableces hora de fin, se calculará automáticamente sumando {selectedClass.duration} minutos a la hora de inicio
            </p>
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
          {selectedClass && !sessionFormData.override_enabled && (
            <p className="text-xs text-gray-500">
              Capacidad de la clase: {selectedClass.max_capacity} participantes
            </p>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            value={sessionFormData.status}
            onChange={e => setSessionFormData({
              ...sessionFormData,
              status: e.target.value as any
            })}
            className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="scheduled">Programada</option>
            <option value="in_progress">En curso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Recurrencia */}
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={sessionFormData.is_recurring}
              onChange={e => setSessionFormData({
                ...sessionFormData,
                is_recurring: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Sesión recurrente
            </span>
          </label>
          {sessionFormData.is_recurring && (
            <input
              type="text"
              value={sessionFormData.recurrence_pattern}
              onChange={e => setSessionFormData({ ...sessionFormData, recurrence_pattern: e.target.value })}
              placeholder="Patrón de recurrencia (ej: WEEKLY:1,3,5)"
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
          <Link
            href="/schedule/sessions"
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors duration-200"
          >
            Cancelar
          </Link>
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
  )
} 
