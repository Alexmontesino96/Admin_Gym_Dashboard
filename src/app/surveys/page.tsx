import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import SurveysClient from './SurveysClient'

export const metadata: Metadata = {
  title: 'Encuestas | Dashboard',
  description: 'Gestión de encuestas y formularios',
}

export default async function SurveysPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <SurveysClient />
    </MainLayout>
  )
}