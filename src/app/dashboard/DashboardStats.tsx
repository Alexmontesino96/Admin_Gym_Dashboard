'use client'

import { useState, useEffect } from 'react'
import { membershipsAPI, eventsAPI, getUsersAPI, gymsAPI } from '@/lib/api'
import { useTerminology } from '@/hooks/useTerminology'
import { useWorkspace } from '@/hooks/useWorkspace'
import { Users, Calendar, Target, DollarSign } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  trialMembers: number
  totalSessions: number
  sessionsToday: number
  totalClasses: number
  monthlyRevenue: number
  memberGrowth: number
  // Para trainers
  maxClients?: number
  activeClients?: number
}

export default function DashboardStats() {
  const { userPlural } = useTerminology()
  const { isTrainer } = useWorkspace()

  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    trialMembers: 0,
    totalSessions: 0,
    sessionsToday: 0,
    totalClasses: 0,
    monthlyRevenue: 0,
    memberGrowth: 0,
    maxClients: undefined,
    activeClients: undefined
  })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)

      const [membershipData, sessionsData, classesData, membersData, gymData] = await Promise.allSettled([
        membershipsAPI.getMembershipSummary(),
        eventsAPI.getSessions({ limit: 200 }),
        eventsAPI.getClasses(true, { limit: 100 }),
        getUsersAPI.getGymParticipants({ role: 'MEMBER', limit: 50 }),
        gymsAPI.getGymInfo()
      ])

      // Procesar datos de membresías
      const membership = membershipData.status === 'fulfilled' ? membershipData.value : null
      const sessions = sessionsData.status === 'fulfilled' ? sessionsData.value : []
      const classes = classesData.status === 'fulfilled' ? classesData.value : []
      const members = membersData.status === 'fulfilled' ? membersData.value : []
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

      // TODO: IMPORTANTE - Este cálculo de Member Growth es INCORRECTO
      // Actualmente calcula: (trial_members / total_members) * 100
      // Esto NO es crecimiento, es el porcentaje de miembros en prueba
      //
      // El cálculo correcto debería ser:
      // memberGrowth = ((miembros_mes_actual - miembros_mes_anterior) / miembros_mes_anterior) * 100
      //
      // Requiere cambio en backend para agregar campo "member_growth" al endpoint
      // /memberships/summary que calcule el crecimiento real comparando con mes anterior
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
        memberGrowth,
        maxClients: gym?.max_clients,
        activeClients: gym?.active_clients_count
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

  // Primera tarjeta: usuarios (adaptativa)
  const firstCard = isTrainer && stats.maxClients ? {
    label: `${userPlural.charAt(0).toUpperCase() + userPlural.slice(1)} Totales`,
    value: stats.activeClients || stats.totalMembers,
    subtitle: `Capacidad: ${stats.maxClients}`,
    trend: `${Math.round(((stats.activeClients || stats.totalMembers) / stats.maxClients) * 100)}%`,
    trendColor: ((stats.activeClients || stats.totalMembers) / stats.maxClients) < 0.8 ? 'text-emerald-600' : 'text-orange-600',
    Icon: Users,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
    hoverBorder: 'hover:border-blue-300'
  } : {
    label: `${userPlural.charAt(0).toUpperCase() + userPlural.slice(1)} Totales`,
    value: stats.totalMembers,
    subtitle: `${stats.activeMembers} activos`,
    trend: stats.memberGrowth > 0 ? `+${stats.memberGrowth}%` : `${stats.memberGrowth}%`,
    trendColor: stats.memberGrowth > 0 ? 'text-emerald-600' : 'text-gray-500',
    Icon: Users,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
    hoverBorder: 'hover:border-blue-300'
  }

  const statCards = [
    firstCard,
    {
      label: 'Sesiones Hoy',
      value: stats.sessionsToday,
      subtitle: `${stats.totalSessions} total`,
      trend: 'Hoy',
      trendColor: 'text-purple-600',
      Icon: Calendar,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-100',
      hoverBorder: 'hover:border-purple-300'
    },
    {
      label: 'Clases Activas',
      value: stats.totalClasses,
      subtitle: 'Disponibles',
      trend: 'Activas',
      trendColor: 'text-orange-600',
      Icon: Target,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-100',
      hoverBorder: 'hover:border-orange-300'
    },
    {
      label: 'Ingresos Mes',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      subtitle: `${stats.trialMembers} en prueba`,
      trend: 'MRR',
      trendColor: 'text-emerald-600',
      Icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      hoverBorder: 'hover:border-emerald-300'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.Icon as LucideIcon
        return (
          <div
            key={index}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 ${card.borderColor} ${card.hoverBorder} transition-all duration-200`}
          >
            {/* Header con icono */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <span className={`text-xs font-semibold ${card.trendColor} px-2 py-1 rounded-md`}>
                {card.trend}
              </span>
            </div>

            {/* Contenido principal */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">
                {card.value}
              </p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
} 