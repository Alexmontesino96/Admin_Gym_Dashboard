import { useState, useCallback, useRef } from 'react'
import { eventsAPI } from '@/lib/api'

interface StreamChatHook {
  client: any
  isInitializing: boolean
  initializeChat: (roomId: string, channelType?: string, channelId?: string) => Promise<any>
  cleanup: () => void
}

export const useStreamChat = (): StreamChatHook => {
  const [client, setClient] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const tokenRef = useRef<string | null>(null)
  const userIdRef = useRef<number | null>(null)

  const initializeChat = useCallback(async (
    roomId: string, 
    channelType: string = 'messaging', 
    channelId?: string
  ) => {
    if (isInitializing) {
      console.log('Already initializing, skipping...')
      return null
    }

    setIsInitializing(true)

    try {
      // 1. Obtener token solo si no existe o es diferente usuario
      let token = tokenRef.current
      let internal_user_id = userIdRef.current
      let api_key = process.env.NEXT_PUBLIC_STREAM_API_KEY

      if (!token || !internal_user_id) {
        const tokenData = await eventsAPI.getStreamToken()
        token = tokenData.token
        internal_user_id = tokenData.internal_user_id
        api_key = tokenData.api_key
        
        tokenRef.current = token
        userIdRef.current = internal_user_id
      }

      // 2. Inicializar cliente solo si no existe
      let streamClient = client
      if (!streamClient) {
        const { StreamChat } = await import('stream-chat')
        streamClient = StreamChat.getInstance(api_key!)
        setClient(streamClient)
      }

      // 3. Conectar usuario solo si no está conectado
      const streamUserId = `user_${internal_user_id}`
      if (!streamClient.user || streamClient.user.id !== streamUserId) {
        await streamClient.connectUser(
          {
            id: streamUserId,
            name: `Usuario ${internal_user_id}`,
          },
          token!
        )
      }

      // 4. Obtener canal
      const channel = streamClient.channel(
        channelType,
        channelId || `room_${roomId}`,
        {
          members: [streamUserId],
        }
      )

      // 5. Observar canal
      await channel.watch()

      return { client: streamClient, channel, userId: streamUserId }
    } catch (error) {
      console.error('Error initializing Stream Chat:', error)
      throw error
    } finally {
      setIsInitializing(false)
    }
  }, [client, isInitializing])

  const cleanup = useCallback(() => {
    if (client) {
      client.disconnectUser()
      setClient(null)
    }
    tokenRef.current = null
    userIdRef.current = null
  }, [client])

  return {
    client,
    isInitializing,
    initializeChat,
    cleanup
  }
} 