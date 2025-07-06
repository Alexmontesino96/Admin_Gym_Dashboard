import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import GymSelectorClient from './GymSelectorClient'
import { LogOut } from 'lucide-react'

export default async function SelectGymPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header con logout */}
      <div className="absolute top-4 right-4">
        <a
          href="/auth/logout"
          className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </a>
      </div>

      {/* Avatar del usuario */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200">
          {session.user.picture && (
            <img
              src={session.user.picture}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-gray-700">
            {session.user.name || session.user.email}
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido!
            </h1>
            <p className="text-gray-600 text-lg">
              Selecciona el gimnasio que deseas administrar
            </p>
          </div>

          <GymSelectorClient user={session.user} />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-sm text-gray-500 text-center">
          Panel de Administración de Gimnasios
        </p>
      </div>
    </div>
  )
} 