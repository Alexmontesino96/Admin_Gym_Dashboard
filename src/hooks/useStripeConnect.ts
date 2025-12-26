'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  stripeConnectAPI,
  StripeAccountStatus,
  StripeConnectStatus,
  StripeAccountType,
  getStripeConnectStatus,
} from '@/lib/api';

interface UseStripeConnectOptions {
  autoFetch?: boolean;
  pollingInterval?: number;
}

interface UseStripeConnectReturn {
  // Estado
  status: StripeConnectStatus;
  accountStatus: StripeAccountStatus | null;
  isLoading: boolean;
  error: string | null;
  isPolling: boolean;

  // Acciones
  checkStatus: () => Promise<void>;
  createAccount: (country?: string, accountType?: StripeAccountType) => Promise<boolean>;
  startOnboarding: () => Promise<void>;
  openStripeDashboard: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

const POLLING_INTERVAL = 5000; // 5 segundos

export function useStripeConnect(options: UseStripeConnectOptions = {}): UseStripeConnectReturn {
  const { autoFetch = true, pollingInterval = POLLING_INTERVAL } = options;

  const [status, setStatus] = useState<StripeConnectStatus>(StripeConnectStatus.NOT_CONFIGURED);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stripeWindowRef = useRef<Window | null>(null);

  // Verificar estado actual
  const checkStatus = useCallback(async () => {
    try {
      setError(null);
      const result = await stripeConnectAPI.getAccountStatus();
      setAccountStatus(result);
      setStatus(getStripeConnectStatus(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al verificar estado de Stripe';
      setError(message);
      console.error('Error checking Stripe status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear cuenta
  const createAccount = useCallback(async (
    country: string = 'US',
    accountType: StripeAccountType = StripeAccountType.STANDARD
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await stripeConnectAPI.createAccount(country, accountType);
      await checkStatus();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear cuenta de Stripe';
      setError(message);
      console.error('Error creating Stripe account:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkStatus]);

  // Detener polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Iniciar polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      return; // Ya hay un polling activo
    }

    setIsPolling(true);

    pollingIntervalRef.current = setInterval(async () => {
      // Verificar si la ventana de Stripe fue cerrada
      if (stripeWindowRef.current && stripeWindowRef.current.closed) {
        stripeWindowRef.current = null;
      }

      try {
        const result = await stripeConnectAPI.getAccountStatus();
        setAccountStatus(result);
        const newStatus = getStripeConnectStatus(result);
        setStatus(newStatus);

        // Si el onboarding se completo, detener polling y cerrar ventana
        if (newStatus === StripeConnectStatus.CONNECTED) {
          stopPolling();
          if (stripeWindowRef.current) {
            stripeWindowRef.current.close();
            stripeWindowRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error during polling:', err);
      }
    }, pollingInterval);
  }, [pollingInterval, stopPolling]);

  // Iniciar onboarding
  const startOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Si no hay cuenta, crear una primero
      if (status === StripeConnectStatus.NOT_CONFIGURED) {
        const created = await createAccount();
        if (!created) {
          return;
        }
      }

      // Obtener link de onboarding
      const { url } = await stripeConnectAPI.getOnboardingLink();

      // Abrir ventana de Stripe
      stripeWindowRef.current = window.open(
        url,
        'stripe-onboarding',
        'width=800,height=900,scrollbars=yes,resizable=yes'
      );

      // Si no se pudo abrir la ventana (bloqueador de popups), intentar con redirect
      if (!stripeWindowRef.current) {
        // Fallback: redirigir en la misma ventana
        window.location.href = url;
        return;
      }

      // Iniciar polling para detectar cuando complete el onboarding
      startPolling();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar configuracion de Stripe';
      setError(message);
      console.error('Error starting Stripe onboarding:', err);
    } finally {
      setIsLoading(false);
    }
  }, [status, createAccount, startPolling]);

  // Abrir dashboard de Stripe
  const openStripeDashboard = useCallback(async () => {
    try {
      setError(null);
      const { url } = await stripeConnectAPI.getDashboardLink();
      window.open(url, '_blank');
    } catch (err) {
      // Si el endpoint no existe, usar el dashboard general de Stripe
      if (accountStatus?.stripe_account_id) {
        window.open('https://dashboard.stripe.com', '_blank');
      } else {
        const message = err instanceof Error ? err.message : 'Error al abrir dashboard de Stripe';
        setError(message);
      }
    }
  }, [accountStatus]);

  // Cargar estado inicial
  useEffect(() => {
    if (autoFetch) {
      checkStatus();
    } else {
      setIsLoading(false);
    }
  }, [autoFetch, checkStatus]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    status,
    accountStatus,
    isLoading,
    error,
    isPolling,
    checkStatus,
    createAccount,
    startOnboarding,
    openStripeDashboard,
    startPolling,
    stopPolling,
  };
}
