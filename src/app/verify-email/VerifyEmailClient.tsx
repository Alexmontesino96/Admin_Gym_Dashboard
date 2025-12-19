'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  CheckCircle,
  Building2,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

export default function VerifyEmailClient() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || ''
  const gymName = searchParams?.get('gym') || ''
  const gymType = searchParams?.get('type') || 'gym'

  // Módulos según tipo
  const modules = gymType === 'personal_trainer'
    ? [
        'Usuarios',
        'Chat',
        'Salud',
        'Nutrición',
        'Facturación',
        'Citas',
        'Progreso',
        'Encuestas'
      ]
    : [
        'Usuarios',
        'Horarios',
        'Eventos',
        'Chat',
        'Facturación',
        'Salud',
        'Nutrición',
        'Encuestas',
        'Equipamiento'
      ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
          {/* Icono de Éxito */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Registro Exitoso!
            </h1>
            <p className="text-lg text-gray-600">
              Tu gimnasio ha sido creado correctamente
            </p>
          </div>

          {/* Información del Gimnasio */}
          {gymName && (
            <div className={`bg-gradient-to-r rounded-xl p-6 mb-8 border ${
              gymType === 'personal_trainer'
                ? 'from-green-50 to-emerald-50 border-green-200'
                : 'from-blue-50 to-indigo-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-3 mb-2">
                <Building2 className={`h-6 w-6 ${
                  gymType === 'personal_trainer' ? 'text-green-600' : 'text-blue-600'
                }`} />
                <h2 className="text-lg font-semibold text-gray-900">
                  {gymName}
                </h2>
              </div>
              <p className="text-sm text-gray-600 ml-9">
                {gymType === 'personal_trainer'
                  ? 'Tu espacio de trabajo está listo para empezar'
                  : 'Tu gimnasio está listo para empezar'
                }
              </p>
            </div>
          )}

          {/* Instrucciones */}
          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Verifica tu Email
                </h3>
                <p className="text-sm text-gray-600">
                  Hemos enviado un correo de verificación a{' '}
                  <span className="font-medium text-gray-900">{email}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Haz clic en el enlace del correo para activar tu cuenta y poder iniciar sesión.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¿Qué sigue?
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>1. Verifica tu email</li>
                  <li>2. Inicia sesión con tus credenciales</li>
                  <li>3. Completa la configuración de tu gimnasio</li>
                  <li>4. Comienza a agregar miembros y clases</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <RefreshCw className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                  ¿No recibiste el email?
                </h4>
                <p className="text-sm text-yellow-800">
                  Revisa tu carpeta de spam o correo no deseado. Si aún no lo encuentras,
                  contacta a soporte para reenviar el correo de verificación.
                </p>
              </div>
            </div>
          </div>

          {/* Botón de Acción */}
          <Link
            href="/login"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <span>Ir a Iniciar Sesión</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Módulos Activados */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {gymType === 'personal_trainer'
              ? 'Módulos Activados en tu Espacio de Trabajo:'
              : 'Módulos Activados en tu Gimnasio:'
            }
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {modules.map((module) => (
              <div
                key={module}
                className="flex items-center space-x-2 text-sm text-gray-700"
              >
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{module}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@gymflow.com" className="text-blue-600 hover:text-blue-700 font-medium">
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
