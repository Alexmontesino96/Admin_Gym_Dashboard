import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import GymSelectorClient from './GymSelectorClient'

export default async function SelectGymPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {session.user.name}!
          </h1>
          <p className="text-gray-600">
            Selecciona el gimnasio que deseas administrar
          </p>
        </div>

        <GymSelectorClient user={session.user} />
      </div>
    </div>
  )
} 