import { redirect } from 'next/navigation'
import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import ProgramOverviewClient from './ProgramOverviewClient'

interface ProgramOverviewPageProps {
  params: Promise<{ programId: string }>
}

export default async function ProgramOverviewPage({ params }: ProgramOverviewPageProps) {
  const { programId } = await params
  const programIdNum = parseInt(programId, 10)

  if (Number.isNaN(programIdNum)) {
    redirect('/training')
  }

  const session = await auth0.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <ProgramOverviewClient programId={programIdNum} />
    </MainLayout>
  )
}
