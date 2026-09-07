import { redirect } from 'next/navigation'
import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import DayEditorClient from './DayEditorClient'

interface DayEditorPageProps {
  params: Promise<{ programId: string; dayNumber: string }>
}

export default async function DayEditorPage({ params }: DayEditorPageProps) {
  const { programId, dayNumber } = await params
  const programIdNum = parseInt(programId, 10)
  const dayNumberNum = parseInt(dayNumber, 10)

  if (Number.isNaN(programIdNum)) {
    redirect('/training')
  }
  if (Number.isNaN(dayNumberNum) || dayNumberNum < 1) {
    redirect(`/training/programs/${programIdNum}`)
  }

  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <DayEditorClient programId={programIdNum} dayNumber={dayNumberNum} />
    </MainLayout>
  )
}
