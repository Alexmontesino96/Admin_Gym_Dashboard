'use client'

import { formatPrice, PaymentStatusType, getPaymentStatusLabel, getPaymentStatusColor } from '@/lib/api'
import { CreditCard, Tag, Clock, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react'

interface EventPaymentBadgeProps {
  isPaid: boolean
  priceCents?: number
  currency?: string
  paymentStatus?: PaymentStatusType
  showStatus?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function EventPaymentBadge({
  isPaid,
  priceCents = 0,
  currency = 'EUR',
  paymentStatus,
  showStatus = false,
  size = 'md',
  className = ''
}: EventPaymentBadgeProps) {
  // Configuración de tamaños
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  // Icono según estado de pago
  const getStatusIcon = () => {
    if (!paymentStatus || !showStatus) return null

    switch (paymentStatus) {
      case PaymentStatusType.PENDING:
        return <Clock className={`${iconSizes[size]} mr-1`} />
      case PaymentStatusType.PAID:
        return <CheckCircle className={`${iconSizes[size]} mr-1`} />
      case PaymentStatusType.REFUNDED:
        return <RefreshCw className={`${iconSizes[size]} mr-1`} />
      case PaymentStatusType.CREDITED:
        return <CreditCard className={`${iconSizes[size]} mr-1`} />
      case PaymentStatusType.EXPIRED:
        return <AlertTriangle className={`${iconSizes[size]} mr-1`} />
      default:
        return null
    }
  }

  // Si es evento gratuito
  if (!isPaid) {
    return (
      <span
        className={`
          inline-flex items-center rounded-full font-medium
          bg-green-100 text-green-800 border border-green-200
          ${sizeClasses[size]}
          ${className}
        `}
      >
        <Tag className={`${iconSizes[size]} mr-1`} />
        GRATIS
      </span>
    )
  }

  // Si es evento de pago y queremos mostrar el estado
  if (showStatus && paymentStatus) {
    return (
      <span
        className={`
          inline-flex items-center rounded-full font-medium border
          ${getPaymentStatusColor(paymentStatus)}
          ${sizeClasses[size]}
          ${className}
        `}
      >
        {getStatusIcon()}
        {getPaymentStatusLabel(paymentStatus)}
      </span>
    )
  }

  // Mostrar precio del evento
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold
        bg-blue-100 text-blue-800 border border-blue-200
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <CreditCard className={`${iconSizes[size]} mr-1`} />
      {formatPrice(priceCents, currency)}
    </span>
  )
}

// Componente adicional para mostrar múltiples badges
interface EventPaymentInfoProps {
  isPaid: boolean
  priceCents?: number
  currency?: string
  paymentStatus?: PaymentStatusType
  paidCount?: number
  totalCount?: number
  size?: 'sm' | 'md' | 'lg'
}

export function EventPaymentInfo({
  isPaid,
  priceCents = 0,
  currency = 'EUR',
  paymentStatus,
  paidCount = 0,
  totalCount = 0,
  size = 'sm'
}: EventPaymentInfoProps) {
  if (!isPaid) {
    return <EventPaymentBadge isPaid={false} size={size} />
  }

  return (
    <div className="flex items-center space-x-2">
      <EventPaymentBadge
        isPaid={true}
        priceCents={priceCents}
        currency={currency}
        size={size}
      />

      {/* Mostrar contador de pagos si hay participantes */}
      {totalCount > 0 && (
        <span
          className={`
            inline-flex items-center rounded-full font-medium
            ${paidCount === totalCount
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }
            ${size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'md' ? 'text-sm px-2.5 py-1' : 'text-base px-3 py-1.5'}
          `}
        >
          💳 {paidCount}/{totalCount}
        </span>
      )}

      {/* Mostrar estado de pago personal si existe */}
      {paymentStatus && (
        <EventPaymentBadge
          isPaid={true}
          paymentStatus={paymentStatus}
          showStatus={true}
          size={size}
        />
      )}
    </div>
  )
}