import { useState, useCallback, useRef } from 'react'

interface Message {
  id: number
  text: string
  sender: string
  timestamp: string
  isOwn: boolean
  isRead: boolean
}

interface ConversationCache {
  [roomId: string]: {
    messages: Message[]
    channel: any
    lastUpdate: number
    isLoaded: boolean
    hasListener: boolean
  }
}

interface ConversationCacheHook {
  getCachedMessages: (roomId: string) => Message[]
  setCachedMessages: (roomId: string, messages: Message[]) => void
  addMessageToCache: (roomId: string, message: Message) => void
  getCachedChannel: (roomId: string) => any
  setCachedChannel: (roomId: string, channel: any) => void
  isConversationLoaded: (roomId: string) => boolean
  clearCache: () => void
  getCacheStats: () => { totalConversations: number; totalMessages: number }
}

export const useConversationCache = (): ConversationCacheHook => {
  const cacheRef = useRef<ConversationCache>({})
  const [, forceUpdate] = useState(0)

  // Forzar actualización del componente cuando sea necesario
  const triggerUpdate = useCallback(() => {
    forceUpdate(prev => prev + 1)
  }, [])

  // Obtener mensajes cacheados
  const getCachedMessages = useCallback((roomId: string): Message[] => {
    const roomCache = cacheRef.current[roomId]
    return roomCache?.messages || []
  }, [])

  // Establecer mensajes cacheados
  const setCachedMessages = useCallback((roomId: string, messages: Message[]) => {
    if (!cacheRef.current[roomId]) {
      cacheRef.current[roomId] = {
        messages: [],
        channel: null,
        lastUpdate: Date.now(),
        isLoaded: false,
        hasListener: false
      }
    }
    
    cacheRef.current[roomId].messages = messages
    cacheRef.current[roomId].lastUpdate = Date.now()
    cacheRef.current[roomId].isLoaded = true
    
    console.log(`Cache updated for room ${roomId}:`, messages.length, 'messages')
  }, [])

  // Agregar mensaje individual al cache
  const addMessageToCache = useCallback((roomId: string, message: Message) => {
    if (!cacheRef.current[roomId]) {
      cacheRef.current[roomId] = {
        messages: [],
        channel: null,
        lastUpdate: Date.now(),
        isLoaded: false,
        hasListener: false
      }
    }

    const existingMessages = cacheRef.current[roomId].messages
    
    // Evitar duplicados
    const messageExists = existingMessages.some(msg => msg.id === message.id)
    if (messageExists) {
      console.log(`Message ${message.id} already exists in cache for room ${roomId}`)
      return
    }

    // Agregar mensaje al final
    cacheRef.current[roomId].messages = [...existingMessages, message]
    cacheRef.current[roomId].lastUpdate = Date.now()
    
    console.log(`New message added to cache for room ${roomId}:`, message.text.substring(0, 50))
    
    // Forzar actualización solo si es la conversación activa
    triggerUpdate()
  }, [triggerUpdate])

  // Obtener canal cacheado
  const getCachedChannel = useCallback((roomId: string): any => {
    return cacheRef.current[roomId]?.channel || null
  }, [])

  // Establecer canal cacheado
  const setCachedChannel = useCallback((roomId: string, channel: any) => {
    if (!cacheRef.current[roomId]) {
      cacheRef.current[roomId] = {
        messages: [],
        channel: null,
        lastUpdate: Date.now(),
        isLoaded: false,
        hasListener: false
      }
    }
    
    cacheRef.current[roomId].channel = channel
    console.log(`Channel cached for room ${roomId}`)
  }, [])

  // Verificar si la conversación está cargada
  const isConversationLoaded = useCallback((roomId: string): boolean => {
    return cacheRef.current[roomId]?.isLoaded || false
  }, [])

  // Limpiar cache
  const clearCache = useCallback(() => {
    // Limpiar listeners antes de limpiar cache
    Object.values(cacheRef.current).forEach(cache => {
      if (cache.channel) {
        cache.channel.off('message.new')
      }
    })
    
    cacheRef.current = {}
    console.log('Conversation cache cleared')
  }, [])

  // Estadísticas del cache
  const getCacheStats = useCallback(() => {
    const conversations = Object.keys(cacheRef.current).length
    const totalMessages = Object.values(cacheRef.current).reduce(
      (total, cache) => total + cache.messages.length, 
      0
    )
    
    return {
      totalConversations: conversations,
      totalMessages: totalMessages
    }
  }, [])

  return {
    getCachedMessages,
    setCachedMessages,
    addMessageToCache,
    getCachedChannel,
    setCachedChannel,
    isConversationLoaded,
    clearCache,
    getCacheStats
  }
} 