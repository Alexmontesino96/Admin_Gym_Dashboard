import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import CreateSurveyClient from './CreateSurveyClient'

export const metadata: Metadata = {
  title: 'Crear Encuesta | Dashboard',
  description: 'Crear nueva encuesta',
}

export default async function CreateSurveyPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <CreateSurveyClient />
    </MainLayout>
  )
}