'use client'

import { useState, useEffect } from 'react'
import { RefundPolicyType, formatPrice, getRefundPolicyLabel } from '@/lib/api'
import { CreditCard, AlertCircle, Info } from 'lucide-react'

interface EventPaymentConfigProps {
  // Valores actuales
  isPaid: boolean
  priceCents?: number
  currency?: string
  refundPolicy?: RefundPolicyType
  refundDeadlineHours?: number
  partialRefundPercentage?: number

  // Callbacks para actualizar valores
  onIsPaidChange: (isPaid: boolean) => void
  onPriceChange: (cents: number) => void
  onCurrencyChange: (currency: string) => void
  onRefundPolicyChange: (policy: RefundPolicyType) => void
  onDeadlineHoursChange: (hours: number) => void
  onPercentageChange: (percentage: number) => void

  // Control de edición
  disabled?: boolean
  hasExistingPayments?: boolean
}

export default function EventPaymentConfig({
  isPaid,
  priceCents = 0,
  currency = 'EUR',
  refundPolicy = RefundPolicyType.FULL_REFUND,
  refundDeadlineHours = 24,
  partialRefundPercentage = 50,
  onIsPaidChange,
  onPriceChange,
  onCurrencyChange,
  onRefundPolicyChange,
  onDeadlineHoursChange,
  onPercentageChange,
  disabled = false,
  hasExistingPayments = false
}: EventPaymentConfigProps) {
  // Estado local para el precio en formato decimal (euros)
  const [priceDisplay, setPriceDisplay] = useState<string>((priceCents / 100).toFixed(2))

  useEffect(() => {
    if (!isPaid) {
      setPriceDisplay('0.00')
    } else {
      setPriceDisplay((priceCents / 100).toFixed(2))
    }
  }, [isPaid, priceCents])

  const handlePriceDisplayChange = (value: string) => {
    // Permitir solo números y un punto decimal
    const cleaned = value.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')

    // Limitar a 2 decimales
    if (parts[1]?.length > 2) {
      return
    }

    setPriceDisplay(cleaned)

    // Convertir a centavos
    const floatValue = parseFloat(cleaned)
    if (!isNaN(floatValue)) {
      onPriceChange(Math.round(floatValue * 100))
    }
  }

  const handleIsPaidToggle = (checked: boolean) => {
    onIsPaidChange(checked)
    if (!checked) {
      // Resetear valores cuando se desmarca evento de pago
      onPriceChange(0)
      onRefundPolicyChange(RefundPolicyType.FULL_REFUND)
      onDeadlineHoursChange(24)
      onPercentageChange(50)
    }
  }

  // Descripción de políticas
  const getPolicyDescription = (policy: RefundPolicyType): string => {
    switch (policy) {
      case RefundPolicyType.NO_REFUND:
        return 'Los participantes no podrán recibir reembolso bajo ninguna circunstancia'
      case RefundPolicyType.FULL_REFUND:
        return 'Reembolso del 100% si se cancela dentro del plazo establecido'
      case RefundPolicyType.PARTIAL_REFUND:
        return 'Reembolso parcial según el porcentaje configurado'
      case RefundPolicyType.CREDIT:
        return 'Se otorgará crédito para futuros eventos en lugar de reembolso en efectivo'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6 border-t pt-6">
      {/* Encabezado de sección */}
      <div className="flex items-center space-x-3">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configuración de Pago</h3>
      </div>

      {/* Toggle de evento de pago */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="is-paid"
          checked={isPaid}
          onChange={(e) => handleIsPaidToggle(e.target.checked)}
          disabled={disabled || hasExistingPayments}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
        />
        <div className="flex-1">
          <label htmlFor="is-paid" className="block text-sm font-medium text-gray-900">
            Este es un evento de pago
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Los participantes deberán pagar para registrarse a este evento
          </p>
          {hasExistingPayments && (
            <div className="mt-2 flex items-start space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Este evento ya tiene pagos procesados. No se puede cambiar a evento gratuito.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Campos de configuración de pago */}
      {isPaid && (
        <div className="space-y-6 pl-7 animate-in slide-in-from-top-2 duration-300">
          {/* Precio y moneda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio del evento *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="price"
                  value={priceDisplay}
                  onChange={(e) => handlePriceDisplayChange(e.target.value)}
                  disabled={disabled || hasExistingPayments}
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="0.00"
                  required
                />
                <span className="absolute left-3 top-2.5 text-gray-500">
                  {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£'}
                </span>
              </div>
              {priceCents > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Se mostrará como: {formatPrice(priceCents, currency)}
                </p>
              )}
              {hasExistingPayments && (
                <p className="mt-1 text-xs text-amber-600">
                  No se puede cambiar el precio con pagos existentes
                </p>
              )}
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                disabled={disabled || hasExistingPayments}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              >
                <option value="EUR">EUR (€) - Euro</option>
                <option value="USD">USD ($) - Dólar</option>
                <option value="GBP">GBP (£) - Libra</option>
              </select>
            </div>
          </div>

          {/* Política de reembolso */}
          <div>
            <label htmlFor="refund-policy" className="block text-sm font-medium text-gray-700 mb-2">
              Política de reembolso *
            </label>
            <select
              id="refund-policy"
              value={refundPolicy}
              onChange={(e) => onRefundPolicyChange(e.target.value as RefundPolicyType)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            >
              <option value={RefundPolicyType.NO_REFUND}>Sin reembolso</option>
              <option value={RefundPolicyType.FULL_REFUND}>Reembolso completo</option>
              <option value={RefundPolicyType.PARTIAL_REFUND}>Reembolso parcial</option>
              <option value={RefundPolicyType.CREDIT}>Solo crédito</option>
            </select>

            <div className="mt-2 flex items-start space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{getPolicyDescription(refundPolicy)}</span>
            </div>
          </div>

          {/* Configuración adicional según política */}
          {refundPolicy !== RefundPolicyType.NO_REFUND && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plazo de reembolso */}
              <div>
                <label htmlFor="deadline-hours" className="block text-sm font-medium text-gray-700 mb-2">
                  Plazo para reembolso *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    id="deadline-hours"
                    value={refundDeadlineHours}
                    onChange={(e) => onDeadlineHoursChange(parseInt(e.target.value) || 24)}
                    disabled={disabled}
                    min="1"
                    max="720"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    required
                  />
                  <span className="text-sm text-gray-600">horas antes</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Los participantes pueden cancelar hasta {refundDeadlineHours} horas antes del evento
                </p>
              </div>

              {/* Porcentaje de reembolso parcial */}
              {refundPolicy === RefundPolicyType.PARTIAL_REFUND && (
                <div>
                  <label htmlFor="refund-percentage" className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje de reembolso *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      id="refund-percentage"
                      value={partialRefundPercentage}
                      onChange={(e) => onPercentageChange(parseInt(e.target.value) || 50)}
                      disabled={disabled}
                      min="1"
                      max="99"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      required
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Se reembolsará el {partialRefundPercentage}% del precio ({formatPrice(Math.round(priceCents * partialRefundPercentage / 100), currency)})
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Resumen de configuración */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Resumen de configuración:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Precio: <strong>{formatPrice(priceCents, currency)}</strong></li>
              <li>• Política: <strong>{getRefundPolicyLabel(refundPolicy)}</strong></li>
              {refundPolicy !== RefundPolicyType.NO_REFUND && (
                <>
                  <li>• Plazo de cancelación: <strong>{refundDeadlineHours} horas antes</strong></li>
                  {refundPolicy === RefundPolicyType.PARTIAL_REFUND && (
                    <li>• Reembolso: <strong>{partialRefundPercentage}% ({formatPrice(Math.round(priceCents * partialRefundPercentage / 100), currency)})</strong></li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}