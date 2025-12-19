import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import { Building2, Users, Calendar, BarChart3, Shield, Zap } from 'lucide-react'

export default async function LoginPage() {
  const session = await auth0.getSession()

  // Si ya está autenticado, redirigir al dashboard
  // El middleware manejará la redirección a /select-gym si no hay gimnasio seleccionado
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex min-h-screen">
        {/* Panel izquierdo - Información */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-center relative overflow-hidden">
          {/* Decoraciones de fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-40 -translate-x-40"></div>
          
          <div className="relative z-10">
            {/* Logo y título */}
            <div className="mb-12">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Gym Admin Panel
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Sistema integral de administración para gimnasios modernos
              </p>
            </div>

            {/* Características principales */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Gestión de Usuarios</h3>
                  <p className="text-blue-100">Administra miembros, entrenadores y staff de manera eficiente</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Programación Inteligente</h3>
                  <p className="text-blue-100">Crea horarios, gestiona clases y programa eventos automáticamente</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Análisis en Tiempo Real</h3>
                  <p className="text-blue-100">Obtén insights valiosos sobre el rendimiento de tu gimnasio</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Seguridad Avanzada</h3>
                  <p className="text-blue-100">Autenticación segura y control de acceso granular</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Login */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Header móvil */}
            <div className="lg:hidden text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gym Admin Panel
              </h1>
              <p className="text-gray-600">
                Sistema de administración para gimnasios
              </p>
            </div>

            {/* Formulario de login */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Iniciar Sesión
                </h2>
                <p className="text-gray-600">
                  Accede a tu panel de administración
                </p>
              </div>

              {/* Botón de login */}
              <div className="space-y-6">
                <a
                  href="/auth/login?returnTo=%2Fpost-login"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Zap className="h-5 w-5" />
                  <span>Iniciar Sesión con Auth0</span>
                </a>

                {/* Información adicional */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Utiliza tus credenciales de administrador para acceder
                  </p>
                </div>

                {/* Características rápidas */}
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-sm font-medium text-gray-900 mb-3">¿Qué puedes hacer?</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Gestionar usuarios y membresías</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span>Programar clases y eventos</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Ver estadísticas en tiempo real</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                © 2024 Gym Admin Panel. Sistema seguro y confiable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 