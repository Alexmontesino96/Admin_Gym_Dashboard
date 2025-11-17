'use client'

import { useState, useEffect } from 'react'
import {
  Event,
  EventParticipation,
  PaymentStatusType,
  eventsAPI,
  formatPrice,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  GymParticipant,
  getUsersAPI,
} from '@/lib/api'
import {
  Users,
  Filter,
  DollarSign,
  RefreshCw,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import EventPaymentBadge from './EventPaymentBadge'

interface EventParticipantListEnhancedProps {
  event: Event
  isAdmin?: boolean
  onRefundSuccess?: (participation: EventParticipation) => void
  onPaymentStatusUpdate?: (participation: EventParticipation) => void
}

export default function EventParticipantListEnhanced({
  event,
  isAdmin = false,
  onRefundSuccess,
  onPaymentStatusUpdate,
}: EventParticipantListEnhancedProps) {
  const [participations, setParticipations] = useState<EventParticipation[]>([])
  const [users, setUsers] = useState<GymParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<PaymentStatusType | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Estados para acciones
  const [processingRefund, setProcessingRefund] = useState<number | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [expandedParticipant, setExpandedParticipant] = useState<number | null>(null)

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    refunded: 0,
    totalRevenue: 0,
    refundedAmount: 0,
  })

  // Cargar participaciones y usuarios
  useEffect(() => {
    loadData()
  }, [event.id])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      setWarnings([])
      const localWarnings: string[] = []

      // Cargar participaciones
      let participationsData: EventParticipation[] = []
      try {
        participationsData = await eventsAPI.getEventParticipations(event.id) as EventParticipation[]
        setParticipations(participationsData)
      } catch (err: any) {
        if (err.status === 404) {
          localWarnings.push('El endpoint de participaciones no está disponible')
          // Usar datos mock o vacíos como fallback
          participationsData = []
          setParticipations([])
        } else {
          throw err // Re-lanzar si no es 404
        }
      }

      // Cargar usuarios
      let usersData: GymParticipant[] = []
      try {
        usersData = await getUsersAPI.getGymParticipants()
        setUsers(usersData)
      } catch (err: any) {
        if (err.status === 404) {
          localWarnings.push('El endpoint de usuarios no está disponible')
          // Continuar sin datos de usuario
          setUsers([])
        } else {
          console.warn('Error cargando usuarios:', err)
          localWarnings.push('No se pudieron cargar los datos de usuarios')
        }
      }

      // Calcular estadísticas
      calculateStats(participationsData)

      // Actualizar advertencias
      if (localWarnings.length > 0) {
        setWarnings(localWarnings)
      }
    } catch (err: any) {
      console.error('Error cargando datos:', err)
      setError('Error al cargar los participantes')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: EventParticipation[]) => {
    const stats = {
      total: data.length,
      paid: 0,
      pending: 0,
      refunded: 0,
      totalRevenue: 0,
      refundedAmount: 0,
    }

    data.forEach((p) => {
      if (p.payment_status === PaymentStatusType.PAID) {
        stats.paid++
        stats.totalRevenue += p.amount_paid_cents || 0
      } else if (p.payment_status === PaymentStatusType.PENDING) {
        stats.pending++
      } else if (p.payment_status === PaymentStatusType.REFUNDED) {
        stats.refunded++
        stats.refundedAmount += p.amount_paid_cents || 0
      }
    })

    setStats(stats)
  }

  // Obtener información del usuario
  const getUserInfo = (memberId: number): GymParticipant | undefined => {
    return users.find((u) => u.id === memberId)
  }

  // Procesar reembolso
  const handleRefund = async (participation: EventParticipation) => {
    if (!window.confirm('¿Estás seguro de procesar el reembolso?')) return

    try {
      setProcessingRefund(participation.id)
      const updated = await eventsAPI.processRefund(participation.id, 'Reembolso manual por administrador')

      // Actualizar lista local
      setParticipations((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      )

      // Recalcular estadísticas
      calculateStats(
        participations.map((p) => (p.id === updated.id ? updated : p))
      )

      onRefundSuccess?.(updated)
    } catch (err: any) {
      console.error('Error procesando reembolso:', err)
      if (err.status === 404) {
        alert('El servicio de reembolsos no está disponible en este momento')
      } else if (err.status === 400) {
        alert('No se puede procesar el reembolso. Verifique la configuración del evento.')
      } else {
        alert(`Error al procesar el reembolso: ${err.message || 'Error desconocido'}`)
      }
    } finally {
      setProcessingRefund(null)
    }
  }

  // Actualizar estado de pago
  const handleStatusUpdate = async (participation: EventParticipation, newStatus: PaymentStatusType) => {
    try {
      setUpdatingStatus(participation.id)
      const updated = await eventsAPI.updatePaymentStatus(participation.id, newStatus)

      // Actualizar lista local
      setParticipations((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      )

      // Recalcular estadísticas
      calculateStats(
        participations.map((p) => (p.id === updated.id ? updated : p))
      )

      onPaymentStatusUpdate?.(updated)
    } catch (err: any) {
      console.error('Error actualizando estado:', err)
      if (err.status === 404) {
        alert('El servicio de actualización de pagos no está disponible')
      } else if (err.status === 403) {
        alert('No tienes permisos para actualizar el estado de pago')
      } else {
        alert(`Error al actualizar el estado: ${err.message || 'Error desconocido'}`)
      }
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Filtrar y ordenar participaciones
  const filteredParticipations = participations
    .filter((p) => {
      // Filtro por estado
      if (filterStatus !== 'ALL' && p.payment_status !== filterStatus) {
        return false
      }

      // Filtro por búsqueda
      if (searchTerm) {
        const user = getUserInfo(p.member_id)
        const fullName = user
          ? `${user.first_name} ${user.last_name}`.toLowerCase()
          : `ID ${p.member_id}`.toLowerCase()
        return fullName.includes(searchTerm.toLowerCase())
      }

      return true
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          const userA = getUserInfo(a.member_id)
          const userB = getUserInfo(b.member_id)
          const nameA = userA ? `${userA.first_name} ${userA.last_name}` : `ID ${a.member_id}`
          const nameB = userB ? `${userB.first_name} ${userB.last_name}` : `ID ${b.member_id}`
          comparison = nameA.localeCompare(nameB)
          break
        case 'date':
          comparison = new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime()
          break
        case 'amount':
          comparison = (a.amount_paid_cents || 0) - (b.amount_paid_cents || 0)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Estado', 'Monto Pagado', 'Fecha Registro', 'Estado Pago']
    const rows = filteredParticipations.map((p) => {
      const user = getUserInfo(p.member_id)
      return [
        user ? `${user.first_name} ${user.last_name}` : `ID ${p.member_id}`,
        user?.email || '',
        p.status,
        formatPrice(p.amount_paid_cents || 0, event.currency),
        new Date(p.registered_at).toLocaleDateString('es-ES'),
        p.payment_status || '',
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `participantes-${event.title.replace(/\s+/g, '-')}-${Date.now()}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando participantes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <AlertTriangle className="w-5 h-5 inline mr-2" />
        {error}
        <button
          onClick={loadData}
          className="ml-4 text-sm underline hover:no-underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Advertencias */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Algunos servicios no están completamente disponibles:
              </p>
              <ul className="mt-1 text-xs text-yellow-600 list-disc list-inside">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {event.is_paid && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagados</p>
                <p className="text-2xl font-semibold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-xl font-semibold text-blue-600">
                  {formatPrice(stats.totalRevenue, event.currency)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reembolsado</p>
                <p className="text-xl font-semibold text-purple-600">
                  {formatPrice(stats.refundedAmount, event.currency)}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Controles de filtro */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar participante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de estado */}
          {event.is_paid && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PaymentStatusType | 'ALL')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos los estados</option>
              <option value={PaymentStatusType.PENDING}>Pendientes</option>
              <option value={PaymentStatusType.PAID}>Pagados</option>
              <option value={PaymentStatusType.REFUNDED}>Reembolsados</option>
              <option value={PaymentStatusType.CREDITED}>Con crédito</option>
              <option value={PaymentStatusType.EXPIRED}>Expirados</option>
            </select>
          )}

          {/* Ordenar por */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'amount')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Fecha de registro</option>
            <option value="name">Nombre</option>
            {event.is_paid && <option value="amount">Monto pagado</option>}
          </select>

          {/* Orden */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Ascendente
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Descendente
              </>
            )}
          </button>
        </div>

        {/* Botón exportar */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Lista de participantes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              {event.is_paid && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Registro
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParticipations.length === 0 ? (
              <tr>
                <td
                  colSpan={event.is_paid ? (isAdmin ? 6 : 5) : (isAdmin ? 4 : 3)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No hay participantes que mostrar
                </td>
              </tr>
            ) : (
              filteredParticipations.map((participation) => {
                const user = getUserInfo(participation.member_id)
                const isExpanded = expandedParticipant === participation.id

                return (
                  <React.Fragment key={participation.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user ? `${user.first_name} ${user.last_name}` : `ID ${participation.member_id}`}
                            </div>
                            <div className="text-sm text-gray-500">{user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            participation.status === 'REGISTERED'
                              ? 'bg-green-100 text-green-800'
                              : participation.status === 'WAITING_LIST'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {participation.status === 'REGISTERED'
                            ? 'Registrado'
                            : participation.status === 'WAITING_LIST'
                            ? 'Lista espera'
                            : 'Cancelado'}
                        </span>
                      </td>
                      {event.is_paid && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <EventPaymentBadge
                              isPaid={true}
                              paymentStatus={participation.payment_status}
                              showStatus={true}
                              size="sm"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {participation.amount_paid_cents
                              ? formatPrice(participation.amount_paid_cents, event.currency)
                              : '-'}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(participation.registered_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {event.is_paid && participation.payment_status === PaymentStatusType.PAID && (
                            <button
                              onClick={() => handleRefund(participation)}
                              disabled={processingRefund === participation.id}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              {processingRefund === participation.id ? (
                                <Loader2 className="w-4 h-4 animate-spin inline" />
                              ) : (
                                'Reembolsar'
                              )}
                            </button>
                          )}
                          {event.is_paid && participation.payment_status === PaymentStatusType.PENDING && (
                            <button
                              onClick={() => handleStatusUpdate(participation, PaymentStatusType.PAID)}
                              disabled={updatingStatus === participation.id}
                              className="text-green-600 hover:text-green-900"
                            >
                              {updatingStatus === participation.id ? (
                                <Loader2 className="w-4 h-4 animate-spin inline" />
                              ) : (
                                'Marcar pagado'
                              )}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setExpandedParticipant(isExpanded ? null : participation.id)
                            }
                            className="text-gray-400 hover:text-gray-600 ml-2"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 inline" />
                            ) : (
                              <ChevronDown className="w-4 h-4 inline" />
                            )}
                          </button>
                        </td>
                      )}
                    </tr>

                    {/* Fila expandida con detalles */}
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={event.is_paid ? (isAdmin ? 6 : 5) : (isAdmin ? 4 : 3)} className="px-6 py-4">
                          <div className="text-sm space-y-2">
                            {participation.payment_deadline && (
                              <p>
                                <strong>Fecha límite de pago:</strong>{' '}
                                {new Date(participation.payment_deadline).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                            {participation.cancelled_at && (
                              <p>
                                <strong>Cancelado el:</strong>{' '}
                                {new Date(participation.cancelled_at).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                            {user && (
                              <div>
                                <p>
                                  <strong>Email:</strong> {user.email || 'No registrado'}
                                </p>
                                <p>
                                  <strong>Rol en el gym:</strong> {user.gym_role || 'Miembro'}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Re-export para compatibilidad
import React from 'react'