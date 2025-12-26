'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { stripeConnectAPI, getStripeConnectStatus, StripeConnectStatus } from '@/lib/api';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function StripeReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkStripeStatus = async () => {
      try {
        // Pequeña espera para que el backend procese el callback
        await new Promise(resolve => setTimeout(resolve, 2000));

        const accountStatus = await stripeConnectAPI.getAccountStatus();
        const connectStatus = getStripeConnectStatus(accountStatus);

        if (connectStatus === StripeConnectStatus.CONNECTED) {
          setStatus('success');
          setMessage('Tu cuenta de Stripe ha sido configurada exitosamente.');
          // Redirigir despues de mostrar el mensaje
          setTimeout(() => {
            router.push('/gimnasio');
          }, 3000);
        } else if (connectStatus === StripeConnectStatus.ONBOARDING) {
          setStatus('pending');
          setMessage('Tu cuenta fue creada pero la verificacion aun no esta completa. Puedes continuar la configuracion desde la pagina del gimnasio.');
        } else {
          setStatus('error');
          setMessage('No se pudo verificar el estado de tu cuenta de Stripe.');
        }
      } catch (err) {
        console.error('Error checking Stripe status:', err);
        setStatus('error');
        setMessage('Ocurrio un error al verificar tu cuenta. Por favor intenta de nuevo.');
      }
    };

    checkStripeStatus();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-8">
          {status === 'loading' && (
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-violet-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verificando configuracion...
                </h2>
                <p className="text-gray-600">
                  Estamos confirmando que tu cuenta de Stripe fue configurada correctamente.
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Stripe configurado exitosamente
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <p className="text-sm text-gray-500">
                  Redirigiendo a la pagina del gimnasio...
                </p>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Configuracion pendiente
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                  onClick={() => router.push('/gimnasio')}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Ir a configuracion
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Error de verificacion
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                  onClick={() => router.push('/gimnasio')}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Volver a configuracion
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
