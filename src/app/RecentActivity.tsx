'use client'

import { useState, useEffect } from 'react'
import { eventsAPI, getUsersAPI } from '@/lib/api'
import Link from 'next/link'

interface ActivityItem {
  id: string
  type: 'session' | 'member' | 'event'
  title: string
  subtitle: string
  time: string
  icon: string
  color: string
  href?: string
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadRecentActivity = async () => {
    try {
      setLoading(true)

      const [sessionsData, eventsData, membersData] = await Promise.allSettled([
        eventsAPI.getSessions({ limit: 5 }),
        eventsAPI.getEvents({ limit: 3 }),
        getUsersAPI.getGymParticipants({ limit: 3 })
      ])

      const activities: ActivityItem[] = []

      // Agregar sesiones recientes
      if (sessionsData.status === 'fulfilled') {
        sessionsData.value.slice(0, 3).forEach((session: any) => {
          const s = session.session ?? session
          const sessionDate = new Date(s.start_time_local || s.start_time)
          const isToday = sessionDate.toDateString() === new Date().toDateString()
          
          activities.push({
            id: `session-${s.id}`,
            type: 'session',
            title: s.class?.name || 'Sesión programada',
            subtitle: isToday ? 'Hoy' : sessionDate.toLocaleDateString(),
            time: sessionDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            icon: '📅',
            color: 'text-blue-600',
            href: '/schedule/sessions'
          })
        })
      }

      // Agregar eventos recientes
      if (eventsData.status === 'fulfilled') {
        eventsData.value.slice(0, 2).forEach((event: any) => {
          const eventDate = new Date(event.start_time)
          
          activities.push({
            id: `event-${event.id}`,
            type: 'event',
            title: event.title,
            subtitle: `${event.participants_count || 0} participantes`,
            time: eventDate.toLocaleDateString(),
            icon: '🎉',
            color: 'text-pink-600',
            href: '/eventos'
          })
        })
      }

      // Agregar miembros recientes
      if (membersData.status === 'fulfilled') {
        membersData.value.slice(0, 2).forEach((member: any) => {
          const joinDate = new Date(member.created_at)
          
          activities.push({
            id: `member-${member.id}`,
            type: 'member',
            title: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email,
            subtitle: 'Nuevo miembro',
            time: joinDate.toLocaleDateString(),
            icon: '👤',
            color: 'text-green-600',
            href: '/usuarios'
          })
        })
      }

      // Ordenar por relevancia y tomar los primeros 6
      const sortedActivities = activities
        .sort((a, b) => {
          // Priorizar sesiones de hoy
          if (a.type === 'session' && a.subtitle === 'Hoy') return -1
          if (b.type === 'session' && b.subtitle === 'Hoy') return 1
          return 0
        })
        .slice(0, 6)

      setActivities(sortedActivities)

    } catch (error) {
      console.error('Error cargando actividad reciente:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecentActivity()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
        <Link
          href="/schedule"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todo
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm">No hay actividad reciente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="group">
              {activity.href ? (
                <Link href={activity.href} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.subtitle}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.time}
                  </div>
                </Link>
              ) : (
                <div className="flex items-center space-x-3 p-2">
                  <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.subtitle}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.time}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 