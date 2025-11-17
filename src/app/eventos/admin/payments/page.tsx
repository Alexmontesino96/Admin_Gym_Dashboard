'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Event,
  EventParticipation,
  EventPaymentStats,
  PaymentStatusType,
  eventsAPI,
  formatPrice,
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getRefundPolicyLabel,
} from '@/lib/api'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  Users,
  RefreshCw,
  Download,
  Filter,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import EventPaymentBadge from '@/components/EventPaymentBadge'

export default function EventPaymentsDashboard() {
  const router = useRouter()

  // Estados principales
  const [paymentEvents, setPaymentEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventPayments, setEventPayments] = useState<EventParticipation[]>([])
  const [eventStats, setEventStats] = useState<EventPaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estado para tracking de endpoints no disponibles
  const [missingEndpoints, setMissingEndpoints] = useState<string[]>([])

  // Estados de filtros
  const [filterOnlyActive, setFilterOnlyActive] = useState(true)
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<PaymentStatusType | 'ALL'>('ALL')
  const [filterDateRange, setFilterDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  })

  // Estadísticas globales
  const [globalStats, setGlobalStats] = useState({
    totalRevenue: 0,
    totalEvents: 0,
    totalPaidParticipants: 0,
    totalPendingPayments: 0,
    totalRefunded: 0,
    averageTicketPrice: 0,
  })

  // Cargar eventos de pago
  useEffect(() => {
    loadPaymentEvents()
  }, [filterOnlyActive])

  const loadPaymentEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const events = await eventsAPI.getPaymentEvents(filterOnlyActive)
      setPaymentEvents(events)

      // Calcular estadísticas globales
      calculateGlobalStats(events)
    } catch (err: any) {
      console.error('Error cargando eventos de pago:', err)
      setError('Error al cargar los eventos de pago')
    } finally {
      setLoading(false)
    }
  }

  const calculateGlobalStats = async (events: Event[]) => {
    let totalRevenue = 0
    let totalPaidParticipants = 0
    let totalPendingPayments = 0
    let totalRefunded = 0
    let eventsWithStats = 0
    const localMissingEndpoints = new Set<string>()

    // Para cada evento, obtener sus estadísticas
    // NOTA: Si el endpoint no está disponible, usamos valores aproximados basados en los datos del evento
    for (const event of events) {
      try {
        // Intentar obtener estadísticas del backend si está disponible
        const stats = await eventsAPI.getEventPaymentStats(event.id)
        totalRevenue += stats.total_revenue_cents
        totalPaidParticipants += stats.paid_participants
        totalPendingPayments += stats.pending_participants
        totalRefunded += stats.refunded_amount_cents
        eventsWithStats++
      } catch (err: any) {
        // Si el endpoint no existe (404), usar estimaciones basadas en los datos del evento
        if (err.message === 'Not Found' || err.status === 404) {
          localMissingEndpoints.add('payment-stats')
          // Estimación basada en participantes y precio
          const estimatedRevenue = (event.participants_count || 0) * (event.price_cents || 0)
          totalRevenue += estimatedRevenue
          totalPaidParticipants += event.participants_count || 0
          // No podemos estimar pending/refunded sin el endpoint real
        } else {
          console.warn(`Error obteniendo estadísticas del evento ${event.id}:`, err.message)
        }
      }
    }

    // Actualizar el estado de endpoints faltantes
    setMissingEndpoints(Array.from(localMissingEndpoints))

    const averageTicketPrice = totalPaidParticipants > 0
      ? totalRevenue / totalPaidParticipants
      : 0

    setGlobalStats({
      totalRevenue,
      totalEvents: events.length,
      totalPaidParticipants,
      totalPendingPayments: eventsWithStats > 0 ? totalPendingPayments : -1, // -1 indica que no hay datos reales
      totalRefunded: eventsWithStats > 0 ? totalRefunded : -1,
      averageTicketPrice,
    })
  }

  // Cargar detalles de un evento específico
  const loadEventDetails = async (event: Event) => {
    try {
      setLoadingDetails(true)
      setSelectedEvent(event)

      // Primero intentar cargar los pagos (esto debería funcionar)
      const payments = await eventsAPI.getEventPayments(
        event.id,
        filterPaymentStatus !== 'ALL' ? filterPaymentStatus : undefined
      )
      setEventPayments(payments)

      // Luego intentar cargar las estadísticas (puede fallar si el endpoint no existe)
      try {
        const stats = await eventsAPI.getEventPaymentStats(event.id)
        setEventStats(stats)
      } catch (statsErr: any) {
        // Si el endpoint de estadísticas no existe, calcular estadísticas localmente
        if (statsErr.message === 'Not Found' || statsErr.status === 404) {
          const localStats: EventPaymentStats = {
            total_revenue_cents: payments.reduce((sum, p) => sum + (p.amount_paid_cents || 0), 0),
            paid_participants: payments.filter(p => p.payment_status === PaymentStatusType.PAID).length,
            pending_participants: payments.filter(p => p.payment_status === PaymentStatusType.PENDING).length,
            refunded_amount_cents: payments
              .filter(p => p.payment_status === PaymentStatusType.REFUNDED)
              .reduce((sum, p) => sum + (p.amount_paid_cents || 0), 0),
            conversion_rate: payments.length > 0
              ? (payments.filter(p => p.payment_status === PaymentStatusType.PAID).length / payments.length) * 100
              : 0
          }
          setEventStats(localStats)
        } else {
          console.warn('Error cargando estadísticas del evento:', statsErr.message)
          // Usar estadísticas básicas si hay otro tipo de error
          setEventStats(null)
        }
      }
    } catch (err: any) {
      console.error('Error cargando detalles del evento:', err)
      setError('Error al cargar los detalles del evento')
    } finally {
      setLoadingDetails(false)
    }
  }

  // Procesar reembolso
  const handleRefund = async (participationId: number) => {
    if (!window.confirm('¿Estás seguro de procesar el reembolso?')) return

    try {
      await eventsAPI.processRefund(participationId, 'Reembolso procesado desde dashboard')
      // Recargar datos
      if (selectedEvent) {
        await loadEventDetails(selectedEvent)
      }
      await loadPaymentEvents()
    } catch (err: any) {
      console.error('Error procesando reembolso:', err)
      alert('Error al procesar el reembolso')
    }
  }

  // Actualizar estado de pago
  const handleUpdatePaymentStatus = async (participationId: number, newStatus: PaymentStatusType) => {
    try {
      await eventsAPI.updatePaymentStatus(participationId, newStatus)
      // Recargar datos
      if (selectedEvent) {
        await loadEventDetails(selectedEvent)
      }
      await loadPaymentEvents()
    } catch (err: any) {
      console.error('Error actualizando estado:', err)
      alert('Error al actualizar el estado de pago')
    }
  }

  // Exportar a CSV
  const exportToCSV = () => {
    const headers = ['Evento', 'Fecha', 'Participante', 'Estado Pago', 'Monto', 'Fecha Registro']
    const rows: string[][] = []

    eventPayments.forEach((payment) => {
      rows.push([
        selectedEvent?.title || '',
        new Date(selectedEvent?.start_time || '').toLocaleDateString('es-ES'),
        `Usuario ${payment.member_id}`, // TODO: Obtener nombre real
        getPaymentStatusLabel(payment.payment_status || PaymentStatusType.PENDING),
        formatPrice(payment.amount_paid_cents || 0, selectedEvent?.currency || 'EUR'),
        new Date(payment.registered_at).toLocaleDateString('es-ES'),
      ])
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pagos-eventos-${Date.now()}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando dashboard de pagos...</span>
      </div>
    )
  }

  if (error && !paymentEvents.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadPaymentEvents}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/eventos"
                  className="mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard de Pagos de Eventos</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Gestiona y monitorea los pagos de todos tus eventos
                  </p>
                </div>
              </div>
              <button
                onClick={loadPaymentEvents}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notificación de endpoints faltantes */}
      {missingEndpoints.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Algunos endpoints del backend no están disponibles. Los datos mostrados son estimaciones basadas en la información disponible.
                  {missingEndpoints.includes('payment-stats') && (
                    <span className="block text-xs mt-1">
                      • Las estadísticas de pago detalladas no están disponibles
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(globalStats.totalRevenue, 'EUR')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos de Pago</p>
                <p className="text-2xl font-bold text-blue-600">{globalStats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {globalStats.totalPaidParticipants}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {globalStats.totalPendingPayments >= 0 ? globalStats.totalPendingPayments : '-'}
                </p>
                {globalStats.totalPendingPayments < 0 && (
                  <p className="text-xs text-gray-400">Sin datos</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reembolsado</p>
                <p className="text-xl font-bold text-purple-600">
                  {globalStats.totalRefunded >= 0
                    ? formatPrice(globalStats.totalRefunded, 'EUR')
                    : '-'}
                </p>
                {globalStats.totalRefunded < 0 && (
                  <p className="text-xs text-gray-400">Sin datos</p>
                )}
              </div>
              <RefreshCw className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(Math.round(globalStats.averageTicketPrice), 'EUR')}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filterOnlyActive}
                  onChange={(e) => setFilterOnlyActive(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Solo eventos activos</span>
              </label>

              {selectedEvent && (
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => {
                    setFilterPaymentStatus(e.target.value as PaymentStatusType | 'ALL')
                    if (selectedEvent) {
                      loadEventDetails(selectedEvent)
                    }
                  }}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value={PaymentStatusType.PENDING}>Pendientes</option>
                  <option value={PaymentStatusType.PAID}>Pagados</option>
                  <option value={PaymentStatusType.REFUNDED}>Reembolsados</option>
                  <option value={PaymentStatusType.CREDITED}>Con crédito</option>
                  <option value={PaymentStatusType.EXPIRED}>Expirados</option>
                </select>
              )}
            </div>

            {selectedEvent && (
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {/* Lista de eventos o detalles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de eventos */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Eventos con Pagos</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {paymentEvents.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay eventos de pago activos
                  </div>
                ) : (
                  paymentEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => loadEventDetails(event)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedEvent?.id === event.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.start_time).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <div className="mt-2 flex items-center space-x-2">
                            <EventPaymentBadge
                              isPaid={true}
                              priceCents={event.price_cents}
                              currency={event.currency}
                              size="sm"
                            />
                            <span className="text-xs text-gray-500">
                              {event.participants_count} participantes
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Detalles del evento seleccionado */}
          <div className="lg:col-span-2">
            {!selectedEvent ? (
              <div className="bg-white rounded-lg shadow p-12">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Selecciona un evento para ver los detalles de pagos</p>
                </div>
              </div>
            ) : loadingDetails ? (
              <div className="bg-white rounded-lg shadow p-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Cargando detalles...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Información del evento */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{selectedEvent.title}</h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Precio</p>
                      <p className="font-semibold">
                        {formatPrice(selectedEvent.price_cents || 0, selectedEvent.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Política</p>
                      <p className="font-semibold">
                        {getRefundPolicyLabel(selectedEvent.refund_policy!)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Capacidad</p>
                      <p className="font-semibold">
                        {selectedEvent.participants_count} / {selectedEvent.max_participants || '∞'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha</p>
                      <p className="font-semibold">
                        {new Date(selectedEvent.start_time).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  {/* Estadísticas del evento */}
                  {eventStats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Ingresos</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(eventStats.total_revenue_cents, selectedEvent.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pagados</p>
                        <p className="text-lg font-bold text-green-600">{eventStats.paid_participants}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pendientes</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {eventStats.pending_participants}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reembolsado</p>
                        <p className="text-lg font-bold text-purple-600">
                          {formatPrice(eventStats.refunded_amount_cents, selectedEvent.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Conversión</p>
                        <p className="text-lg font-bold text-blue-600">
                          {eventStats.conversion_rate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lista de pagos */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Pagos del Evento</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {eventPayments.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No hay pagos registrados para este evento
                      </div>
                    ) : (
                      eventPayments.map((payment) => (
                        <div key={payment.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Usuario #{payment.member_id}
                              </p>
                              <p className="text-xs text-gray-500">
                                Registrado:{' '}
                                {new Date(payment.registered_at).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <EventPaymentBadge
                                isPaid={true}
                                paymentStatus={payment.payment_status}
                                showStatus={true}
                                size="sm"
                              />
                              {payment.amount_paid_cents ? (
                                <span className="text-sm font-semibold">
                                  {formatPrice(payment.amount_paid_cents, selectedEvent.currency)}
                                </span>
                              ) : null}
                              {payment.payment_status === PaymentStatusType.PAID && (
                                <button
                                  onClick={() => handleRefund(payment.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Reembolsar
                                </button>
                              )}
                              {payment.payment_status === PaymentStatusType.PENDING && (
                                <button
                                  onClick={() =>
                                    handleUpdatePaymentStatus(payment.id, PaymentStatusType.PAID)
                                  }
                                  className="text-xs text-green-600 hover:text-green-800"
                                >
                                  Marcar pagado
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}