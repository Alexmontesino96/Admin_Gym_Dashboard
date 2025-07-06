import { auth0 } from '@/lib/auth0'
import Header from '@/components/Header'
import UserProfileClient from '../UserProfileClient'
import { redirect } from 'next/navigation'

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
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={`Perfil de usuario`}
        subtitle="Información del usuario"
        showBackButton={true}
        backHref="/usuarios"
        user={session.user}
        icon="👤"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserProfileClient userId={userIdNum} />
      </div>
    </div>
  )
} 