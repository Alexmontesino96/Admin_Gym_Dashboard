'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X, Info, CheckCircle, XCircle } from 'lucide-react'

export type NotificationType = 'error' | 'warning' | 'info' | 'success'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  autoClose?: boolean
  duration?: number
}

interface BackendStatusNotifierProps {
  notifications: Notification[]
  onClose: (id: string) => void
}

export default function BackendStatusNotifier({ notifications, onClose }: BackendStatusNotifierProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([])

  useEffect(() => {
    setVisibleNotifications(notifications)
  }, [notifications])

  useEffect(() => {
    // Auto-close notifications
    const timers: NodeJS.Timeout[] = []

    visibleNotifications.forEach(notification => {
      if (notification.autoClose) {
        const timer = setTimeout(() => {
          onClose(notification.id)
        }, notification.duration || 5000)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [visibleNotifications, onClose])

  if (visibleNotifications.length === 0) {
    return null
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
    }
  }

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-400 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-800'
      case 'success':
        return 'bg-green-50 border-green-400 text-green-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 max-w-sm">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getStyles(notification.type)} border-l-4 p-4 rounded-md shadow-lg animate-slide-in`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {notification.title}
              </p>
              {notification.message && (
                <p className="mt-1 text-xs opacity-90">
                  {notification.message}
                </p>
              )}
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => onClose(notification.id)}
                className="inline-flex rounded-md p-1.5 hover:bg-gray-100 hover:bg-opacity-50 focus:outline-none"
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Hook personalizado para manejar notificaciones
export function useBackendNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleBackendError = (error: any, context?: string) => {
    console.error(`Backend error${context ? ` in ${context}` : ''}:`, error)

    if (error.status === 404) {
      addNotification({
        type: 'warning',
        title: 'Servicio no disponible',
        message: `${context || 'El servicio solicitado'} no está disponible en el backend. Usando datos locales cuando sea posible.`,
        autoClose: true,
        duration: 7000
      })
    } else if (error.status === 500 || error.status === 502 || error.status === 503) {
      addNotification({
        type: 'error',
        title: 'Error del servidor',
        message: 'El servidor está experimentando problemas. Por favor, intenta más tarde.',
        autoClose: true,
        duration: 10000
      })
    } else if (error.status === 401) {
      addNotification({
        type: 'error',
        title: 'No autorizado',
        message: 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.',
        autoClose: false
      })
    } else if (error.status === 403) {
      addNotification({
        type: 'warning',
        title: 'Sin permisos',
        message: 'No tienes permisos para realizar esta acción.',
        autoClose: true,
        duration: 5000
      })
    } else if (error.message) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
        autoClose: true,
        duration: 8000
      })
    }
  }

  const showSuccess = (title: string, message?: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      autoClose: true,
      duration: 4000
    })
  }

  const showInfo = (title: string, message?: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      autoClose: true,
      duration: 5000
    })
  }

  const showWarning = (title: string, message?: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      autoClose: true,
      duration: 6000
    })
  }

  const showError = (title: string, message?: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      autoClose: true,
      duration: 8000
    })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    handleBackendError,
    showSuccess,
    showInfo,
    showWarning,
    showError
  }
}

// Ejemplo de uso en un componente:
// import BackendStatusNotifier, { useBackendNotifications } from '@/components/BackendStatusNotifier'
//
// export default function MyComponent() {
//   const { notifications, removeNotification, handleBackendError, showSuccess } = useBackendNotifications()
//
//   const loadData = async () => {
//     try {
//       const data = await api.getData()
//       showSuccess('Datos cargados exitosamente')
//     } catch (error) {
//       handleBackendError(error, 'cargar datos')
//     }
//   }
//
//   return (
//     <>
//       <BackendStatusNotifier notifications={notifications} onClose={removeNotification} />
//       {/* Tu componente aquí */}
//     </>
//   )
// }