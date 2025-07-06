'use client'

import { useState, useEffect } from 'react'
import { membershipsAPI, eventsAPI, getUsersAPI } from '@/lib/api'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  trialMembers: number
  totalSessions: number
  sessionsToday: number
  totalClasses: number
  monthlyRevenue: number
  memberGrowth: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    trialMembers: 0,
    totalSessions: 0,
    sessionsToday: 0,
    totalClasses: 0,
    monthlyRevenue: 0,
    memberGrowth: 0
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)

      const [membershipData, sessionsData, classesData, membersData] = await Promise.allSettled([
        membershipsAPI.getMembershipSummary(),
        eventsAPI.getSessions({ limit: 200 }),
        eventsAPI.getClasses(true, { limit: 100 }),
        getUsersAPI.getGymParticipants({ role: 'MEMBER', limit: 50 })
      ])

      // Procesar datos de membresías
      const membership = membershipData.status === 'fulfilled' ? membershipData.value : null
      const sessions = sessionsData.status === 'fulfilled' ? sessionsData.value : []
      const classes = classesData.status === 'fulfilled' ? classesData.value : []
      const members = membersData.status === 'fulfilled' ? membersData.value : []

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

      // Calcular crecimiento estimado (usando trial members como proxy)
      const memberGrowth = membership && membership.total_members > 0 
        ? Math.round((membership.trial_members / membership.total_members) * 100)
        : 0

      setStats({
        totalMembers: membership?.total_members || 0,
        activeMembers: membership?.active_members || 0,
        trialMembers: membership?.trial_members || 0,
        totalSessions: sessions.length,
        sessionsToday,
        totalClasses: classes.length,
        monthlyRevenue: membership?.monthly_revenue || 0,
        memberGrowth
      })

    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      label: 'Miembros Totales',
      value: stats.totalMembers,
      subtitle: `${stats.activeMembers} activos`,
      trend: stats.memberGrowth > 0 ? `+${stats.memberGrowth}%` : `${stats.memberGrowth}%`,
      trendColor: stats.memberGrowth > 0 ? 'text-emerald-600' : 'text-gray-500',
      icon: '👥',
      bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      hoverShadow: 'hover:shadow-blue-100'
    },
    {
      label: 'Sesiones Hoy',
      value: stats.sessionsToday,
      subtitle: `${stats.totalSessions} total`,
      trend: 'Programadas',
      trendColor: 'text-purple-600',
      icon: '📅',
      bgGradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      hoverShadow: 'hover:shadow-purple-100'
    },
    {
      label: 'Clases Activas',
      value: stats.totalClasses,
      subtitle: 'Disponibles',
      trend: 'Activas',
      trendColor: 'text-orange-600',
      icon: '🎯',
      bgGradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      hoverShadow: 'hover:shadow-orange-100'
    },
    {
      label: 'Ingresos Mes',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      subtitle: `${stats.trialMembers} en prueba`,
      trend: 'Mensual',
      trendColor: 'text-emerald-600',
      icon: '💰',
      bgGradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      hoverShadow: 'hover:shadow-emerald-100'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div 
          key={index} 
          className={`bg-white rounded-2xl p-6 shadow-sm border ${card.borderColor} hover:shadow-lg ${card.hoverShadow} transition-all duration-300 hover:scale-105 group cursor-pointer`}
        >
          {/* Header con icono y badge */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
              <span className={`text-2xl ${card.iconColor}`}>{card.icon}</span>
            </div>
            <span className={`text-xs font-semibold ${card.trendColor} bg-white px-3 py-1 rounded-full border ${card.borderColor} shadow-sm`}>
              {card.trend}
            </span>
          </div>

          {/* Contenido principal */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
              {card.value}
            </p>
            <p className="text-xs text-gray-500">{card.subtitle}</p>
          </div>

          {/* Barra de progreso decorativa */}
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${card.bgGradient} rounded-full transition-all duration-1000 ease-out`}
              style={{ 
                width: loading ? '0%' : `${Math.min(100, (typeof card.value === 'number' ? card.value : 50))}%` 
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
} 