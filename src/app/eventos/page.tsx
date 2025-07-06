import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import EventsClient from './events-client'
import { redirect } from 'next/navigation'

export default async function EventosPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <div className="space-y-10">
        <EventsClient />
      </div>
    </MainLayout>
  )
} 