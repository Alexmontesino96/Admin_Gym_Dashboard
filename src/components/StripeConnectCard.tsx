'use client';

import { useStripeConnect } from '@/hooks/useStripeConnect';
import { StripeConnectStatus } from '@/lib/api';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Wallet,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function StripeConnectCard() {
  const {
    status,
    accountStatus,
    isLoading,
    error,
    isPolling,
    startOnboarding,
    openStripeDashboard,
    checkStatus,
  } = useStripeConnect();

  // Estado: Cargando
  if (isLoading && !isPolling) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Configuracion de Pagos</h2>
          </div>
        </div>
        <div className="p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando estado de Stripe...</span>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Error
  if (error && !isPolling) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Error de Configuracion</h2>
          </div>
        </div>
        <div className="p-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => checkStatus()}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Estado: No configurado
  if (status === StripeConnectStatus.NOT_CONFIGURED) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Configuracion de Pagos</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <Wallet className="w-8 h-8 text-violet-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Stripe no configurado
              </h3>
              <p className="text-gray-600 mb-6">
                Conecta tu cuenta de Stripe para empezar a aceptar pagos de eventos y membresias.
                La configuracion toma aproximadamente 5-10 minutos.
              </p>
              <button
                onClick={startOnboarding}
                disabled={isLoading}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    Conectar Stripe
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Onboarding en progreso
  if (status === StripeConnectStatus.ONBOARDING) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Configuracion Pendiente</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                {isPolling && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Completa la configuracion
              </h3>
              <p className="text-gray-600 mb-4">
                Tu cuenta de Stripe esta creada pero necesitas completar la verificacion
                para empezar a aceptar pagos.
              </p>
              {accountStatus?.stripe_account_id && (
                <p className="text-sm text-gray-500 mb-4">
                  ID de cuenta: <code className="bg-gray-100 px-2 py-0.5 rounded">{accountStatus.stripe_account_id}</code>
                </p>
              )}
              {isPolling && (
                <div className="flex items-center gap-2 text-amber-600 text-sm mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Esperando que completes la configuracion en Stripe...
                </div>
              )}
              <button
                onClick={startOnboarding}
                disabled={isLoading}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Abriendo...
                  </>
                ) : (
                  <>
                    Continuar configuracion
                    <ExternalLink className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Conectado
  if (status === StripeConnectStatus.CONNECTED) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Stripe Configurado</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tu cuenta esta lista para recibir pagos
              </h3>

              {/* Detalles de la cuenta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {accountStatus?.stripe_account_id && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">ID de cuenta</p>
                    <code className="text-sm font-mono text-gray-900">
                      {accountStatus.stripe_account_id}
                    </code>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Estado</p>
                  <div className="flex items-center gap-2">
                    {accountStatus?.charges_enabled ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium text-green-700">Cargos habilitados</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-sm font-medium text-yellow-700">Cargos pendientes</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Retiros</p>
                  <div className="flex items-center gap-2">
                    {accountStatus?.payouts_enabled ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium text-green-700">Habilitados</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-sm font-medium text-yellow-700">Pendientes</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Tipo de cuenta</p>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {accountStatus?.account_type || 'Standard'}
                  </span>
                </div>
              </div>

              <button
                onClick={openStripeDashboard}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Abrir Dashboard de Stripe
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Desconectado
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Cuenta Desconectada</h2>
        </div>
      </div>
      <div className="p-8">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tu cuenta de Stripe fue desconectada
            </h3>
            <p className="text-gray-600 mb-6">
              La conexion con tu cuenta de Stripe se ha perdido. Esto puede ocurrir si
              revocaste el acceso desde el dashboard de Stripe. Necesitas crear una nueva
              cuenta para volver a aceptar pagos.
            </p>
            <button
              onClick={startOnboarding}
              disabled={isLoading}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  Crear nueva cuenta
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
