import MainLayout from '@/components/MainLayout'
import { auth0 } from '@/lib/auth0'
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'

export default async function HorariosLayout({ children }: { children: ReactNode }){
  const session = await auth0.getSession()
  if(!session){ redirect('/auth/login') }

  return (
    <MainLayout user={session.user}>
      <div className="space-y-8">
        {children}
      </div>
    </MainLayout>
  )
} 