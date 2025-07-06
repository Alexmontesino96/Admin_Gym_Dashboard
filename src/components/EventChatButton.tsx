'use client'

import { useState } from 'react'
import { eventsAPI } from '@/lib/api'

interface EventChatButtonProps {
  eventId: number
  eventTitle: string
  className?: string
}

export default function EventChatButton({ eventId, eventTitle, className = '' }: EventChatButtonProps) {
  const [loading, setLoading] = useState(false)
  const [chatInfo, setChatInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkChatAvailability = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar si el chat está disponible
      const chatRoom = await eventsAPI.getEventChatRoom(eventId)
      setChatInfo(chatRoom)
      
      // Mostrar información del chat
      alert(`Chat disponible para "${eventTitle}"!\n\nID del canal: ${chatRoom.stream_channel_id}\nTipo: ${chatRoom.stream_channel_type}\nCreado: ${new Date(chatRoom.created_at).toLocaleString()}`)
      
    } catch (err: any) {
      console.error('Error verificando chat:', err)
      
      let errorMessage = 'Error al verificar el chat'
      if (err.message && err.message.includes('403')) {
        errorMessage = 'No tienes permisos para acceder a este chat. Debes estar registrado en el evento.'
      } else if (err.message && err.message.includes('404')) {
        errorMessage = 'El evento no fue encontrado.'
      } else if (err.message && err.message.includes('401')) {
        errorMessage = 'Tu sesión ha expirado. Por favor, recarga la página.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={checkChatAvailability}
      disabled={loading}
      className={`inline-flex items-center p-2 border border-purple-300 shadow-sm rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Verificar chat del evento"
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )}
    </button>
  )
} 