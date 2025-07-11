import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import ChatPageClient from './ChatPageClient'

export default async function ChatPage() {
  const session = await auth0.getSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <MainLayout user={session.user}>
      <ChatPageClient />
    </MainLayout>
  )
} 