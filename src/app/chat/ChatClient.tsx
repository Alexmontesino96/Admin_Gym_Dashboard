'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Send, 
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Users,
  User,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react'
import { eventsAPI } from '@/lib/api'
import { useStreamChat } from '@/hooks/useStreamChat'
import { useConversationCache } from '@/hooks/useConversationCache'
import MessageItem from '@/components/MessageItem'
import CacheStats from '@/components/CacheStats'
import { getUsersAPI } from '@/lib/api'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
  isOnline?: boolean
  lastSeen?: string
  role?: string
  phone?: string
  membership_type?: string
}

interface ChatRoom {
  id: number
  name: string
  is_direct: boolean
  created_at: string
  members: User[]
  stream_channel_type?: string
  stream_channel_id?: string
  lastMessage?: {
    text: string
    timestamp: string
    sender: string
    isRead: boolean
  }
  unreadCount?: number
}

interface Message {
  id: number
  text: string
  sender: string
  timestamp: string
  isOwn: boolean
  isRead: boolean
}

export default function ChatClient() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roomName, setRoomName] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [gymId, setGymId] = useState<string>('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hook optimizado para Stream Chat
  const { client: streamClient, isInitializing: isInitializingChat, initializeChat } = useStreamChat()
  
  // Hook para cache de conversaciones
  const {
    getCachedMessages,
    setCachedMessages,
    addMessageToCache,
    getCachedChannel,
    setCachedChannel,
    isConversationLoaded,
    getCacheStats
  } = useConversationCache()
  
  // Los mensajes ahora vienen del cache
  const messages = selectedRoom ? getCachedMessages(selectedRoom.id.toString()) : []
  
  const [currentChannel, setCurrentChannel] = useState<any>(null)
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)

  // Función para obtener el gimnasio seleccionado
  const getSelectedGymId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected_gym_id') || '1'
    }
    return '1'
  }

  // Función para formatear fecha (memoizada)
  const formatTime = useCallback((dateString: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return ''
    }
    
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 días
      return date.toLocaleDateString('es-ES', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    }
  }, [])

  // Función para formatear fecha completa
  const formatFullTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Scroll automático al final de mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cargar datos iniciales
  useEffect(() => {
    const selectedGymId = getSelectedGymId()
    setGymId(selectedGymId)
    
    if (selectedGymId) {
      fetchRooms()
      fetchUsers()
    }
  }, [])

  // Actualizar gym ID cuando cambie (optimizado)
  useEffect(() => {
    const handleStorageChange = () => {
      const newGymId = getSelectedGymId()
      if (newGymId !== gymId) {
        setGymId(newGymId)
        if (newGymId) {
          fetchRooms()
          fetchUsers()
        }
      }
    }

    // Solo escuchar cambios de storage, no polling
    window.addEventListener('storage', handleStorageChange)
    
    // Polling reducido solo para casos edge
    const interval = setInterval(handleStorageChange, 10000) // 10 segundos en vez de 1

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [gymId])

  // Fetch rooms (memoizado)
  const fetchRooms = useCallback(async () => {
    const selectedGymId = getSelectedGymId()
    console.log('Fetching rooms for gym ID:', selectedGymId)
    
    setIsLoadingRooms(true)

    try {
      const response = await fetch('/api/v1/chat/my-rooms', {
        headers: {
          'X-Gym-ID': selectedGymId,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Rooms data received:', data)
        console.log('Data type:', typeof data, 'Is array:', Array.isArray(data))
        
        if (Array.isArray(data)) {
          console.log('Total rooms received:', data.length)
          
          // Filtrar salas que empiecen con "event" (como se hacía en la implementación anterior)
          const filteredRooms = data.filter((room: any) => {
            const channelId = room.stream_channel_id || ''
            const isEventRoom = channelId.startsWith('event') || room.event_id !== null
            console.log(`Room ${room.id} (${room.name}): channel_id=${channelId}, event_id=${room.event_id}, isEventRoom=${isEventRoom}`)
            return !isEventRoom
          })
          
          console.log('Salas filtradas (sin eventos):', filteredRooms.length, 'de', data.length)
          
          // Procesar todas las salas filtradas (incluso si está vacío)
          const roomsWithMessages = filteredRooms.map((room: any) => {
            let displayName = room.name || (room.is_direct ? 'Chat Directo' : 'Sala Sin Nombre')
            
            // Si es un chat directo y el nombre empieza con "Chat con", extraer solo el nombre
            if (room.is_direct && displayName.startsWith('Chat con ')) {
              displayName = displayName.replace('Chat con ', '')
            }
            
            return {
              id: room.id,
              name: displayName,
              is_direct: room.is_direct || false,
              created_at: room.created_at,
              members: Array.isArray(room.members) ? room.members : [],
              stream_channel_type: room.stream_channel_type,
              stream_channel_id: room.stream_channel_id,
              lastMessage: undefined, // Sin mensajes simulados
              unreadCount: 0
            }
          })
          
          setRooms(roomsWithMessages)
          console.log('Rooms set:', roomsWithMessages.length, 'rooms')
          console.log('Final rooms array:', roomsWithMessages)
          
          // Pequeño delay para hacer la animación más suave
          setTimeout(() => {
            setIsLoadingRooms(false)
          }, 300)
          return
        } else {
          console.log('Data is not an array:', data)
        }
      } else {
        console.log('Response not ok:', response.status, response.statusText)
        const errorText = await response.text()
        console.log('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
    
    // Si llegamos aquí, no hay salas
    console.log('No rooms available')
    setRooms([])
    setTimeout(() => {
      setIsLoadingRooms(false)
    }, 300)
  }, []) // Dependencias vacías porque getSelectedGymId no depende de props/state

  // Fetch users (memoizado)
  const fetchUsers = useCallback(async () => {
    try {
      console.log('Fetching users with getUsersAPI.getGymParticipants()')
      
      const data = await getUsersAPI.getGymParticipants()
      console.log('Users data received:', data)
      console.log('Users data type:', typeof data, 'Is array:', Array.isArray(data))
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('Processing', data.length, 'users from API')
        const usersWithStatus = data.map((user: any, index: number) => ({
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || `Usuario ${user.id}`,
          email: user.email,
          role: user.gym_role || user.role || 'member',
          phone: user.phone_number,
          membership_type: 'standard', // Podríamos obtener esto de otra fuente si está disponible
          isOnline: index % 3 === 0,
          lastSeen: index % 3 !== 0 ? new Date(Date.now() - index * 1800000).toISOString() : undefined,
          avatar: user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.first_name || ''} ${user.last_name || ''}`.trim())}&background=6366f1&color=fff&size=40`
        }))
        setUsers(usersWithStatus)
        console.log('Users set successfully:', usersWithStatus.length, 'users')
        console.log('Sample user:', usersWithStatus[0])
        return
      } else {
        console.log('Users data is empty or not an array:', data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
    
    // Si llegamos aquí, no hay usuarios
    console.log('No users available')
    setUsers([])
  }, []) // Dependencias vacías

  // Crear nueva sala
  const createRoom = async () => {
    if (selectedUsers.length === 0) return

    setIsLoading(true)
    try {
      const isDirect = selectedUsers.length === 1
      const selectedGymId = getSelectedGymId()
      
      // Generar nombre por defecto si no se proporciona uno para grupos
      let groupName = roomName.trim()
      if (!isDirect && !groupName) {
        // Crear nombre por defecto con los nombres de los usuarios
        const userNames = selectedUsers.slice(0, 3).map(u => u.name.split(' ')[0])
        groupName = userNames.length > 2 
          ? `${userNames.slice(0, 2).join(', ')} y ${selectedUsers.length - 2} más`
          : userNames.join(', ')
      }
      
      const payload = {
        name: isDirect ? selectedUsers[0].name : groupName,
        member_ids: selectedUsers.map(u => u.id),
        is_direct: isDirect
      }

      console.log('Creating room with payload:', payload)
      console.log('Gym ID:', selectedGymId)

      const response = await fetch('/api/v1/chat/rooms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Gym-ID': selectedGymId
        },
        body: JSON.stringify(payload)
      })

      console.log('Create room response status:', response.status)

      if (response.ok) {
        const newRoom = await response.json()
        console.log('New room created:', newRoom)
        
        setRooms(prev => [newRoom, ...prev])
        setShowNewChatModal(false)
        setSelectedUsers([])
        setRoomName('')
        setUserSearchQuery('')
        setSelectedRole('all')
        setSelectedRoom(newRoom)
      } else {
        const errorText = await response.text()
        console.error('Error creating room:', response.status, errorText)
        
        // Mostrar error al usuario
        alert(`Error al crear la conversación: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Error de conexión al crear la conversación')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para inicializar Stream Chat (optimizada con cache)
  const initializeStreamChat = useCallback(async (room: ChatRoom) => {
    const roomId = room.id.toString()
    
    try {
      console.log('Initializing Stream Chat for room:', room.id)
      
      // Verificar si ya tenemos la conversación cacheada
      const cachedChannel = getCachedChannel(roomId)
      if (cachedChannel && isConversationLoaded(roomId)) {
        console.log('Using cached conversation for room:', roomId)
        setCurrentChannel(cachedChannel)
        return // Salir temprano, los listeners ya están configurados
      }
      
      // Limpiar canal anterior si existe
      if (currentChannel) {
        currentChannel.off('message.new')
        console.log('Cleaned up previous channel listeners')
      }
      
      // Usar hook optimizado para nueva inicialización
      const result = await initializeChat(
        roomId,
        room.stream_channel_type || 'messaging',
        room.stream_channel_id
      )
      
      if (!result) return
      
      const { channel, userId } = result
      
      // Cargar mensajes del canal solo si no están cacheados
      const messagesResponse = await channel.query({
        messages: { limit: 20 }
      })

      // Convertir mensajes de Stream a formato local
      const streamMessages = messagesResponse.messages || []
      const convertedMessages = streamMessages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.user?.name || 'Usuario',
        timestamp: msg.created_at,
        isOwn: msg.user?.id === userId,
        isRead: true
      }))

      // Guardar en cache
      setCachedMessages(roomId, convertedMessages)
      setCachedChannel(roomId, channel)
      setCurrentChannel(channel)
      
      // Escuchar mensajes nuevos en tiempo real (solo una vez por canal)
      const handleNewMessage = (event: any) => {
        if (event.message) {
          const newMessage: Message = {
            id: event.message.id,
            text: event.message.text,
            sender: event.message.user?.name || event.message.user?.id || 'Usuario',
            timestamp: event.message.created_at,
            isOwn: event.message.user?.id === userId,
            isRead: true
          }
          
          // Agregar al cache (esto dispara la actualización automáticamente)
          addMessageToCache(roomId, newMessage)
        }
      }
      
      // Limpiar listeners anteriores y agregar nuevo
      channel.off('message.new')
      channel.on('message.new', handleNewMessage)
      
      console.log('Stream Chat initialized successfully, messages cached:', convertedMessages.length)
      
      // Mostrar estadísticas del cache
      const stats = getCacheStats()
      console.log('Cache stats:', stats)

    } catch (error) {
      console.error('Error initializing Stream Chat:', error)
      // No limpiar cache en caso de error, mantener datos existentes
      setCurrentChannel(null)
    }
  }, [initializeChat, currentChannel, getCachedChannel, isConversationLoaded, setCachedMessages, setCachedChannel, addMessageToCache, getCacheStats])

  // Función para enviar mensaje optimizada con cache
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedRoom || !currentChannel) return

    const roomId = selectedRoom.id.toString()

    try {
      // Enviar mensaje a Stream Chat
      await currentChannel.sendMessage({
        text: newMessage
      })

      // Limpiar el input
      setNewMessage('')
      console.log('Mensaje enviado exitosamente a Stream Chat')
    } catch (error) {
      console.error('Error enviando mensaje a Stream Chat:', error)
      // Fallback: agregar al cache directamente si falla Stream
      const message: Message = {
        id: Date.now(),
        text: newMessage,
        sender: 'Tú',
        timestamp: new Date().toISOString(),
        isOwn: true,
        isRead: false
      }
      
      // Agregar al cache
      addMessageToCache(roomId, message)
      setNewMessage('')
    }
  }, [newMessage, selectedRoom, currentChannel, addMessageToCache])

  // Cargar mensajes cuando se selecciona una sala
  useEffect(() => {
    console.log('Selected room changed:', selectedRoom?.name, selectedRoom?.id)
    if (selectedRoom) {
      // Inicializar Stream Chat para la sala seleccionada
      initializeStreamChat(selectedRoom)
    }
  }, [selectedRoom])

  // Obtener roles únicos de usuarios
  const availableRoles = useMemo(() => {
    const roles = users.map(user => user.role || 'member').filter(Boolean)
    return ['all', ...Array.from(new Set(roles))]
  }, [users])

  // Filtrar usuarios para búsqueda (memoizado y mejorado)
  const filteredUsers = useMemo(() => {
    let filtered = users

    // Filtrar por rol
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => (user.role || 'member') === selectedRole)
    }

    // Filtrar por búsqueda de texto
    if (userSearchQuery.trim()) {
      const query = userSearchQuery.toLowerCase()
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.toLowerCase().includes(query)) ||
        (user.membership_type && user.membership_type.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [users, selectedRole, userSearchQuery])

  // Filtrar conversaciones para búsqueda del sidebar
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms
    const query = searchQuery.toLowerCase()
    return rooms.filter(room =>
      room.name.toLowerCase().includes(query)
    )
  }, [rooms, searchQuery])

  // Debug: Log del estado actual
  console.log('Render - rooms.length:', rooms.length)
  console.log('Render - rooms:', rooms)

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-100 rounded-lg overflow-hidden shadow-sm">
      {/* Sidebar - Lista de conversaciones */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingRooms ? (
            <div className="p-4 space-y-4">
              {/* Skeleton loaders */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500 opacity-0 animate-fade-in">
              <MessageCircle size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No hay conversaciones aún</p>
              <p className="text-sm">Crea una nueva conversación para empezar</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Crear conversación
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredRooms.map((room, index) => (
                <div
                  key={room.id}
                  onClick={() => {
                    console.log('Clicking on room:', room.name, room.id)
                    setSelectedRoom(room)
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-sm opacity-0 animate-slide-in-left ${
                    selectedRoom?.id === room.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    {room.is_direct ? (
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Users size={20} className="text-white" />
                      </div>
                    )}
                    {room.is_direct && room.members?.[0]?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {room.name}
                        </h3>
                        {/* Indicador de conversación cacheada */}
                        {isConversationLoaded(room.id.toString()) && (
                          <div className="w-2 h-2 bg-green-400 rounded-full" title="Conversación cargada"></div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {room.lastMessage ? formatTime(room.lastMessage.timestamp) : formatTime(room.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {(() => {
                          const cachedMessages = getCachedMessages(room.id.toString())
                          const lastCachedMessage = cachedMessages[cachedMessages.length - 1]
                          return lastCachedMessage 
                            ? lastCachedMessage.text 
                            : room.lastMessage 
                              ? room.lastMessage.text 
                              : 'Nueva conversación'
                        })()}
                      </p>
                      <div className="flex items-center space-x-1">
                        {room.lastMessage?.isRead ? (
                          <CheckCheck size={14} className="text-blue-500" />
                        ) : (
                          <Check size={14} className="text-gray-400" />
                        )}
                        {room.unreadCount && room.unreadCount > 0 && (
                          <span className="bg-indigo-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área principal de chat */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <div className="flex-1 flex flex-col opacity-0 animate-fade-in">
            {/* Header del chat */}
            <div className="bg-white border-b border-gray-200 p-4 opacity-0 animate-slide-in-right" style={{animationDelay: '100ms'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {selectedRoom.is_direct ? (
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-white" />
                      </div>
                    )}
                    {selectedRoom.is_direct && selectedRoom.members?.[0]?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">{selectedRoom.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedRoom.is_direct
                        ? selectedRoom.members?.[0]?.isOnline
                          ? 'En línea'
                          : (() => {
                              const lastSeenTime = formatTime(selectedRoom.members?.[0]?.lastSeen || '')
                              return lastSeenTime ? `Visto por última vez ${lastSeenTime}` : 'Desconectado'
                            })()
                        : `${selectedRoom.members?.length || 0} miembros`
                      }
                      {/* Mostrar si está cacheada */}
                      {isConversationLoaded(selectedRoom.id.toString()) && (
                        <span className="ml-2 text-green-600">• Cargada</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                    <Video size={18} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                    <Info size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isInitializingChat ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Cargando conversación...
                    </h3>
                    <p className="text-gray-500">
                      Conectando con Stream Chat
                    </p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay mensajes aún
                    </h3>
                    <p className="text-gray-500">
                      Envía un mensaje para comenzar la conversación
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    formatTime={formatTime}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                  <Paperclip size={18} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-indigo-600 rounded-full transition-colors">
                    <Smile size={16} />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Estado vacío */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-gray-500">
                Elige una conversación del sidebar para empezar a chatear
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal para nueva conversación mejorado */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Nueva Conversación</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedUsers.length === 0 
                    ? 'Selecciona usuarios para crear una conversación'
                    : selectedUsers.length === 1 
                      ? 'Chat directo - se mostrará el nombre de la persona'
                      : 'Sala grupal - puedes darle un nombre personalizado'
                  }
                </p>
              </div>
              <button
                onClick={() => {
                  setShowNewChatModal(false)
                  setSelectedUsers([])
                  setUserSearchQuery('')
                  setSelectedRole('all')
                  setRoomName('')
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="p-6 border-b border-gray-200 space-y-4">
              {/* Búsqueda de usuarios */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, teléfono o membresía..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Filtro por rol */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filtrar por rol:</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>
                      {role === 'all' ? 'Todos los roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                
                {/* Contador de usuarios */}
                <span className="text-sm text-gray-500">
                  {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Lista de usuarios */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <User size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No se encontraron usuarios</p>
                  <p className="text-sm text-gray-400">Intenta cambiar los filtros de búsqueda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUsers.find(u => u.id === user.id)
                    return (
                      <div
                        key={user.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedUsers(prev => prev.filter(u => u.id !== user.id))
                          } else {
                            setSelectedUsers(prev => [...prev, user])
                          }
                        }}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                            : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              user.role === 'admin' ? 'bg-red-500' :
                              user.role === 'trainer' ? 'bg-green-500' :
                              'bg-indigo-500'
                            }`}>
                              <User size={20} className="text-white" />
                            </div>
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>

                          {/* Información del usuario */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900 truncate">{user.name}</p>
                              {user.role && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                  user.role === 'trainer' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.role}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-400">{user.phone}</p>
                            )}
                            {user.membership_type && (
                              <p className="text-xs text-gray-400">Membresía: {user.membership_type}</p>
                            )}
                          </div>

                          {/* Checkbox */}
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-indigo-500 border-indigo-500' 
                              : 'border-gray-300 hover:border-indigo-400'
                          }`}>
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t border-gray-200 space-y-4">
              {/* Nombre de sala grupal */}
              {selectedUsers.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la sala grupal (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Equipo de entrenadores, Administradores..."
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Si no ingresas un nombre, se generará uno automáticamente
                  </p>
                </div>
              )}

              {/* Usuarios seleccionados */}
              {selectedUsers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}:
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span className="truncate max-w-32">{user.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedUsers(prev => prev.filter(u => u.id !== user.id))
                          }}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-200"
                        >
                          <Plus size={12} className="rotate-45" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setSelectedUsers([])
                    setUserSearchQuery('')
                    setSelectedRole('all')
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  disabled={selectedUsers.length === 0 && !userSearchQuery && selectedRole === 'all'}
                >
                  Limpiar selección
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowNewChatModal(false)
                      setSelectedUsers([])
                      setUserSearchQuery('')
                      setSelectedRole('all')
                      setRoomName('')
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createRoom}
                    disabled={selectedUsers.length === 0 || isLoading}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creando...</span>
                      </div>
                    ) : (
                      selectedUsers.length === 1 ? 'Crear Chat Directo' : `Crear Sala Grupal (${selectedUsers.length})`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Estadísticas del cache en desarrollo */}
      <CacheStats stats={getCacheStats()} />
    </div>
    </>
  )
}
