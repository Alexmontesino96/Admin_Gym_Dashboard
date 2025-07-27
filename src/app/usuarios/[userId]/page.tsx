import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import UserProfileClient from '../UserProfileClient'
import { redirect } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface UserProfilePageProps {
  params: Promise<{ userId: string }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  // Await params first according to Next.js 15 guidelines
  const { userId } = await params
  const userIdNum = parseInt(userId)
  if (isNaN(userIdNum)) {
    redirect('/usuarios')
  }

  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <div className="space-y-6">
        {/* Header con navegación hacia atrás */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/usuarios"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="font-medium">Volver a Usuarios</span>
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                👤
              </span>
              Perfil de Usuario
            </h1>
            <p className="text-lg text-gray-600">Información detallada del usuario</p>
          </div>
        </div>

        {/* Contenido del perfil */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <UserProfileClient userId={userIdNum} />
        </div>
      </div>
    </MainLayout>
  )
} 