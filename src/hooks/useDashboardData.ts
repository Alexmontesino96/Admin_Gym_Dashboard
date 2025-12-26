'use client'

import { useState, useEffect } from 'react'
import { membershipsAPI, eventsAPI, getUsersAPI, gymsAPI, dashboardAPI } from '@/lib/api'

export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  trialMembers: number
  sessionsToday: number
  totalSessions: number
  totalClasses: number
  monthlyRevenue: number
  memberGrowth: number
  maxClients?: number
  activeClients?: number
}

export interface ChartData {
  weeklyActivity: Array<{ day: string; sessions: number; members: number }>
  membershipTypes: Array<{ name: string; value: number; color: string }>
  classPopularity: Array<{ name: string; sessions: number; capacity: number }>
  monthlyTrend: Array<{ month: string; revenue: number; members: number }>
}

export interface CriticalAlertsData {
  expiring_memberships: number
  pending_payments: number
  pending_amount: number
  inactive_members: number
}

interface DashboardData {
  stats: DashboardStats
  charts: ChartData
  alerts: CriticalAlertsData
}

// Cache en sessionStorage
const CACHE_KEY = 'dashboard_data'
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutos

export function useDashboardData(autoRefresh = false) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Intentar cargar desde cache
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_DURATION) {
          setData(cachedData)
          setLoading(false)
          return
        }
      }

      // Hacer todas las llamadas en paralelo
      const [membershipData, sessionsData, classesData, gymData, dashStatsData, attendanceData] =
        await Promise.allSettled([
          membershipsAPI.getMembershipSummary(),
          eventsAPI.getSessions({ limit: 100 }),
          eventsAPI.getClasses(true, { limit: 50 }),
          gymsAPI.getGymInfo(),
          dashboardAPI.getStats(),
          dashboardAPI.getAttendanceSummary(),
        ])

      const membership =
        membershipData.status === 'fulfilled' ? membershipData.value : null
      const sessions =
        sessionsData.status === 'fulfilled' ? sessionsData.value : []
      const classes =
        classesData.status === 'fulfilled' ? classesData.value : []
      const gym = gymData.status === 'fulfilled' ? gymData.value : null
      const dashStats =
        dashStatsData.status === 'fulfilled' ? dashStatsData.value : null
      const attendance =
        attendanceData.status === 'fulfilled' ? attendanceData.value : null

      // Calcular sesiones de hoy
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)

      const sessionsToday = sessions.filter((session: any) => {
        const s = session.session ?? session
        const sessionDate = new Date(s.start_time)
        return sessionDate >= today && sessionDate < tomorrow
      }).length

      // TODO: Calcular growth real cuando backend esté listo
      // Por ahora usar el cálculo existente (incorrecto pero consistente)
      const memberGrowth =
        membership && membership.total_members > 0
          ? Math.round(
              (membership.trial_members / membership.total_members) * 100
            )
          : 0

      // Obtener actividad semanal desde el backend
      const weeklyActivity = attendance?.weekly_activity || dashStats?.weekly_activity || [
        { day: 'Lun', sessions: 0, members: 0 },
        { day: 'Mar', sessions: 0, members: 0 },
        { day: 'Mié', sessions: 0, members: 0 },
        { day: 'Jue', sessions: 0, members: 0 },
        { day: 'Vie', sessions: 0, members: 0 },
        { day: 'Sáb', sessions: 0, members: 0 },
        { day: 'Dom', sessions: 0, members: 0 },
      ]

      // Obtener tendencia mensual desde el backend
      const monthlyTrend = dashStats?.monthly_trend || [
        { month: 'Ene', revenue: 0, members: 0 },
        { month: 'Feb', revenue: 0, members: 0 },
        { month: 'Mar', revenue: 0, members: 0 },
        { month: 'Abr', revenue: 0, members: 0 },
        { month: 'May', revenue: 0, members: 0 },
        { month: 'Jun', revenue: 0, members: 0 },
      ]

      // Obtener alertas críticas desde el backend
      const criticalAlerts = dashStats?.critical_alerts || {
        expiring_memberships: 0,
        pending_payments: 0,
        pending_amount: 0,
        inactive_members: 0,
      }

      const dashboardData: DashboardData = {
        stats: {
          totalMembers: membership?.total_members || 0,
          activeMembers: membership?.active_members || 0,
          trialMembers: membership?.trial_members || 0,
          sessionsToday,
          totalSessions: sessions.length,
          totalClasses: classes.length,
          monthlyRevenue: membership?.monthly_revenue || 0,
          memberGrowth,
          maxClients: gym?.max_clients,
          activeClients: gym?.active_clients_count,
        },
        charts: {
          weeklyActivity,
          membershipTypes: [
            {
              name: 'Activos',
              value: membership?.active_members || 0,
              color: '#10B981',
            },
            {
              name: 'Prueba',
              value: membership?.trial_members || 0,
              color: '#F59E0B',
            },
            {
              name: 'Expirados',
              value: membership?.expired_members || 0,
              color: '#EF4444',
            },
            {
              name: 'Pagados',
              value: membership?.paid_members || 0,
              color: '#8B5CF6',
            },
          ],
          classPopularity: classes.slice(0, 6).map((cls: any) => ({
            name: cls.name,
            sessions: cls.sessions_count || 0,
            capacity: cls.max_capacity || 20,
          })),
          monthlyTrend,
        },
        alerts: criticalAlerts,
      }

      // Guardar en cache
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: dashboardData,
          timestamp: Date.now(),
        })
      )

      setData(dashboardData)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Auto-refresh cada 60 segundos si está habilitado
    if (autoRefresh) {
      const interval = setInterval(loadData, 60000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  return { data, loading, error, refresh: loadData }
}
