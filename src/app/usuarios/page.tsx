import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import UsersClient from './users-client'
import { redirect } from 'next/navigation'

export default async function UsuariosPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <div className="space-y-10">
        <UsersClient />
      </div>
    </MainLayout>
  )
} 