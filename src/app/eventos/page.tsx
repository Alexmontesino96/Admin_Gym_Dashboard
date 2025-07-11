import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import EventosPageClient from './EventosPageClient'

export default async function EventosPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <MainLayout user={session.user}>
      <EventosPageClient />
    </MainLayout>
  )
} 