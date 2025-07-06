import React, { memo } from 'react'
import { Check, CheckCheck } from 'lucide-react'

interface Message {
  id: number
  text: string
  sender: string
  timestamp: string
  isOwn: boolean
  isRead: boolean
}

interface MessageItemProps {
  message: Message
  formatTime: (dateString: string) => string
}

const MessageItem = memo(({ message, formatTime }: MessageItemProps) => {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        message.isOwn
          ? 'bg-indigo-500 text-white'
          : 'bg-gray-200 text-gray-900'
      }`}>
        <p className="text-sm">{message.text}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1 ${
          message.isOwn ? 'text-indigo-200' : 'text-gray-500'
        }`}>
          <span className="text-xs">{formatTime(message.timestamp)}</span>
          {message.isOwn && (
            message.isRead ? (
              <CheckCheck size={12} />
            ) : (
              <Check size={12} />
            )
          )}
        </div>
      </div>
    </div>
  )
})

MessageItem.displayName = 'MessageItem'

export default MessageItem 