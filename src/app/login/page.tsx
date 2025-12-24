import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Users, Zap } from 'lucide-react'

export default async function LoginPage() {
  const session = await auth0.getSession()

  // Si ya está autenticado, verificar si tiene gimnasio seleccionado
  if (session) {
    const cookieStore = await cookies()
    const selectedGymId = cookieStore.get('selectedGymId')?.value

    // Si no tiene gimnasio seleccionado, ir a select-gym
    if (!selectedGymId || selectedGymId === 'null' || selectedGymId === 'undefined') {
      redirect('/select-gym')
    }

    // Si tiene gimnasio seleccionado, ir al dashboard
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
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-6">
                GymFlow
              </h1>
              <h2 className="text-3xl font-bold text-white mb-6">
                Retención de Miembros. Resuelta.
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed mb-4">
                Tu gimnasio no necesita más software.
              </p>
              <p className="text-xl text-blue-100 leading-relaxed mb-8">
                Necesita una comunidad que conecte.
              </p>

              {/* Triada */}
              <div className="border-t border-white/20 pt-8">
                <p className="text-lg text-white font-semibold mb-2">
                  Stories. Chat. Feed Social.
                </p>
                <p className="text-blue-100">
                  La triada que retiene miembros.
                </p>
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
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                GymFlow
              </h1>
              <p className="text-gray-600 font-semibold">
                Retención de Miembros. Resuelta.
              </p>
            </div>

            {/* Formulario de login */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Bienvenido
                </h2>
              </div>

              {/* Botón de login */}
              <div className="space-y-6">
                <a
                  href="/auth/login?returnTo=%2Fpost-login"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Zap className="h-5 w-5" />
                  <span>Continuar con Auth0</span>
                </a>

                {/* Información adicional */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    2 minutos para configurar. Sin tarjeta.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                © 2025 GymFlow
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 