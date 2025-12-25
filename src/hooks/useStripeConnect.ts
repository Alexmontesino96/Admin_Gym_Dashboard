import { useState, useEffect, useCallback, useRef } from 'react'
import { apiCall } from '@/lib/api'

export interface StripeConnectionStatus {
  is_connected: boolean
  account_id: string | null
  onboarding_completed: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
}

export interface StripeAccountCreate {
  country: string
  email: string
  business_type: 'individual' | 'company'
}

export interface StripeOnboardingLink {
  url: string
  expires_at: number
}

export function useStripeConnect(gymId?: string) {
  const [status, setStatus] = useState<StripeConnectionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      setError(null)
      const data = await apiCall(
        '/stripe-connect/connection-status',
        { method: 'GET' },
        gymId
      ) as StripeConnectionStatus
      setStatus(data)
      return data
    } catch (err: any) {
      setError(err.message || 'Error obteniendo estado de Stripe')
      throw err
    }
  }, [gymId])

  // Create account
  const createAccount = useCallback(async (data: StripeAccountCreate) => {
    try {
      setIsLoading(true)
      setError(null)
      await apiCall(
        '/stripe-connect/accounts',
        {
          method: 'POST',
          body: JSON.stringify(data)
        },
        gymId
      )
      await fetchStatus()
    } catch (err: any) {
      setError(err.message || 'Error creando cuenta de Stripe')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [gymId, fetchStatus])

  // Get onboarding link
  const getOnboardingLink = useCallback(async (): Promise<StripeOnboardingLink> => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiCall(
        '/stripe-connect/onboarding-link',
        { method: 'GET' },
        gymId
      ) as StripeOnboardingLink
      return data
    } catch (err: any) {
      setError(err.message || 'Error obteniendo link de onboarding')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [gymId])

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return // Ya está en polling

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const currentStatus = await fetchStatus()
        if (currentStatus?.onboarding_completed) {
          stopPolling()
        }
      } catch (err) {
        console.error('Error en polling:', err)
      }
    }, 3000) // Poll cada 3 segundos
  }, [fetchStatus])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  // Fetch inicial
  useEffect(() => {
    if (gymId) {
      fetchStatus()
    }
  }, [fetchStatus, gymId])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  return {
    status,
    isLoading,
    error,
    createAccount,
    getOnboardingLink,
    startPolling,
    stopPolling,
    refetch: fetchStatus
  }
}
