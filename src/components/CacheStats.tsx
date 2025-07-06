import React from 'react'

interface CacheStatsProps {
  stats: {
    totalConversations: number
    totalMessages: number
  }
  isVisible?: boolean
}

const CacheStats: React.FC<CacheStatsProps> = ({ stats, isVisible = process.env.NODE_ENV === 'development' }) => {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
      <div>Cache: {stats.totalConversations} conversaciones</div>
      <div>Mensajes: {stats.totalMessages}</div>
    </div>
  )
}

export default CacheStats 