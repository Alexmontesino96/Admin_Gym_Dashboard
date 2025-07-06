'use client'

import { useState, useEffect } from 'react'
import { eventsAPI, dashboardAPI, membershipsAPI } from '@/lib/api'

interface ScheduleStatsData {
  activeSessions: number
  totalParticipants: number
  scheduledHours: number
  totalClasses: number
  totalCategories: number
  upcomingSessions: number
}

export default function ScheduleStats() {
  const [stats, setStats] = useState<ScheduleStatsData>({
    activeSessions: 0,
    totalParticipants: 0,
    scheduledHours: 0,
    totalClasses: 0,
    totalCategories: 0,
    upcomingSessions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener datos en paralelo
      const [
        membershipData,
        sessionsData,
        classesData,
        categoriesData
      ] = await Promise.allSettled([
        membershipsAPI.getMembershipSummary(),
        eventsAPI.getSessions({ limit: 100 }),
        eventsAPI.getClasses(true, { limit: 100 }),
        eventsAPI.getCategories(true)
      ])

      // Procesar sesiones
      const sessions = sessionsData.status === 'fulfilled' ? sessionsData.value : []
      const now = new Date()
      
      // Sesiones activas (en las próximas 24 horas)
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const activeSessions = sessions.filter((session: any) => {
        const s = session.session ?? session
        const sessionDate = new Date(s.start_time)
        return sessionDate >= now && sessionDate <= next24Hours && s.status === 'scheduled'
      }).length

      // Sesiones próximas (próximos 7 días)
      const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const upcomingSessions = sessions.filter((session: any) => {
        const s = session.session ?? session
        const sessionDate = new Date(s.start_time)
        return sessionDate >= now && sessionDate <= next7Days && s.status === 'scheduled'
      }).length

      // Calcular horas programadas (próximos 7 días)
      const scheduledHours = sessions.reduce((total: number, session: any) => {
        const s = session.session ?? session
        const sessionDate = new Date(s.start_time)
        if (sessionDate >= now && sessionDate <= next7Days && s.status === 'scheduled') {
          if (s.end_time) {
            const start = new Date(s.start_time)
            const end = new Date(s.end_time)
            const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60) // horas
            return total + duration
          } else {
            // Asumir 1 hora por defecto si no hay end_time
            return total + 1
          }
        }
        return total
      }, 0)

      // Obtener participantes totales
      const totalParticipants = membershipData.status === 'fulfilled' 
        ? membershipData.value.active_members 
        : 0

      // Obtener número de clases
      const totalClasses = classesData.status === 'fulfilled' 
        ? classesData.value.length 
        : 0

      // Obtener número de categorías
      const totalCategories = categoriesData.status === 'fulfilled' 
        ? categoriesData.value.length 
        : 0

      setStats({
        activeSessions,
        totalParticipants,
        scheduledHours: Math.round(scheduledHours * 10) / 10, // Redondear a 1 decimal
        totalClasses,
        totalCategories,
        upcomingSessions
      })

    } catch (err: any) {
      console.error('Error cargando estadísticas:', err)
      setError('Error al cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-semibold mb-6">Vista General</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-white/20 rounded mb-4"></div>
                <div className="h-6 w-12 bg-white/20 rounded mb-2"></div>
                <div className="h-4 w-20 bg-white/20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
        <h2 className="text-2xl font-semibold mb-6">Vista General</h2>
        <div className="text-center py-8">
          <p className="text-blue-100">{error}</p>
          <button 
            onClick={loadStats}
            className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
      <h2 className="text-2xl font-semibold mb-6">Vista General</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-3xl font-bold mb-2">📅</div>
          <div className="text-2xl font-bold mb-1">{stats.activeSessions}</div>
          <div className="text-blue-100">Sesiones Hoy</div>
          <div className="text-xs text-blue-200 mt-1">
            {stats.upcomingSessions} próximas esta semana
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-3xl font-bold mb-2">👥</div>
          <div className="text-2xl font-bold mb-1">{stats.totalParticipants}</div>
          <div className="text-blue-100">Miembros Activos</div>
          <div className="text-xs text-blue-200 mt-1">
            {stats.totalClasses} clases disponibles
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-3xl font-bold mb-2">🕒</div>
          <div className="text-2xl font-bold mb-1">{stats.scheduledHours}h</div>
          <div className="text-blue-100">Horas Programadas</div>
          <div className="text-xs text-blue-200 mt-1">
            {stats.totalCategories} categorías activas
          </div>
        </div>
      </div>
    </div>
  )
} 