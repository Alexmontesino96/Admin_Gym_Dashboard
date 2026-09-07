import { redirect } from 'next/navigation'
import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import TrainingProgramsClient from './TrainingProgramsClient'

export default async function TrainingProgramsPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <TrainingProgramsClient />
    </MainLayout>
  )
}
