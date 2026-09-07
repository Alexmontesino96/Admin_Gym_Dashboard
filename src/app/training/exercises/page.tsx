import { redirect } from 'next/navigation'
import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import ExerciseLibraryClient from './ExerciseLibraryClient'

export default async function ExerciseLibraryPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <ExerciseLibraryClient />
    </MainLayout>
  )
}
