'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import {
  Event,
  EventParticipation,
  eventsAPI,
  formatPrice,
  getRefundPolicyLabel,
  RefundPolicyType,
} from '@/lib/api'
import { X, CreditCard, AlertCircle, CheckCircle, Loader2, Info, Shield } from 'lucide-react'

// Inicializar Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface EventPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
  participationId: number
  onPaymentSuccess: (participation: EventParticipation) => void
}

// Componente interno que usa los hooks de Stripe
function PaymentForm({
  event,
  participationId,
  onSuccess,
  onCancel,
}: {
  event: Event
  participationId: number
  onSuccess: (participation: EventParticipation) => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  // Obtener Payment Intent del backend
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await eventsAPI.createPaymentIntent(participationId)
        setClientSecret(response.client_secret)
      } catch (err: any) {
        console.error('Error creando payment intent:', err)

        // Manejo específico de errores
        if (err.status === 404) {
          setError('El servicio de pagos no está disponible. Por favor, intenta más tarde.')
        } else if (err.status === 400) {
          setError('Error en la configuración del evento. Contacta al administrador.')
        } else if (err.status === 402) {
          setError('El pago ya fue procesado o el evento está completo.')
        } else if (err.status === 503) {
          setError('Servicio temporalmente no disponible. Por favor, intenta en unos minutos.')
        } else {
          setError(err.message || 'Error al preparar el pago. Por favor, intenta de nuevo.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (participationId) {
      createPaymentIntent()
    }
  }, [participationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Obtener el CardElement
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('No se pudo obtener el elemento de tarjeta')
      }

      // Confirmar el pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (stripeError) {
        // Traducir y mejorar mensajes de error de Stripe
        let errorMessage = stripeError.message
        if (stripeError.code === 'card_declined') {
          errorMessage = 'Tu tarjeta fue rechazada. Por favor, verifica los datos o usa otra tarjeta.'
        } else if (stripeError.code === 'insufficient_funds') {
          errorMessage = 'Fondos insuficientes. Por favor, usa otra tarjeta.'
        } else if (stripeError.code === 'expired_card') {
          errorMessage = 'Tu tarjeta ha expirado. Por favor, usa otra tarjeta.'
        } else if (stripeError.code === 'incorrect_cvc') {
          errorMessage = 'El código de seguridad (CVC) es incorrecto.'
        } else if (stripeError.type === 'validation_error') {
          errorMessage = 'Por favor, verifica que todos los datos de la tarjeta sean correctos.'
        }
        throw new Error(errorMessage)
      }

      if (paymentIntent?.status !== 'succeeded') {
        throw new Error('El pago no se completó exitosamente. Por favor, intenta de nuevo.')
      }

      // Confirmar el pago en nuestro backend
      const participation = await eventsAPI.confirmPayment(participationId, paymentIntent.id)

      setSucceeded(true)

      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        onSuccess(participation)
      }, 1500)
    } catch (err: any) {
      console.error('Error procesando pago:', err)

      // Manejo específico de errores del backend
      if (err.status === 404) {
        setError('El servicio de confirmación no está disponible. Tu pago puede haber sido procesado, por favor verifica tu estado.')
      } else if (err.status === 409) {
        setError('Este pago ya ha sido procesado anteriormente.')
      } else {
        setError(err.message || 'Error al procesar el pago')
      }
    } finally {
      setProcessing(false)
    }
  }

  // Estilo de CardElement
  const cardStyle = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  }

  // Calcular información de reembolso
  const getRefundInfo = () => {
    if (!event.refund_policy || event.refund_policy === RefundPolicyType.NO_REFUND) {
      return null
    }

    let info = `Política: ${getRefundPolicyLabel(event.refund_policy)}`

    if (event.refund_deadline_hours) {
      info += ` • Cancelación hasta ${event.refund_deadline_hours}h antes`
    }

    if (event.refund_policy === RefundPolicyType.PARTIAL_REFUND && event.partial_refund_percentage) {
      info += ` • Reembolso del ${event.partial_refund_percentage}%`
    }

    return info
  }

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Pago completado exitosamente!
        </h3>
        <p className="text-gray-600">
          Tu registro al evento ha sido confirmado.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen del evento */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>📅 {new Date(event.start_time).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p>📍 {event.location}</p>
        </div>
      </div>

      {/* Información de precio */}
      <div className="text-center py-4 border-t border-b">
        <p className="text-sm text-gray-600 mb-1">Total a pagar</p>
        <p className="text-3xl font-bold text-gray-900">
          {formatPrice(event.price_cents || 0, event.currency || 'EUR')}
        </p>
      </div>

      {/* Política de reembolso */}
      {getRefundInfo() && (
        <div className="flex items-start space-x-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{getRefundInfo()}</span>
        </div>
      )}

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Información de la tarjeta
          </label>
          <div className="border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            {loading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Preparando pago...</span>
              </div>
            ) : (
              <CardElement
                options={cardStyle}
                onChange={(e) => {
                  if (e.error) {
                    setError(e.error.message)
                  } else {
                    setError(null)
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mensaje de seguridad */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Tu pago está protegido por Stripe. Tu información está segura y encriptada.</span>
        </div>

        {/* Botones */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!stripe || !clientSecret || processing || loading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar {formatPrice(event.price_cents || 0, event.currency || 'EUR')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Componente principal del modal
export default function EventPaymentModal({
  isOpen,
  onClose,
  event,
  participationId,
  onPaymentSuccess,
}: EventPaymentModalProps) {
  if (!isOpen) return null

  if (!stripePromise) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sistema de pagos no configurado
                </h3>
                <p className="text-gray-600">
                  El sistema de pagos no está configurado correctamente. Por favor, contacta al administrador.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Completar Pago
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Formulario con Stripe Elements */}
            <Elements stripe={stripePromise}>
              <PaymentForm
                event={event}
                participationId={participationId}
                onSuccess={onPaymentSuccess}
                onCancel={onClose}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  )
}