import Header from '@/components/Header'
import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import WeeklyTemplateClient from './WeeklyTemplateClient'

export default async function PlantillaPage(){
  const session = await auth0.getSession()
  if(!session){redirect('/auth/login')}

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Plantilla semanal" subtitle="Diseña tu calendario base" user={session.user} icon="🗓️" showBackButton backHref="/schedule" />
      <div className="h-[calc(100vh-120px)]">
        <WeeklyTemplateClient />
      </div>
    </div>
  )
} 