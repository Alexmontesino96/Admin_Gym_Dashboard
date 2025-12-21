'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CreditCard, UserX, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Alert {
  type: 'expiring' | 'pending_payment' | 'inactive'
  count: number
  amount?: number
  action: string
  href: string
}

export default function CriticalAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAlerts() {
      try {
        // TODO: Reemplazar con API call real cuando el backend esté listo
        // const data = await dashboardAPI.getCriticalAlerts()

        // Mock data temporal
        await new Promise(resolve => setTimeout(resolve, 500))

        const mockData = {
          expiring_memberships: 12,
          pending_payments: 3,
          pending_amount: 450,
          inactive_members: 8
        }

        const alertsList: Alert[] = []

        if (mockData.expiring_memberships > 0) {
          alertsList.push({
            type: 'expiring',
            count: mockData.expiring_memberships,
            action: 'Recordar pagos',
            href: '/membership?filter=expiring'
          })
        }

        if (mockData.pending_payments > 0) {
          alertsList.push({
            type: 'pending_payment',
            count: mockData.pending_payments,
            amount: mockData.pending_amount,
            action: 'Enviar facturas',
            href: '/membership?filter=pending'
          })
        }

        if (mockData.inactive_members > 0) {
          alertsList.push({
            type: 'inactive',
            count: mockData.inactive_members,
            action: 'Re-engagement',
            href: '/usuarios?filter=inactive'
          })
        }

        setAlerts(alertsList)
      } catch (error) {
        console.error('Error loading alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-xl">✓</span>
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Todo en orden</h3>
            <p className="text-sm text-green-700">No hay alertas críticas en este momento</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <span>Alertas Críticas</span>
        </h3>
        <Link
          href="/membership"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todo
        </Link>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const config = {
            expiring: {
              icon: AlertTriangle,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
              border: 'border-orange-200',
              text: `${alert.count} membresías expiran en 7 días`
            },
            pending_payment: {
              icon: CreditCard,
              color: 'text-red-600',
              bg: 'bg-red-50',
              border: 'border-red-200',
              text: `${alert.count} pagos pendientes ${alert.amount ? `($${alert.amount.toLocaleString()})` : ''}`
            },
            inactive: {
              icon: UserX,
              color: 'text-gray-600',
              bg: 'bg-gray-50',
              border: 'border-gray-200',
              text: `${alert.count} miembros inactivos (>14 días)`
            }
          }[alert.type]

          const Icon = config.icon

          return (
            <Link
              key={index}
              href={alert.href}
              className={`flex items-center justify-between p-4 ${config.bg} border ${config.border} rounded-xl hover:shadow-md transition-all duration-200 group`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{config.text}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-600 font-medium group-hover:underline">
                  {alert.action}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
