import { redirect } from 'next/navigation'
import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import WeekEditorClient from './WeekEditorClient'

interface WeekEditorPageProps {
  params: Promise<{ programId: string; week: string }>
}

export default async function WeekEditorPage({ params }: WeekEditorPageProps) {
  const { programId, week } = await params
  const programIdNum = parseInt(programId, 10)
  const weekNum = parseInt(week, 10)

  if (Number.isNaN(programIdNum)) {
    redirect('/training')
  }
  if (Number.isNaN(weekNum) || weekNum < 1) {
    redirect(`/training/programs/${programIdNum}`)
  }

  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <WeekEditorClient programId={programIdNum} week={weekNum} />
    </MainLayout>
  )
}
