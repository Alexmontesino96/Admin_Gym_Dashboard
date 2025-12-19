import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import TemplatesClient from './TemplatesClient'

export const metadata: Metadata = {
  title: 'Plantillas de Encuestas | Dashboard',
  description: 'Gestión de plantillas de encuestas',
}

export default async function TemplatesPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <TemplatesClient />
    </MainLayout>
  )
}