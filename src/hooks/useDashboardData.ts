'use client'

import { useState, useEffect } from 'react'
import { membershipsAPI, eventsAPI, getUsersAPI, gymsAPI } from '@/lib/api'

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
      const [membershipData, sessionsData, classesData, gymData] =
        await Promise.allSettled([
          membershipsAPI.getMembershipSummary(),
          eventsAPI.getSessions({ limit: 100 }),
          eventsAPI.getClasses(true, { limit: 50 }),
          gymsAPI.getGymInfo(),
        ])

      const membership =
        membershipData.status === 'fulfilled' ? membershipData.value : null
      const sessions =
        sessionsData.status === 'fulfilled' ? sessionsData.value : []
      const classes =
        classesData.status === 'fulfilled' ? classesData.value : []
      const gym = gymData.status === 'fulfilled' ? gymData.value : null

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

      // TODO: Reemplazar datos mock de weeklyActivity con endpoint real
      const weeklyActivity = [
        { day: 'Lun', sessions: 8, members: 25 },
        { day: 'Mar', sessions: 12, members: 32 },
        { day: 'Mié', sessions: 15, members: 38 },
        { day: 'Jue', sessions: 11, members: 30 },
        { day: 'Vie', sessions: 18, members: 42 },
        { day: 'Sáb', sessions: 22, members: 48 },
        { day: 'Dom', sessions: 9, members: 22 },
      ]

      // TODO: Reemplazar datos mock de monthlyTrend con endpoint real
      const monthlyTrend = [
        { month: 'Ene', revenue: 4500, members: 42 },
        { month: 'Feb', revenue: 5200, members: 48 },
        { month: 'Mar', revenue: 5800, members: 52 },
        { month: 'Abr', revenue: 6100, members: 55 },
        { month: 'May', revenue: 6400, members: 58 },
        { month: 'Jun', revenue: 6900, members: 62 },
      ]

      // TODO: Agregar endpoint real para critical alerts
      const mockAlerts = {
        expiring_memberships: 12,
        pending_payments: 3,
        pending_amount: 450,
        inactive_members: 8,
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
            sessions: cls.sessions_count || Math.floor(Math.random() * 20) + 5, // TODO: Reemplazar con datos reales
            capacity: cls.max_capacity || 20,
          })),
          monthlyTrend,
        },
        alerts: mockAlerts,
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
