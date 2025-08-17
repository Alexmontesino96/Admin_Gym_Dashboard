'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Event, eventsAPI, EventUpdateData, EventCreateData, getUsersAPI, GymParticipant, gymsAPI } from '@/lib/api'
import { toGymZonedISO, ensureEndAfterStart } from '@/lib/time'
import EventChatModal from '@/components/EventChatModal'
import EventChatButton from '@/components/EventChatButton'

// Skeleton UI detallado para eventos
const EventsSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="mb-8">
      <div className="h-9 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
    </div>

    {/* Controls skeleton */}
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
        <div className="sm:w-48">
          <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Stats skeleton */}
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

    {/* Events list skeleton */}
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function EventsClient() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editFormData, setEditFormData] = useState<EventUpdateData>({})
  const [saving, setSaving] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [notificationColor, setNotificationColor] = useState<'green' | 'red'>('green')
  const [createFormData, setCreateFormData] = useState<EventCreateData>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: 0,
  })

  // Estados para eliminación de eventos
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Estados para chat inicial opcional al crear evento
  const [includeChat, setIncludeChat] = useState(false)
  const [firstMessageChat, setFirstMessageChat] = useState('Hello Everyone')
  const [gymInfo, setGymInfo] = useState<any | null>(null)

  // Estados para registro masivo
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [usersForBulk, setUsersForBulk] = useState<GymParticipant[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)

  // Participaciones
  const [participantsCache, setParticipantsCache] = useState<Record<number, any[]>>({})
  const [tooltipEventId, setTooltipEventId] = useState<number | null>(null)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const [waitingListCounts, setWaitingListCounts] = useState<Record<number, number>>({})

  // Estados para chat
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatEvent, setChatEvent] = useState<Event | null>(null)

  // Memoizar el filtro para evitar re-renders innecesarios
  const statusFilterMemo = useMemo(() => statusFilter, [statusFilter])

  // Funciones optimizadas con useCallback
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Cargar info del gym para conocer su timezone (si no está)
      if (!gymInfo) {
        try { setGymInfo(await gymsAPI.getGymInfo()) } catch (e) { console.warn('No se pudo obtener gymInfo:', e) }
      }
      
      const params: any = {}
      if (statusFilterMemo !== 'all') {
        params.status = statusFilterMemo
      }
      
      const data = await eventsAPI.getEvents(params)
      console.log('Eventos cargados:', data.map(e => ({ id: e.id, title: e.title, status: e.status })))
      setEvents(data)
    } catch (err: any) {
      console.error('Error cargando eventos:', err)
      
      // Manejar diferentes tipos de errores
      if (err.message && err.message.includes('401')) {
        setError('Sesión expirada. Por favor, recarga la página o inicia sesión nuevamente.')
      } else if (err.message && err.message.includes('403')) {
        setError('No tienes permisos para ver los eventos.')
      } else if (err.message && err.message.includes('500')) {
        setError('Error del servidor. Por favor, intenta más tarde.')
      } else {
        setError('Error al cargar los eventos. Verifica tu conexión a internet.')
      }
    } finally {
      setLoading(false)
    }
  }, [statusFilterMemo])

  // Solo cargar cuando cambie realmente el filtro
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Filtrar eventos de manera optimizada
  const filteredEvents = useMemo(() => 
    events.filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    }), [events, searchTerm])

  // Funciones de formateo memoizadas
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [])

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Programado'
      case 'CANCELLED': return 'Cancelado'
      case 'COMPLETED': return 'Completado'
      default: return status
    }
  }, [])

  const openModal = useCallback((event: Event) => {
    setSelectedEvent(event)
    setShowModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedEvent(null)
    setShowModal(false)
  }, [])

  const openEditModal = (event: Event) => {
    // Debug: Log del evento y su estado
    console.log('Intentando editar evento:', {
      id: event.id,
      title: event.title,
      status: event.status,
      canEdit: event.status !== 'COMPLETED'
    })
    
    // No permitir editar eventos completados
    if (event.status === 'COMPLETED') {
      setError('No se pueden editar eventos completados')
      return
    }
    
    // Limpiar cualquier error previo
    setError(null)
    
    setEditingEvent(event)
    setEditFormData({
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      max_participants: event.max_participants,
      status: event.status,
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setEditingEvent(null)
    setEditFormData({})
    setShowEditModal(false)
  }

  const handleEditFormChange = (field: keyof EventUpdateData, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveEvent = async () => {
    if (!editingEvent) return

    try {
      setSaving(true)
      
      // Solo enviar campos que han cambiado
      const changedFields: EventUpdateData = {}
      if (editFormData.title !== editingEvent.title) changedFields.title = editFormData.title
      if (editFormData.description !== editingEvent.description) changedFields.description = editFormData.description
      if (editFormData.start_time !== editingEvent.start_time) changedFields.start_time = editFormData.start_time
      if (editFormData.end_time !== editingEvent.end_time) changedFields.end_time = editFormData.end_time
      if (editFormData.location !== editingEvent.location) changedFields.location = editFormData.location
      if (editFormData.max_participants !== editingEvent.max_participants) changedFields.max_participants = editFormData.max_participants
      if (editFormData.status !== editingEvent.status) changedFields.status = editFormData.status

      if (Object.keys(changedFields).length === 0) {
        closeEditModal()
        return
      }

      // Convertir datetimes si están presentes
      const tz = gymInfo?.timezone || 'UTC'
      const payload: EventUpdateData = { ...changedFields }
      if (payload.start_time) payload.start_time = toGymZonedISO(payload.start_time as string, tz, 'utc')
      if (payload.end_time) {
        payload.end_time = toGymZonedISO(payload.end_time as string, tz, 'utc')
        if (payload.start_time && !ensureEndAfterStart(payload.start_time, payload.end_time)) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
        }
      }

      const updatedEvent = await eventsAPI.updateEvent(editingEvent.id, payload)
      
      // Actualizar la lista de eventos
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ))
      
      // Mostrar mensaje de éxito
      setNotificationColor('green')
      setSuccessMessage(`Evento "${updatedEvent.title}" actualizado exitosamente`)
      setShowSuccessMessage(true)
      
      // Ocultar mensaje después de 4 segundos
      setTimeout(() => {
        setShowSuccessMessage(false)
        setSuccessMessage('')
      }, 4000)
      
      closeEditModal()
    } catch (err: any) {
      console.error('Error actualizando evento:', err)
      
      // Manejar errores específicos
      if (err.message && err.message.includes('Cannot update completed events')) {
        setError('No se pueden editar eventos completados')
      } else if (err.message && err.message.includes('400')) {
        setError('Error de validación: Verifica que todos los campos estén correctos')
      } else {
        setError('Error al actualizar el evento')
      }
    } finally {
      setSaving(false)
    }
  }

  const formatDateTimeForInput = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  const openCreateModal = () => {
    setError(null)
    setCreateFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      max_participants: 0,
    })
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    setCreateFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      max_participants: 0,
    })
    setShowCreateModal(false)
  }

  const handleCreateFormChange = (field: keyof EventCreateData, value: any) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateEvent = async () => {
    try {
      setSaving(true)
      
      // Validar campos requeridos
      if (!createFormData.title || !createFormData.start_time || !createFormData.end_time) {
        setError('Por favor, completa los campos requeridos')
        return
      }

      // Validar que la fecha de fin sea posterior a la de inicio
      if (new Date(createFormData.end_time) <= new Date(createFormData.start_time)) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio')
        return
      }

      // Validar mensaje si se incluye chat
      if (includeChat && firstMessageChat.trim() === '') {
        setError('Escribe un mensaje inicial para el chat o desmarca la opción')
        return
      }

      // Convertir fechas a ISO con zona horaria del gym
      const tz = gymInfo?.timezone || 'UTC'
      const startISO = toGymZonedISO(createFormData.start_time, tz, 'utc')
      const endISO = toGymZonedISO(createFormData.end_time, tz, 'utc')
      if (!ensureEndAfterStart(startISO, endISO)) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio')
        return
      }
      const payload: any = {
        ...createFormData,
        start_time: startISO,
        end_time: endISO,
      }
      if (includeChat) {
        payload.first_message_chat = firstMessageChat.trim()
      }

      const newEvent = await eventsAPI.createEvent(payload)
      
      // Añadir el nuevo evento a la lista
      setEvents(prev => [newEvent, ...prev])
      
      // Mostrar mensaje de éxito
      setNotificationColor('green')
      setSuccessMessage(`Evento "${newEvent.title}" creado exitosamente`)
      setShowSuccessMessage(true)
      
      // Ocultar mensaje después de 4 segundos
      setTimeout(() => {
        setShowSuccessMessage(false)
        setSuccessMessage('')
      }, 4000)
      
      closeCreateModal()
      setError(null)
    } catch (err: any) {
      console.error('Error creando evento:', err)
      
      // Manejar errores específicos
      if (err.message && err.message.includes('403')) {
        setError('No tienes permisos para crear eventos')
      } else if (err.message && err.message.includes('400')) {
        setError('Error de validación: Verifica que todos los campos estén correctos')
      } else {
        setError('Error al crear el evento')
      }
    } finally {
      setSaving(false)
    }
  }

  // Abrir modal de confirmación para eliminar
  const openDeleteConfirm = (event: Event) => {
    setDeletingEvent(event)
    setShowDeleteConfirm(true)
  }

  // Cerrar modal de confirmación
  const closeDeleteConfirm = () => {
    setDeletingEvent(null)
    setShowDeleteConfirm(false)
  }

  // Eliminar evento
  const handleDeleteEvent = async () => {
    if (!deletingEvent) return
    try {
      setDeleting(true)
      await eventsAPI.deleteEvent(deletingEvent.id)

      // Actualizar lista quitando evento
      setEvents(prev => prev.filter(e => e.id !== deletingEvent.id))

      // Notificación de éxito en rojo
      setNotificationColor('red')
      setSuccessMessage(`Evento "${deletingEvent.title}" eliminado exitosamente`)
      setShowSuccessMessage(true)

      setTimeout(() => {
        setShowSuccessMessage(false)
        setSuccessMessage('')
      }, 4000)

      closeDeleteConfirm()
    } catch (err: any) {
      console.error('Error eliminando evento:', err)
      if (err.message && err.message.includes('403')) {
        setError('No tienes permisos para eliminar este evento')
      } else if (err.message && err.message.includes('404')) {
        setError('Evento no encontrado o ya eliminado')
      } else {
        setError('Error al eliminar el evento')
      }
    } finally {
      setDeleting(false)
    }
  }

  const openBulkModal = async (event: Event) => {
    setSelectedEvent(event)
    setShowBulkModal(true)
    setSelectedUserIds([])
    if (usersForBulk.length === 0) {
      try {
        setLoadingUsers(true)
        const users = await getUsersAPI.getGymParticipants()
        setUsersForBulk(users)
      } catch (err: any) {
        console.error('Error cargando usuarios:', err)
        setError('No se pudieron cargar los usuarios')
      } finally {
        setLoadingUsers(false)
      }
    }
  }

  const closeBulkModal = () => {
    setShowBulkModal(false)
    setSelectedUserIds([])
  }

  const toggleUserSelection = (id: number) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])
  }

  const handleBulkRegister = async () => {
    if (!selectedEvent) return
    if (selectedUserIds.length === 0) {
      setError('Selecciona al menos un usuario')
      return
    }
    try {
      setBulkSaving(true)
      await eventsAPI.bulkRegisterParticipants(selectedEvent.id, selectedUserIds)
      setNotificationColor('green')
      setSuccessMessage('Participantes registrados exitosamente')
      setShowSuccessMessage(true)
      setTimeout(() => { setShowSuccessMessage(false); setSuccessMessage('') }, 4000)
      closeBulkModal()
      // refrescar lista
      loadEvents()
    } catch (err: any) {
      console.error('Error registro masivo:', err)
      setError(err.message || 'Error al registrar participantes')
    } finally {
      setBulkSaving(false)
    }
  }

  const fetchParticipants = async (eventId: number) => {
    if (participantsCache[eventId]) return
    try {
      const parts = await eventsAPI.getEventParticipations(eventId)
      setParticipantsCache(prev => ({ ...prev, [eventId]: parts }))
      const wait = parts.filter((p: any) => p.status === 'WAITING_LIST').length
      setWaitingListCounts(prev => ({ ...prev, [eventId]: wait }))

      // cargar usuarios si no tenemos aún
      if (usersForBulk.length === 0) {
        const users = await getUsersAPI.getGymParticipants()
        setUsersForBulk(users)
      }
    } catch (err) {
      console.error('Error obteniendo participantes:', err)
    }
  }

  const getUserInfoText = (id: number) => {
    const user = usersForBulk.find(u => u.id === id)
    if (!user) return `ID ${id}`
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || `ID ${id}`
    return `${name} - ${user.gym_role || user.role || ''}`
  }

  const statusBadge = (status: string) => {
    const map: Record<string,string> = {
      REGISTERED: 'bg-green-100 text-green-800',
      WAITING_LIST: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status === 'WAITING_LIST' ? 'En espera' : status}</span>
  }

  // Funciones para chat
  const openChatModal = (event: Event) => {
    setChatEvent(event)
    setShowChatModal(true)
  }

  const closeChatModal = () => {
    setChatEvent(null)
    setShowChatModal(false)
  }

  // Mostrar skeleton mientras carga
  if (loading) {
    return <EventsSkeleton />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={loadEvents}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
              >
                Intentar de nuevo
              </button>
              {error.includes('Sesión expirada') && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-100 px-3 py-2 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  Recargar página
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Notificación de éxito */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`${notificationColor === 'red' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'} rounded-lg shadow-lg overflow-hidden max-w-md`}>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${notificationColor === 'red' ? 'text-red-400' : 'text-green-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${notificationColor === 'red' ? 'text-red-800' : 'text-green-800'}`}>
                    {successMessage}
                  </p>
                </div>
                <div className="ml-3">
                  <button
                    onClick={() => {
                      setShowSuccessMessage(false)
                      setSuccessMessage('')
                    }}
                    className={`inline-flex ${notificationColor === 'red' ? 'text-red-400 hover:text-red-500' : 'text-green-400 hover:text-green-500'} focus:outline-none`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {/* Barra de progreso */}
            <div className={`h-1 ${notificationColor === 'red' ? 'bg-red-200' : 'bg-green-200'}`}>
              <div className={`h-full ${notificationColor === 'red' ? 'bg-red-400' : 'bg-green-400'} animate-pulse`} style={{
                animation: 'shrink 4s linear forwards'
              }}></div>
            </div>
          </div>
        </div>
      )}
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar eventos
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, descripción o ubicación..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="SCHEDULED">Programado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="COMPLETED">Completado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Eventos</p>
              <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {events.filter(e => e.status === 'SCHEDULED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {events.filter(e => e.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Participantes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {events.reduce((sum, event) => sum + event.participants_count, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Eventos ({filteredEvents.length})
          </h3>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Evento
          </button>
        </div>
        
        {filteredEvents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron eventos con los filtros aplicados.'
                : 'Aún no hay eventos registrados en el sistema.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => openModal(event)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.start_time)}
                      </span>
                      <span className="flex items-center">
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </span>
                      <span
                        className="flex items-center relative text-blue-600"
                        onMouseEnter={() => { fetchParticipants(event.id); setTooltipEventId(event.id) }}
                        onMouseLeave={() => setTooltipEventId(null)}
                        onClick={(e) => { e.stopPropagation(); fetchParticipants(event.id); setSelectedEvent(event); setShowParticipantsModal(true) }}
                      >
                        <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {event.participants_count}/{event.max_participants || '∞'} participantes
                        {waitingListCounts[event.id] > 0 && (
                          <span className="ml-1 text-xs text-yellow-600">(+{waitingListCounts[event.id]} espera)</span>
                        )}

                        {tooltipEventId === event.id && participantsCache[event.id] && (
                          <div className="absolute left-0 top-8 z-50 bg-white border border-gray-300 text-xs rounded-md shadow-lg p-2 max-h-40 overflow-y-auto min-w-[150px]">
                            {participantsCache[event.id].length === 0 ? (
                              <p className="text-gray-500">Sin participantes</p>
                            ) : (
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Nombre</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Rol</th>
                                    <th className="px-4 py-2"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {participantsCache[event.id].map(p => {
                                    const user = usersForBulk.find(u => u.id === p.member_id)
                                    const name = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || `ID ${user.id}` : `ID ${p.member_id}`
                                    const role = user ? (user.gym_role || user.role) : ''
                                    return (
                                      <tr key={p.id}>
                                        <td className="px-4 py-2 text-gray-700 whitespace-nowrap flex items-center space-x-2">
                                          <span>{name}</span>{statusBadge(p.status)}
                                        </td>
                                        <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{role}</td>
                                        <td className="px-4 py-2 text-right">
                                          <a
                                            href={`/usuarios/${p.member_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-2 py-1 border border-blue-300 shadow-sm text-xs leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none"
                                          >
                                            Ver perfil
                                          </a>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openChatModal(event)
                      }}
                      title="Abrir chat del evento"
                      className="inline-flex items-center p-2 border border-purple-300 shadow-sm rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(event)
                      }}
                      disabled={event.status === 'COMPLETED'}
                      className={`inline-flex items-center justify-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-[100px] ${
                        event.status === 'COMPLETED'
                          ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500'
                      }`}
                      title={event.status === 'COMPLETED' ? 'No se pueden editar eventos completados' : 'Editar evento'}
                    >
                      {event.status === 'COMPLETED' ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Bloqueado
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openBulkModal(event)
                      }}
                      title="Registrar participantes"
                      className="inline-flex items-center p-2 border border-teal-300 shadow-sm rounded-md text-teal-700 bg-teal-50 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h8" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12h-4m2 2v-4" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openModal(event)
                      }}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[120px]"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalles
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openDeleteConfirm(event)
                      }}
                      className="inline-flex items-center p-2 border border-red-300 shadow-sm rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Eliminar evento"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-7 3h10" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles del evento */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Detalles del Evento
                      </h3>
                      {/* Botón de registro masivo trasladado a la lista principal */}
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {selectedEvent.title}
                        </h4>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                            {getStatusLabel(selectedEvent.status)}
                          </span>
                          {selectedEvent.status === 'COMPLETED' && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              No editable
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Fecha y hora de inicio</h5>
                          <p className="text-gray-600">{formatDate(selectedEvent.start_time)}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Fecha y hora de fin</h5>
                          <p className="text-gray-600">{formatDate(selectedEvent.end_time)}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Ubicación</h5>
                          <p className="text-gray-600">{selectedEvent.location}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Participantes</h5>
                          <p className="text-gray-600">
                            {selectedEvent.participants_count} / {selectedEvent.max_participants || '∞'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Descripción</h5>
                        <p className="text-gray-600 whitespace-pre-wrap">{selectedEvent.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Creado</h5>
                          <p className="text-sm text-gray-500">{formatDate(selectedEvent.created_at)}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Última actualización</h5>
                          <p className="text-sm text-gray-500">{formatDate(selectedEvent.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de evento */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeEditModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Editar Evento
                      </h3>
                      <button
                        onClick={closeEditModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                            Título *
                          </label>
                          <input
                            type="text"
                            id="edit-title"
                            value={editFormData.title || ''}
                            onChange={(e) => handleEditFormChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-start-time" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha y hora de inicio *
                          </label>
                          <input
                            type="datetime-local"
                            id="edit-start-time"
                            value={editFormData.start_time ? formatDateTimeForInput(editFormData.start_time) : ''}
                            onChange={(e) => handleEditFormChange('start_time', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-end-time" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha y hora de fin *
                          </label>
                          <input
                            type="datetime-local"
                            id="edit-end-time"
                            value={editFormData.end_time ? formatDateTimeForInput(editFormData.end_time) : ''}
                            onChange={(e) => handleEditFormChange('end_time', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-2">
                            Ubicación *
                          </label>
                          <input
                            type="text"
                            id="edit-location"
                            value={editFormData.location || ''}
                            onChange={(e) => handleEditFormChange('location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-max-participants" className="block text-sm font-medium text-gray-700 mb-2">
                            Máximo participantes
                          </label>
                          <input
                            type="number"
                            id="edit-max-participants"
                            value={editFormData.max_participants || 0}
                            onChange={(e) => handleEditFormChange('max_participants', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="mt-1 text-sm text-gray-500">0 = Sin límite</p>
                        </div>

                        <div>
                          <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                          </label>
                          <select
                            id="edit-status"
                            value={editFormData.status || ''}
                            onChange={(e) => handleEditFormChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="SCHEDULED">Programado</option>
                            <option value="CANCELLED">Cancelado</option>
                            <option value="COMPLETED">Completado</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción *
                          </label>
                          <textarea
                            id="edit-description"
                            rows={4}
                            value={editFormData.description || ''}
                            onChange={(e) => handleEditFormChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>


                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSaveEvent}
                  disabled={saving}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
                <button
                  onClick={closeEditModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación de evento */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeCreateModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Crear Nuevo Evento
                      </h3>
                      <button
                        onClick={closeCreateModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label htmlFor="create-title" className="block text-sm font-medium text-gray-700 mb-2">
                            Título *
                          </label>
                          <input
                            type="text"
                            id="create-title"
                            value={createFormData.title}
                            onChange={(e) => handleCreateFormChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Clase de Yoga Matutina"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="create-start-time" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha y hora de inicio *
                          </label>
                          <input
                            type="datetime-local"
                            id="create-start-time"
                            value={createFormData.start_time ? formatDateTimeForInput(createFormData.start_time) : ''}
                            onChange={(e) => handleCreateFormChange('start_time', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="create-end-time" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha y hora de fin *
                          </label>
                          <input
                            type="datetime-local"
                            id="create-end-time"
                            value={createFormData.end_time ? formatDateTimeForInput(createFormData.end_time) : ''}
                            onChange={(e) => handleCreateFormChange('end_time', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="create-location" className="block text-sm font-medium text-gray-700 mb-2">
                            Ubicación *
                          </label>
                          <input
                            type="text"
                            id="create-location"
                            value={createFormData.location}
                            onChange={(e) => handleCreateFormChange('location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Sala Principal, Gimnasio Norte"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="create-max-participants" className="block text-sm font-medium text-gray-700 mb-2">
                            Máximo participantes
                          </label>
                          <input
                            type="number"
                            id="create-max-participants"
                            value={createFormData.max_participants || ''}
                            onChange={(e) => handleCreateFormChange('max_participants', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                          <p className="mt-1 text-sm text-gray-500">0 = Sin límite</p>
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="create-description" className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción *
                          </label>
                          <textarea
                            id="create-description"
                            rows={4}
                            value={createFormData.description}
                            onChange={(e) => handleCreateFormChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe el evento, objetivos, requisitos, etc."
                            required
                          />
                        </div>

                        {/* Opción de chat inicial */}
                        <div className="md:col-span-2 flex items-center space-x-2 mt-2">
                          <input
                            id="create-include-chat"
                            type="checkbox"
                            checked={includeChat}
                            onChange={(e) => setIncludeChat(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="create-include-chat" className="text-sm font-medium text-gray-700">
                            Mensaje Inicial
                          </label>
                        </div>

                        {includeChat && (
                          <div className="md:col-span-2">
                            <label htmlFor="create-first-message" className="block text-sm font-medium text-gray-700 mb-2">
                              Mensaje inicial del chat
                            </label>
                            <textarea
                              id="create-first-message"
                              rows={2}
                              value={firstMessageChat}
                              onChange={(e) => setFirstMessageChat(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleCreateEvent}
                  disabled={saving}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando...
                    </>
                  ) : (
                    'Crear Evento'
                  )}
                </button>
                <button
                  onClick={closeCreateModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && deletingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeDeleteConfirm}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Eliminar Evento
                      </h3>
                      <button
                        onClick={closeDeleteConfirm}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-gray-600">¿Estás seguro de que quieres eliminar el evento "{deletingEvent.title}"?</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteEvent}
                  disabled={deleting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
                <button
                  onClick={closeDeleteConfirm}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal registro masivo */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeBulkModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Registro Masivo de Participantes</h3>
                {loadingUsers ? (
                  <div className="py-8 text-center">Cargando usuarios...</div>
                ) : (
                  <div className="max-h-64 overflow-y-auto border rounded-md p-2">
                    {usersForBulk.map(u => (
                      <label key={u.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(u.id)}
                          onChange={() => toggleUserSelection(u.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{u.first_name || ''} {u.last_name || ''} ({u.id})</span>
                      </label>
                    ))}
                    {usersForBulk.length === 0 && (
                      <p className="text-sm text-gray-500">No hay usuarios disponibles</p>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleBulkRegister}
                  disabled={bulkSaving}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {bulkSaving ? 'Registrando...' : 'Registrar'}
                </button>
                <button
                  onClick={closeBulkModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal participantes */}
      {showParticipantsModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowParticipantsModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Participantes del evento</h3>
                <div className="max-h-80 overflow-y-auto">
                  {participantsCache[selectedEvent.id]?.length ? (
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Nombre</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Rol</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {participantsCache[selectedEvent.id].map(p => {
                          const user = usersForBulk.find(u => u.id === p.member_id)
                          const name = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || `ID ${user.id}` : `ID ${p.member_id}`
                          const role = user ? (user.gym_role || user.role) : ''
                          return (
                            <tr key={p.id}>
                              <td className="px-4 py-2 text-gray-700 whitespace-nowrap flex items-center space-x-2">
                                <span>{name}</span>{statusBadge(p.status)}
                              </td>
                              <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{role}</td>
                              <td className="px-4 py-2 text-right">
                                <a
                                  href={`/usuarios/${p.member_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-2 py-1 border border-blue-300 shadow-sm text-xs leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none"
                                >
                                  Ver perfil
                                </a>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-gray-500">Sin participantes</p>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowParticipantsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de chat del evento */}
      {showChatModal && chatEvent && (
        <EventChatModal
          isOpen={showChatModal}
          onClose={closeChatModal}
          eventId={chatEvent.id}
          eventTitle={chatEvent.title}
        />
      )}
    </div>
  )
} 
