'use client'

import { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
  LoadingIndicator,
  ChannelListMessenger,
  MessageInputFlat,
  MessageSimple,
} from 'stream-chat-react'
import { eventsAPI } from '@/lib/api'
import 'stream-chat-react/dist/css/v2/index.css'

// Estilos personalizados para un diseño minimalista
const customStyles = `
  .str-chat__channel {
    height: 100%;
  }
  
  .str-chat__main-panel {
    height: 100%;
  }
  
  .str-chat__list {
    padding: 1rem;
    background: #f9fafb;
  }
  
  .str-chat__message-simple {
    margin-bottom: 0.75rem;
    padding: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    border: none;
  }
  
  .str-chat__message-simple--me .str-chat__message-simple-text {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    border-radius: 1rem;
    padding: 0.75rem 1rem;
    margin: 0;
  }
  
  .str-chat__message-simple:not(.str-chat__message-simple--me) .str-chat__message-simple-text {
    background: white;
    color: #374151;
    border-radius: 1rem;
    padding: 0.75rem 1rem;
    margin: 0;
    border: 1px solid #e5e7eb;
  }
  
  .str-chat__input-flat {
    border: 1px solid #e5e7eb;
    border-radius: 1.5rem;
    padding: 0.75rem 1rem;
    background: white;
    transition: all 0.2s;
    min-height: 2.5rem;
    max-height: 8rem;
    resize: none;
    overflow-y: auto;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  
  .str-chat__input-flat:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    outline: none;
  }
  
  .str-chat__input-flat textarea,
  .str-chat__input-flat input[type="text"] {
    border: none !important;
    border-radius: 1.5rem !important;
    padding: 0.75rem 1rem !important;
    background: white !important;
    transition: all 0.2s !important;
    min-height: 2.5rem !important;
    max-height: 8rem !important;
    resize: none !important;
    overflow-y: auto !important;
    word-wrap: break-word !important;
    white-space: pre-wrap !important;
    line-height: 1.5 !important;
  }
  
  .str-chat__input-flat textarea:focus,
  .str-chat__input-flat input[type="text"]:focus {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
    outline: none !important;
  }
  
  .str-chat__input-container {
    display: flex !important;
    align-items: flex-end !important;
    gap: 0.5rem !important;
  }
  
  .str-chat__input {
    flex: 1 !important;
    display: flex !important;
    align-items: flex-end !important;
  }
  
  .str-chat__textarea__textarea {
    min-height: 2.5rem !important;
    max-height: 8rem !important;
    resize: none !important;
    overflow-y: auto !important;
    border-radius: 1.5rem !important;
    padding: 0.75rem 1rem !important;
    line-height: 1.5 !important;
    font-family: inherit !important;
  }
  
  .str-chat__send-button {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    border: none;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.5rem;
    transition: all 0.2s;
  }
  
  .str-chat__send-button:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  .str-chat__avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .str-chat__message-team {
    border: none;
    padding: 0;
    margin-bottom: 0.75rem;
  }
  
  .str-chat__message-text {
    line-height: 1.5;
  }
  
  .str-chat__thread-button {
    display: none;
  }
  
  .str-chat__message-actions-box {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid #e5e7eb;
  }
`

interface EventChatProps {
  eventId: number
  eventTitle: string
  className?: string
}

export default function EventChat({ eventId, eventTitle, className = '' }: EventChatProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [channel, setChannel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Inyectar estilos personalizados
    const styleElement = document.createElement('style')
    styleElement.textContent = customStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeChat = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Obtener token de Stream
        const { token, internal_user_id, api_key } = await eventsAPI.getStreamToken()

        // 2. Inicializar cliente de Stream
        const client = StreamChat.getInstance(api_key)
        
        // 3. Conectar usuario
        // El backend convierte internal_user_id a formato "user_X" para Stream
        const streamUserId = `user_${internal_user_id}`
        
        await client.connectUser(
          {
            id: streamUserId,
            name: `Usuario ${internal_user_id}`, // Por ahora usamos el ID, pero puedes obtener el nombre real del usuario
          },
          token
        )

        if (!mounted) return

        // 4. Obtener información del chat del evento
        const chatRoom = await eventsAPI.getEventChatRoom(eventId)

        // 5. Obtener el canal
        const eventChannel = client.channel(
          chatRoom.stream_channel_type,
          chatRoom.stream_channel_id,
          {
            members: [streamUserId],
          }
        )

        // 6. Observar el canal
        await eventChannel.watch()

        if (!mounted) return

        setChatClient(client)
        setChannel(eventChannel)

      } catch (err: any) {
        console.error('Error inicializando chat:', err)
        if (mounted) {
          let errorMessage = 'Error al cargar el chat'
          
          if (err.message && err.message.includes('403')) {
            errorMessage = 'No tienes permisos para acceder a este chat. Debes estar registrado en el evento.'
          } else if (err.message && err.message.includes('404')) {
            errorMessage = 'El evento o chat no fue encontrado.'
          } else if (err.message && err.message.includes('401')) {
            errorMessage = 'Tu sesión ha expirado. Por favor, recarga la página.'
          } else if (err.message) {
            errorMessage = err.message
          }
          
          setError(errorMessage)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeChat()

    return () => {
      mounted = false
      if (chatClient) {
        chatClient.disconnectUser()
      }
    }
  }, [eventId, eventTitle, chatClient])

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 bg-white rounded-lg shadow-lg ${className}`}>
        <div className="text-center">
          <LoadingIndicator size={40} />
          <p className="mt-4 text-gray-600">Cargando chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-8 bg-white rounded-lg shadow-lg ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar el chat</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!chatClient || !channel) {
    return (
      <div className={`p-8 bg-white rounded-lg shadow-lg ${className}`}>
        <div className="text-center text-gray-600">
          No se pudo establecer conexión con el chat
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white overflow-hidden ${className} flex flex-col h-full`}>
      <Chat client={chatClient} theme="str-chat__theme-light">
        <Channel channel={channel}>
          <Window>
            <div className="flex flex-col h-full">
              <div className="flex-1 str-chat__list-container bg-gray-50 overflow-y-auto">
                <MessageList Message={MessageSimple} />
              </div>
              <div className="flex-shrink-0 str-chat__input-container border-t border-gray-100 p-4 bg-white">
                <MessageInput Input={MessageInputFlat} />
              </div>
            </div>
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
} 