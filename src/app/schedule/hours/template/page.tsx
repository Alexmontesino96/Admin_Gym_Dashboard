import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import { redirect } from 'next/navigation'
import WeeklyTemplateClient from './WeeklyTemplateClient'

export default async function HoursTemplatePage() {
  const session = await auth0.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full">
            <span className="text-2xl">🕒</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Plantilla de Horarios</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Configura los horarios base de tu gimnasio para cada día de la semana.
          </p>
        </div>
        
        <WeeklyTemplateClient />
      </div>
    </MainLayout>
  )
} 