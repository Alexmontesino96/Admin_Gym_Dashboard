'use client';

import { useState, useRef, useEffect } from 'react';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { StripeConnectStatus } from '@/lib/api';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function StripeStatusIndicator() {
  const { status, accountStatus, isLoading, error } = useStripeConnect();
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Cerrar tooltip al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // No mostrar nada mientras carga inicialmente
  if (isLoading) {
    return (
      <div className="p-2 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  // Determinar el estado visual
  const getStatusConfig = () => {
    if (error) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        pulseColor: 'bg-yellow-500',
        showPulse: true,
        title: 'Error de conexion',
        description: 'No se pudo verificar el estado de Stripe',
        critical: false,
      };
    }

    switch (status) {
      case StripeConnectStatus.CONNECTED:
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          pulseColor: 'bg-green-500',
          showPulse: false,
          title: 'Stripe conectado',
          description: 'Los pagos estan habilitados',
          critical: false,
        };
      case StripeConnectStatus.ONBOARDING:
        return {
          icon: AlertTriangle,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          pulseColor: 'bg-amber-500',
          showPulse: true,
          title: 'Configuracion pendiente',
          description: 'Completa la verificacion de Stripe',
          critical: true,
        };
      case StripeConnectStatus.DISCONNECTED:
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          pulseColor: 'bg-red-500',
          showPulse: true,
          title: 'Stripe desconectado',
          description: 'Los pagos NO funcionan. Accion requerida.',
          critical: true,
        };
      case StripeConnectStatus.NOT_CONFIGURED:
      default:
        return {
          icon: CreditCard,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          pulseColor: 'bg-gray-400',
          showPulse: false,
          title: 'Stripe no configurado',
          description: 'Configura Stripe para aceptar pagos',
          critical: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="relative" ref={tooltipRef}>
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className={`relative p-2 rounded-lg transition-colors ${
          config.critical
            ? 'hover:bg-red-50'
            : 'hover:bg-gray-100'
        }`}
        title={config.title}
      >
        <Icon className={`h-5 w-5 ${config.color}`} />

        {/* Pulse indicator para estados criticos */}
        {config.showPulse && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${config.pulseColor}`}></span>
          </span>
        )}
      </button>

      {/* Tooltip/Dropdown */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className={`${config.bgColor} rounded-xl shadow-lg border ${config.borderColor} overflow-hidden`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-white/50">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${config.color}`} />
                <span className="font-semibold text-gray-900">{config.title}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            </div>

            {/* Detalles */}
            <div className="px-4 py-3 bg-white/30">
              {status === StripeConnectStatus.CONNECTED && accountStatus && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID de cuenta</span>
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                      {accountStatus.stripe_account_id}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cargos</span>
                    <span className={accountStatus.charges_enabled ? 'text-green-600' : 'text-red-600'}>
                      {accountStatus.charges_enabled ? 'Habilitados' : 'Deshabilitados'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Retiros</span>
                    <span className={accountStatus.payouts_enabled ? 'text-green-600' : 'text-red-600'}>
                      {accountStatus.payouts_enabled ? 'Habilitados' : 'Deshabilitados'}
                    </span>
                  </div>
                </div>
              )}

              {config.critical && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-red-800 font-medium">
                    Accion requerida
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {status === StripeConnectStatus.DISCONNECTED
                      ? 'Tu cuenta de Stripe fue desconectada. Los pagos no funcionaran hasta que la reconectes.'
                      : 'Completa la configuracion de Stripe para empezar a recibir pagos.'}
                  </p>
                </div>
              )}

              {/* Accion */}
              <Link
                href="/gimnasio"
                onClick={() => setShowTooltip(false)}
                className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  config.critical
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {config.critical ? 'Configurar ahora' : 'Ver configuracion'}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
