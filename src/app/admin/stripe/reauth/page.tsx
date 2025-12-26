'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { stripeConnectAPI } from '@/lib/api';
import { Clock, RefreshCw, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function StripeReauthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetNewLink = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener nuevo link de onboarding
      const { url } = await stripeConnectAPI.getOnboardingLink();

      // Redirigir al nuevo link
      window.location.href = url;
    } catch (err) {
      console.error('Error getting new onboarding link:', err);
      setError('No se pudo obtener un nuevo link. Por favor intenta desde la pagina de configuracion.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-200 p-8">
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full">
                <Clock className="w-10 h-10 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                El enlace ha expirado
              </h2>
              <p className="text-gray-600 mb-6">
                El enlace de configuracion de Stripe tiene una validez de 1 hora y ha expirado.
                No te preocupes, puedes obtener uno nuevo facilmente.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGetNewLink}
                disabled={isLoading}
                className="w-full group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Obteniendo enlace...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Obtener nuevo enlace
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/gimnasio')}
                className="w-full group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Volver a configuracion
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Si continuas teniendo problemas, contacta a soporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
