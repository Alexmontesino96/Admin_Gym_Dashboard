import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import ChatClient from './ChatClient'

export default async function ChatPage() {
  const session = await auth0.getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  return (
    <MainLayout user={session.user}>
      <div className="h-full -m-8 md:-m-12">
        <ChatClient />
      </div>
    </MainLayout>
  )
} 